import { stat } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { app, BrowserWindow, dialog, ipcMain, nativeTheme, shell } from 'electron'
import type {
  AppSettings,
  ConvertRequest,
  EncodeKind,
  FfmpegStatus,
  JobOutput,
  JobProgress,
  Preset,
  QueueFile,
  ThemeMode,
} from '../shared/types'
import { BOTH_CRF } from '../shared/types'
import { activeEncoder, convert, locate, outputPathFor, probe, type RunHandle } from './ffmpeg'
import * as shutdown from './shutdown'
import * as store from './store'

let mainWindow: BrowserWindow | null = null
let ffmpeg: FfmpegStatus = {
  available: false,
  path: null,
  version: null,
  videoEncoder: 'libx264',
  hardware: false,
}

/** The job currently encoding, kept so Cancel has something to reach. */
let active: RunHandle | null = null
let stopRequested = false

const VIDEO_EXTENSIONS = new Set([
  '.mp4',
  '.mov',
  '.mkv',
  '.webm',
  '.avi',
  '.m4v',
  '.wmv',
  '.flv',
  '.mts',
  '.m2ts',
  '.mpg',
  '.mpeg',
])

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1040,
    height: 760,
    minWidth: 880,
    minHeight: 620,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../build/icon.png'),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#08080a' : '#e9e9ec',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // The renderer only draws. Every file and process action is an IPC call
      // below, so it never needs Node or direct disk reach.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow?.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function send(channel: string, payload: unknown): void {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload)
}

/** Builds the queue row for one path, probing it so the UI can describe it. */
async function describe(path: string): Promise<QueueFile> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const name = basename(path)

  let sizeBytes = 0
  try {
    const info = await stat(path)
    sizeBytes = info.size
  } catch {
    return { id, path, name, sizeBytes: 0, info: null, error: 'file not found' }
  }

  try {
    return { id, path, name, sizeBytes, info: await probe(path), error: null }
  } catch (err) {
    return {
      id,
      path,
      name,
      sizeBytes,
      info: null,
      error: err instanceof Error ? err.message : 'unreadable',
    }
  }
}

function registerIpc(): void {
  ipcMain.handle('app:info', () => ({ version: app.getVersion() }))
  ipcMain.handle('ffmpeg:status', (): FfmpegStatus => ffmpeg)

  ipcMain.handle('files:pick', async (): Promise<QueueFile[]> => {
    const result = await dialog.showOpenDialog({
      title: 'Choose clips',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Video', extensions: [...VIDEO_EXTENSIONS].map((e) => e.slice(1)) }],
    })
    if (result.canceled) return []
    return Promise.all(result.filePaths.map(describe))
  })

  // Drag and drop hands over paths from the renderer, so the extension is
  // checked here rather than trusted.
  ipcMain.handle('files:add', async (_e, paths: unknown): Promise<QueueFile[]> => {
    if (!Array.isArray(paths)) return []
    const accepted = paths
      .filter((p): p is string => typeof p === 'string')
      .filter((p) => VIDEO_EXTENSIONS.has(p.slice(p.lastIndexOf('.')).toLowerCase()))
    return Promise.all(accepted.map(describe))
  })

  ipcMain.handle('dir:pick', async (): Promise<string | null> => {
    const result = await dialog.showOpenDialog({
      title: 'Output folder',
      properties: ['openDirectory', 'createDirectory'],
    })
    return result.canceled ? null : (result.filePaths[0] ?? null)
  })

  ipcMain.handle('convert:start', async (_e, request: ConvertRequest): Promise<void> => {
    if (!ffmpeg.available) return

    const preset: Preset =
      request.preset === 'transfer' ? 'transfer' : request.preset === 'both' ? 'both' : 'premiere'
    const stages: EncodeKind[] = preset === 'both' ? ['premiere', 'transfer'] : [preset]
    // 'both' pins its own quality, so neither copy ends up the weaker one.
    // Otherwise clamped here as well, because this becomes an ffmpeg argument.
    const crf = preset === 'both' ? BOTH_CRF : Math.min(30, Math.max(12, Math.round(request.crf)))
    const outputDir = typeof request.outputDir === 'string' ? request.outputDir : ''

    stopRequested = false
    // An encode that gets suspended halfway leaves a truncated file, so the
    // machine is pinned awake for the whole run and released in the finally
    // below even if something throws.
    shutdown.holdAwake()

    try {
      for (const entry of request.files) {
        if (stopRequested) {
          send('convert:progress', {
            id: entry.id,
            state: 'cancelled',
            percent: 0,
            speed: null,
            stage: null,
            outputs: [],
            message: null,
          } satisfies JobProgress)
          continue
        }

        let durationSec = 0
        try {
          durationSec = (await probe(entry.path)).durationSec
        } catch {
          // Duration only drives the percentage, so a failure here still lets
          // the encode run with an indeterminate bar.
        }

        const outputs: JobOutput[] = []
        let failure: string | null = null
        let cancelled = false
        let percent = 0

        for (let i = 0; i < stages.length; i += 1) {
          const kind = stages[i]
          if (stopRequested) {
            cancelled = true
            break
          }

          // Each stage owns an equal slice of the bar, so 'both' fills once
          // from end to end rather than resetting halfway.
          const base = i / stages.length
          const span = 1 / stages.length
          const stage = stages.length > 1 ? kind : null

          send('convert:progress', {
            id: entry.id,
            state: 'running',
            percent: base,
            speed: null,
            stage,
            outputs,
            message: null,
          } satisfies JobProgress)

          let speed: number | null = null

          const handle = convert(
            entry.path,
            kind,
            crf,
            outputDir,
            durationSec,
            (nextPercent, nextSpeed) => {
              // A negative percent is the speed only signal from the parser.
              if (nextPercent >= 0) percent = base + nextPercent * span
              if (nextSpeed !== null) speed = nextSpeed
              send('convert:progress', {
                id: entry.id,
                state: 'running',
                percent,
                speed,
                stage,
                outputs,
                message: null,
              } satisfies JobProgress)
            },
          )

          active = handle
          const result = await handle.promise
          active = null

          if (result.cancelled) {
            cancelled = true
            break
          }
          if (!result.ok) {
            failure = result.message
            break
          }

          outputs.push({
            kind,
            path: outputPathFor(entry.path, kind, outputDir),
            bytes: result.bytes ?? 0,
          })
          percent = base + span
        }

        send('convert:progress', {
          id: entry.id,
          state: cancelled ? 'cancelled' : failure ? 'failed' : 'done',
          percent: cancelled || failure ? percent : 1,
          speed: null,
          stage: null,
          outputs,
          message: failure,
        } satisfies JobProgress)
      }
    } finally {
      shutdown.releaseAwake()
    }

    send('convert:finished', null)
  })

  ipcMain.handle('convert:cancel', () => {
    stopRequested = true
    active?.cancel()
  })

  ipcMain.handle('shutdown:arm', (_e, seconds: number) => shutdown.arm(seconds))
  ipcMain.handle('shutdown:cancel', () => shutdown.cancel())
  ipcMain.handle('shutdown:status', () => shutdown.status())

  ipcMain.handle('shell:reveal', (_e, path: unknown) => {
    if (typeof path === 'string' && path) shell.showItemInFolder(path)
  })

  ipcMain.handle('settings:get', (): AppSettings => store.read())

  ipcMain.handle('settings:setTheme', (_e, mode: ThemeMode) => {
    nativeTheme.themeSource = mode
    return store.write({ theme: mode })
  })

  ipcMain.handle('settings:setPreset', (_e, preset: Preset) => store.write({ preset }))
  ipcMain.handle('settings:setCrf', (_e, crf: number) => store.write({ crf }))
  ipcMain.handle('settings:setOutputDir', (_e, outputDir: string) => store.write({ outputDir }))
}

app.whenReady().then(async () => {
  const settings = store.read()
  nativeTheme.themeSource = settings.theme

  registerIpc()
  createWindow()

  const found = await locate()
  const enc = activeEncoder()
  ffmpeg = {
    available: found.path !== null,
    path: found.path,
    version: found.version,
    videoEncoder: enc,
    hardware: enc !== 'libx264',
  }
  send('ffmpeg:status', ffmpeg)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  active?.cancel()
  if (process.platform !== 'darwin') app.quit()
})
