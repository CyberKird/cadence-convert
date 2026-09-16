import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type {
  AppSettings,
  ConvertRequest,
  FfmpegStatus,
  JobProgress,
  Preset,
  QueueFile,
  ShutdownStatus,
  ThemeMode,
  UpdateStatus,
  VideoEncoder,
} from '../shared/types'

/**
 * The only surface the renderer gets. Each call is a named message the main
 * process validates. No channel names, no ipcRenderer, no Node reach through
 * this bridge.
 */
const api = {
  getAppInfo: (): Promise<{ version: string }> => ipcRenderer.invoke('app:info'),
  getFfmpegStatus: (): Promise<FfmpegStatus> => ipcRenderer.invoke('ffmpeg:status'),
  onFfmpegStatus: (cb: (s: FfmpegStatus) => void): (() => void) => {
    const listener = (_e: unknown, s: FfmpegStatus): void => cb(s)
    ipcRenderer.on('ffmpeg:status', listener)
    return () => ipcRenderer.removeListener('ffmpeg:status', listener)
  },

  pickFiles: (): Promise<QueueFile[]> => ipcRenderer.invoke('files:pick'),
  addFiles: (paths: string[]): Promise<QueueFile[]> => ipcRenderer.invoke('files:add', paths),
  /**
   * A dropped File carries no usable path under sandboxing. This is the
   * supported way to recover one, and it stays in preload so the renderer
   * never touches an Electron module.
   */
  pathForFile: (file: File): string => webUtils.getPathForFile(file),

  pickOutputDir: (): Promise<string | null> => ipcRenderer.invoke('dir:pick'),
  reveal: (path: string): Promise<void> => ipcRenderer.invoke('shell:reveal', path),

  startConvert: (request: ConvertRequest): Promise<void> =>
    ipcRenderer.invoke('convert:start', request),
  cancelConvert: (): Promise<void> => ipcRenderer.invoke('convert:cancel'),
  onProgress: (cb: (p: JobProgress) => void): (() => void) => {
    const listener = (_e: unknown, p: JobProgress): void => cb(p)
    ipcRenderer.on('convert:progress', listener)
    return () => ipcRenderer.removeListener('convert:progress', listener)
  },
  onFinished: (cb: () => void): (() => void) => {
    const listener = (): void => cb()
    ipcRenderer.on('convert:finished', listener)
    return () => ipcRenderer.removeListener('convert:finished', listener)
  },

  armShutdown: (seconds: number): Promise<ShutdownStatus> =>
    ipcRenderer.invoke('shutdown:arm', seconds),
  cancelShutdown: (): Promise<ShutdownStatus> => ipcRenderer.invoke('shutdown:cancel'),
  getShutdownStatus: (): Promise<ShutdownStatus> => ipcRenderer.invoke('shutdown:status'),

  getUpdateStatus: (): Promise<UpdateStatus> => ipcRenderer.invoke('update:status'),
  checkUpdate: (): Promise<UpdateStatus> => ipcRenderer.invoke('update:check'),
  downloadUpdate: (): Promise<UpdateStatus> => ipcRenderer.invoke('update:download'),
  installUpdate: (): Promise<void> => ipcRenderer.invoke('update:install'),
  onUpdateStatus: (cb: (s: UpdateStatus) => void): (() => void) => {
    const listener = (_e: unknown, s: UpdateStatus): void => cb(s)
    ipcRenderer.on('update:status', listener)
    return () => ipcRenderer.removeListener('update:status', listener)
  },

  getDetectedEncoder: (): Promise<VideoEncoder> => ipcRenderer.invoke('encoder:detected'),

  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  updateSettings: (patch: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:update', patch),
  setTheme: (mode: ThemeMode): Promise<AppSettings> => ipcRenderer.invoke('settings:setTheme', mode),
  setPreset: (preset: Preset): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:setPreset', preset),
  setCrf: (crf: number): Promise<AppSettings> => ipcRenderer.invoke('settings:setCrf', crf),
  setOutputDir: (dir: string): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:setOutputDir', dir),
}

export type CadenceConvertApi = typeof api

contextBridge.exposeInMainWorld('api', api)
