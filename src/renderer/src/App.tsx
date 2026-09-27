import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type {
  AppSettings,
  FfmpegStatus,
  JobProgress,
  Preset,
  QueueFile,
  ShutdownStatus,
  ThemeMode,
  UpdateStatus,
  VideoEncoder,
} from '../../shared/types'
import { resolveLanguage, translator } from '../../shared/i18n'
import { duration } from './format'
import { I18nContext, type I18n } from './i18n'
import { EmptyState } from './components/EmptyState'
import { Inspector } from './components/Inspector'
import { QueueRow } from './components/QueueRow'
import { Settings } from './components/Settings'
import { TitleBar } from './components/TitleBar'
import { AlertGlyph, PlusGlyph } from './components/indicators'

/** How long a removed row takes to fold away before it leaves the list. */
const LEAVE_MS = 260

export function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [ffmpeg, setFfmpeg] = useState<FfmpegStatus>({
    available: true,
    path: null,
    version: null,
    videoEncoder: 'libx264',
    hardware: false,
  })
  const [version, setVersion] = useState('')
  const [locale, setLocale] = useState(navigator.language)

  const [files, setFiles] = useState<QueueFile[]>([])
  const [jobs, setJobs] = useState<Record<string, JobProgress>>({})
  const [busy, setBusy] = useState(false)
  const [leaving, setLeaving] = useState<Set<string>>(new Set())
  const [drag, setDrag] = useState<{ count: number } | null>(null)

  const [view, setView] = useState<'queue' | 'settings'>('queue')
  const [update, setUpdate] = useState<UpdateStatus>({
    state: 'idle',
    version: null,
    percent: 0,
    message: null,
  })
  const [detected, setDetected] = useState<VideoEncoder | null>(null)
  const [dark, setDark] = useState(false)

  const [shutdown, setShutdown] = useState<ShutdownStatus>({ armed: false, at: null })
  const [now, setNow] = useState(() => Date.now())

  // Drag events fire for every child element, so a depth counter is what keeps
  // the veil from flickering as the pointer crosses the rows underneath.
  const dragDepth = useRef(0)

  const applyTheme = useCallback((mode: ThemeMode) => {
    const resolved =
      mode === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode
    document.documentElement.dataset.theme = resolved
    setDark(resolved === 'dark')
    void window.api.setChrome(resolved)
  }, [])

  const applyMotion = (animations: boolean): void => {
    // Windows reports reduced motion whenever its own animation effects are
    // off, which is a performance preference far more often than a motion
    // one. The app follows its own setting rather than that media query.
    document.documentElement.dataset.motion = animations ? 'full' : 'reduced'
  }

  useEffect(() => {
    window.api.getSettings().then((s) => {
      setSettings(s)
      applyTheme(s.theme)
      applyMotion(s.animations)
    })
    window.api.getAppInfo().then((i) => setVersion(i.version))
    window.api.getLocale().then((l) => l && setLocale(l))
    window.api.getFfmpegStatus().then(setFfmpeg)
    window.api.getShutdownStatus().then(setShutdown)
    window.api.getUpdateStatus().then(setUpdate)
    window.api.getDetectedEncoder().then(setDetected)

    const offStatus = window.api.onFfmpegStatus(setFfmpeg)
    const offProgress = window.api.onProgress((p) => setJobs((prev) => ({ ...prev, [p.id]: p })))
    const offDone = window.api.onFinished(() => setBusy(false))
    const offUpdate = window.api.onUpdateStatus(setUpdate)
    return () => {
      offStatus()
      offProgress()
      offDone()
      offUpdate()
    }
  }, [applyTheme])

  // A 'system' theme has to follow Windows while the app is open, not only at launch.
  useEffect(() => {
    if (settings?.theme !== 'system') return
    const query = matchMedia('(prefers-color-scheme: dark)')
    const onChange = (): void => applyTheme('system')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [settings?.theme, applyTheme])

  // Ticks only while a timer is armed, so an idle window is never waking up
  // to redraw a clock nobody is watching.
  useEffect(() => {
    if (!shutdown.armed) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [shutdown.armed])

  const i18n = useMemo<I18n>(() => {
    const systemLang = resolveLanguage('system', locale)
    const lang = resolveLanguage(settings?.language ?? 'system', locale)
    return { t: translator(lang), lang, systemLang }
  }, [settings?.language, locale])

  useEffect(() => {
    document.documentElement.lang = i18n.lang
  }, [i18n.lang])

  /**
   * Wraps a state change in a view transition when motion is on. flushSync
   * makes React commit inside the callback, so the browser snapshots the real
   * after state rather than the one before it.
   */
  const transition = useCallback(
    (kind: 'view' | 'theme', change: () => void, origin?: HTMLElement | null) => {
      const root = document.documentElement
      if (root.dataset.motion === 'reduced' || !document.startViewTransition) {
        change()
        return
      }
      root.dataset.vt = kind
      const vt = document.startViewTransition(() => flushSync(change))
      if (kind === 'theme' && origin) {
        const box = origin.getBoundingClientRect()
        const x = box.left + box.width / 2
        const y = box.top + box.height / 2
        const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
        void vt.ready.then(() => {
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
            {
              duration: 680,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          )
        })
      }
      void vt.finished.finally(() => delete root.dataset.vt)
    },
    [],
  )

  const patchSettings = useCallback(
    (next: Partial<AppSettings>) => {
      void window.api.updateSettings(next).then((saved) => {
        setSettings(saved)
        applyMotion(saved.animations)
        if (next.theme) applyTheme(saved.theme)
      })
    },
    [applyTheme],
  )

  const setTheme = useCallback(
    (mode: ThemeMode, origin: HTMLElement | null) => {
      transition('theme', () => applyTheme(mode), origin)
      patchSettings({ theme: mode })
    },
    [transition, applyTheme, patchSettings],
  )

  const toggleView = useCallback(() => {
    transition('view', () => setView((v) => (v === 'settings' ? 'queue' : 'settings')))
  }, [transition])

  const merge = useCallback((added: QueueFile[]) => {
    if (added.length === 0) return
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.path))
      return [...prev, ...added.filter((f) => !seen.has(f.path))]
    })
  }, [])

  const pick = useCallback(async () => {
    if (busy) return
    merge(await window.api.pickFiles())
  }, [busy, merge])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragDepth.current = 0
      setDrag(null)
      if (busy) return
      const paths = Array.from(e.dataTransfer.files).map((f) => window.api.pathForFile(f))
      if (view === 'settings') transition('view', () => setView('queue'))
      void window.api.addFiles(paths.filter(Boolean)).then(merge)
    },
    [busy, merge, view, transition],
  )

  /** Rows fold away before they leave, unless motion is reduced. */
  const removeFiles = useCallback((ids: string[]) => {
    if (ids.length === 0) return
    const drop = (): void => {
      setFiles((prev) => prev.filter((f) => !ids.includes(f.id)))
      setJobs((prev) => {
        const next = { ...prev }
        for (const id of ids) delete next[id]
        return next
      })
      setLeaving((prev) => {
        const next = new Set(prev)
        for (const id of ids) next.delete(id)
        return next
      })
    }
    if (document.documentElement.dataset.motion === 'reduced') {
      drop()
      return
    }
    setLeaving((prev) => new Set([...prev, ...ids]))
    setTimeout(drop, LEAVE_MS)
  }, [])

  const start = useCallback(async () => {
    if (!settings) return
    // Finished clips are not encoded twice when more are added afterwards.
    const targets = files.filter((f) => !f.error && jobs[f.id]?.state !== 'done')
    if (targets.length === 0) return
    setBusy(true)
    setJobs((prev) => {
      const next = { ...prev }
      for (const f of targets) delete next[f.id]
      return next
    })
    await window.api.startConvert({
      files: targets.map((f) => ({ id: f.id, path: f.path })),
      preset: settings.preset,
      crf: settings.crf,
      outputDir: settings.outputDir,
    })
  }, [files, jobs, settings])

  // Ctrl+O adds clips, Ctrl+, opens settings, Escape leaves them.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.ctrlKey && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        void pick()
      } else if (e.ctrlKey && e.key === ',') {
        e.preventDefault()
        toggleView()
      } else if (
        e.key === 'Escape' &&
        view === 'settings' &&
        !document.querySelector('[aria-expanded="true"]')
      ) {
        toggleView()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pick, toggleView, view])

  const valid = files.filter((f) => !f.error)
  const totalSec = valid.reduce((s, f) => s + (f.info?.durationSec ?? 0), 0)

  if (!settings) return <div className="app" />
  const { t } = i18n

  return (
    <I18nContext.Provider value={i18n}>
      <div
        className="app"
        data-dragging={!!drag}
        onDragEnter={(e) => {
          e.preventDefault()
          dragDepth.current += 1
          if (!busy && !drag) setDrag({ count: e.dataTransfer.items.length })
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1)
          if (dragDepth.current === 0) setDrag(null)
        }}
        onDrop={onDrop}
      >
        <TitleBar
          version={version}
          update={update}
          shutdown={shutdown}
          now={now}
          dark={dark}
          settingsOpen={view === 'settings'}
          onTheme={(origin) => setTheme(dark ? 'light' : 'dark', origin)}
          onSettings={toggleView}
          onDownloadUpdate={() => void window.api.downloadUpdate().then(setUpdate)}
          onInstallUpdate={() => void window.api.installUpdate()}
          onArm={(seconds) => void window.api.armShutdown(seconds).then(setShutdown)}
          onCancelShutdown={() => void window.api.cancelShutdown().then(setShutdown)}
        />

        {!ffmpeg.available && (
          <div className="notice">
            <AlertGlyph />
            <span>{t('ffmpeg.missing')}</span>
          </div>
        )}

        {view === 'settings' ? (
          <main className="stage stage-settings">
            <Settings
              settings={settings}
              ffmpeg={ffmpeg}
              detected={detected}
              update={update}
              version={version}
              onBack={toggleView}
              onPatch={patchSettings}
              onTheme={setTheme}
              onPickFolder={async () => {
                const dir = await window.api.pickOutputDir()
                if (dir) patchSettings({ outputDir: dir })
              }}
              onCheckUpdate={() => void window.api.checkUpdate().then(setUpdate)}
              onDownloadUpdate={() => void window.api.downloadUpdate().then(setUpdate)}
              onInstallUpdate={() => void window.api.installUpdate()}
            />
          </main>
        ) : (
          <main className="stage stage-queue">
            <section className="queue glass">
              <header className="queue-head">
                <div className="queue-title">
                  <h1>{t('queue.title')}</h1>
                  {valid.length > 0 && (
                    <span className="queue-count numeral">
                      {t('queue.count', { n: valid.length })} · {duration(totalSec)}
                    </span>
                  )}
                </div>
                <div className="spacer" />
                {files.length > 0 && !busy && (
                  <>
                    <button
                      className="btn btn-quiet btn-sm"
                      onClick={() => removeFiles(files.map((f) => f.id))}
                    >
                      {t('queue.clear')}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={pick}>
                      <PlusGlyph size={14} />
                      {t('queue.add')}
                    </button>
                  </>
                )}
              </header>

              {files.length === 0 ? (
                <EmptyState preset={settings.preset} over={!!drag} onPick={pick} />
              ) : (
                <div className="list">
                  {files.map((file, i) => (
                    <QueueRow
                      key={file.id}
                      file={file}
                      job={jobs[file.id]}
                      preset={settings.preset}
                      audioKbps={settings.audioBitrate}
                      busy={busy}
                      index={i}
                      leaving={leaving.has(file.id)}
                      onRemove={(id) => removeFiles([id])}
                      onReveal={(path) => void window.api.reveal(path)}
                    />
                  ))}
                </div>
              )}
            </section>

            <Inspector
              settings={settings}
              ffmpeg={ffmpeg}
              files={files}
              jobs={jobs}
              busy={busy}
              onPreset={(preset: Preset) => void window.api.setPreset(preset).then(setSettings)}
              onCrf={(crf) => {
                setSettings({ ...settings, crf })
                void window.api.setCrf(crf)
              }}
              onPickFolder={async () => {
                const dir = await window.api.pickOutputDir()
                if (dir) void window.api.setOutputDir(dir).then(setSettings)
              }}
              onResetFolder={() => patchSettings({ outputDir: '' })}
              onStart={start}
              onCancel={() => void window.api.cancelConvert()}
              onReveal={(path) => void window.api.reveal(path)}
              onClearDone={() =>
                removeFiles(files.filter((f) => jobs[f.id]?.state === 'done').map((f) => f.id))
              }
            />
          </main>
        )}

        {drag && (
          <div className="veil" aria-hidden>
            <span className="veil-corner" data-c="tl" />
            <span className="veil-corner" data-c="tr" />
            <span className="veil-corner" data-c="bl" />
            <span className="veil-corner" data-c="br" />
            <div className="veil-label">
              <span className="veil-plus">
                <PlusGlyph size={22} />
              </span>
              <span>{drag.count > 0 ? t('veil.release', { n: drag.count }) : t('veil.generic')}</span>
            </div>
          </div>
        )}
      </div>
    </I18nContext.Provider>
  )
}
