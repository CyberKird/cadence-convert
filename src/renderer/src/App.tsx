import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
import { BOTH_CRF } from '../../shared/types'
import { countdown } from './format'
import { QueueRow } from './components/QueueRow'
import { Settings } from './components/Settings'
import {
  AlertGlyph,
  ArrowGlyph,
  BackGlyph,
  FilmGlyph,
  FolderGlyph,
  GearGlyph,
  MoonGlyph,
  PlusGlyph,
  PowerGlyph,
  SunGlyph,
} from './components/indicators'

const PRESET_COPY: Record<Preset, { label: string; blurb: string; codec: string }> = {
  premiere: {
    label: 'Premiere',
    blurb: 'H.264 at constant quality. The pair Premiere never argues with.',
    codec: 'H.264',
  },
  transfer: {
    label: 'Transfer',
    blurb: 'HEVC. The same picture at roughly half the size, for upload and sending.',
    codec: 'HEVC',
  },
  both: {
    label: 'Both',
    blurb: 'One pass for editing, one for sending. Two files per clip, pinned to 18.',
    codec: 'H.264 + HEVC',
  },
}

const PRESET_KEYS = Object.keys(PRESET_COPY) as Preset[]

const UNITS = [
  { key: 'h' as const, max: 23 },
  { key: 'm' as const, max: 59 },
  { key: 's' as const, max: 59 },
]

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

  const [files, setFiles] = useState<QueueFile[]>([])
  const [jobs, setJobs] = useState<Record<string, JobProgress>>({})
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)

  const [view, setView] = useState<'queue' | 'settings'>('queue')
  const [update, setUpdate] = useState<UpdateStatus>({
    state: 'idle',
    version: null,
    percent: 0,
    message: null,
  })
  const [detected, setDetected] = useState<VideoEncoder | null>(null)

  const [shutdown, setShutdown] = useState<ShutdownStatus>({ armed: false, at: null })
  const [showPower, setShowPower] = useState(false)
  const [hms, setHms] = useState({ h: 1, m: 0, s: 0 })
  const [now, setNow] = useState(() => Date.now())

  const segRef = useRef<HTMLDivElement>(null)
  // Measured rather than assumed. The labels are different lengths, so equal
  // thirds would size the pill wrong and clip the widest word.
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)

  // Drag events fire for every child element, so a depth counter is what keeps
  // the veil from flickering as the pointer crosses the rows underneath.
  const dragDepth = useRef(0)

  useEffect(() => {
    window.api.getSettings().then((s) => {
      setSettings(s)
      applyTheme(s.theme)
      // Windows reports reduced motion whenever its own animation effects are
      // off, which is a performance preference far more often than a motion
      // one. The app follows its own setting rather than that media query.
      document.documentElement.dataset.motion = s.animations ? 'full' : 'reduced'
    })
    window.api.getAppInfo().then((i) => setVersion(i.version))
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
  }, [])

  // Ticks only while a timer is armed, so an idle window is never waking up
  // to redraw a clock nobody is watching.
  useEffect(() => {
    if (!shutdown.armed) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [shutdown.armed])

  useLayoutEffect(() => {
    const root = segRef.current
    if (!root) return

    const measure = (): void => {
      const active = root.querySelector<HTMLElement>('[data-active="true"]')
      if (!active) return
      const rootBox = root.getBoundingClientRect()
      const box = active.getBoundingClientRect()
      setIndicator({ left: box.left - rootBox.left, width: box.width })
    }

    measure()
    // Label widths move when the window resizes or when Inter finishes
    // loading and the fallback font stops standing in for it.
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [settings?.preset])

  const patch = useCallback((next: AppSettings) => setSettings(next), [])

  /** One path for every settings change, so side effects cannot be forgotten. */
  const patchSettings = useCallback((next: Partial<AppSettings>) => {
    void window.api.updateSettings(next).then((saved) => {
      setSettings(saved)
      applyTheme(saved.theme)
      document.documentElement.dataset.motion = saved.animations ? 'full' : 'reduced'
    })
  }, [])

  const armSeconds = hms.h * 3600 + hms.m * 60 + hms.s

  const addPaths = useCallback(async (paths: string[]) => {
    const added = await window.api.addFiles(paths)
    if (added.length === 0) return
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.path))
      return [...prev, ...added.filter((f) => !seen.has(f.path))]
    })
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragDepth.current = 0
      setDragging(false)
      if (busy) return
      const paths = Array.from(e.dataTransfer.files).map((f) => window.api.pathForFile(f))
      void addPaths(paths.filter(Boolean))
    },
    [addPaths, busy],
  )

  const pick = useCallback(async () => {
    const added = await window.api.pickFiles()
    if (added.length === 0) return
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.path))
      return [...prev, ...added.filter((f) => !seen.has(f.path))]
    })
  }, [])

  const start = useCallback(async () => {
    if (!settings || files.length === 0) return
    setBusy(true)
    setJobs({})
    await window.api.startConvert({
      files: files.map((f) => ({ id: f.id, path: f.path })),
      preset: settings.preset,
      crf: settings.crf,
      outputDir: settings.outputDir,
    })
  }, [files, settings])

  const pending = useMemo(() => files.filter((f) => !f.error).length, [files])
  const finished = useMemo(
    () => Object.values(jobs).filter((j) => j.state === 'done').length,
    [jobs],
  )

  if (!settings) return <div className="app" />

  const preset = PRESET_COPY[settings.preset]
  const dark = document.documentElement.dataset.theme === 'dark'
  // 'both' owns its quality, so the slider stops being a control.
  const locked = settings.preset === 'both'

  return (
    <div
      className="app"
      onDragEnter={(e) => {
        e.preventDefault()
        dragDepth.current += 1
        if (!busy) setDragging(true)
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1)
        if (dragDepth.current === 0) setDragging(false)
      }}
      onDrop={onDrop}
    >
      <header className="header">
        <div className="mark solid">CC</div>
        <div className="header-meta">
          <span className="header-title">Cadence Convert</span>
          <span className="label">{version ? `v${version}` : 'video pipeline'}</span>
        </div>

        <div className="spacer" />

        {view === 'queue' && (
        <div className="segmented glass" ref={segRef}>
          {indicator && (
            <span
              className="segment-indicator"
              style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
              aria-hidden
            />
          )}
          {PRESET_KEYS.map((key) => (
            <button
              key={key}
              className="segment"
              data-active={settings.preset === key}
              disabled={busy}
              onClick={() => window.api.setPreset(key).then(patch)}
            >
              {PRESET_COPY[key].label}
            </button>
          ))}
        </div>
        )}

        <button
          className="icon-btn"
          title={dark ? 'Light theme' : 'Dark theme'}
          onClick={() => {
            const next: ThemeMode = dark ? 'light' : 'dark'
            applyTheme(next)
            void window.api.setTheme(next).then(patch)
          }}
        >
          {dark ? <SunGlyph /> : <MoonGlyph />}
        </button>

        <button
          className="icon-btn"
          data-active={shutdown.armed}
          title="Scheduled shutdown"
          onClick={() => setShowPower((open) => !open)}
        >
          <PowerGlyph />
        </button>

        <button
          className="icon-btn"
          data-active={view === 'settings' || update.state === 'available'}
          title={view === 'settings' ? 'Back to the queue' : 'Settings'}
          onClick={() => setView((v) => (v === 'settings' ? 'queue' : 'settings'))}
        >
          {view === 'settings' ? <BackGlyph /> : <GearGlyph />}
        </button>
      </header>

      {!ffmpeg.available && (
        <div className="notice glass">
          <AlertGlyph />
          <span>
            ffmpeg was not found. Install it, or place it at C:\ffmpeg\bin, then restart the app.
          </span>
        </div>
      )}

      {showPower && (
        <div className="power-bar glass">
          {shutdown.armed && shutdown.at !== null ? (
            <>
              <span className="label">Shutting down in</span>
              <span className="numeral power-count">{countdown(shutdown.at - now)}</span>
              <div className="spacer" />
              <button
                className="btn btn-quiet"
                onClick={() => void window.api.cancelShutdown().then(setShutdown)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className="label">Shut down after</span>
              <div className="hms">
                {UNITS.map(({ key, max }) => (
                  <label key={key} className="hms-unit">
                    <input
                      className="hms-input numeral"
                      type="number"
                      min={0}
                      max={max}
                      value={hms[key]}
                      onChange={(e) => {
                        const v = Math.min(max, Math.max(0, Math.floor(Number(e.target.value) || 0)))
                        setHms((prev) => ({ ...prev, [key]: v }))
                      }}
                    />
                    <span className="label">{key}</span>
                  </label>
                ))}
              </div>
              <span className="label" style={{ color: 'var(--text-dim)' }}>
                stays awake until then
              </span>
              <div className="spacer" />
              <button
                className="btn solid"
                disabled={armSeconds === 0}
                onClick={() => void window.api.armShutdown(armSeconds).then(setShutdown)}
              >
                Arm
                <PowerGlyph size={14} />
              </button>
            </>
          )}
        </div>
      )}

      {view === 'settings' ? (
        <section className="panel glass">
          <Settings
            settings={settings}
            ffmpeg={ffmpeg}
            detected={detected}
            update={update}
            version={version}
            onPatch={patchSettings}
            onPickFolder={async () => {
              const dir = await window.api.pickOutputDir()
              if (dir) patchSettings({ outputDir: dir })
            }}
            onCheckUpdate={() => void window.api.checkUpdate().then(setUpdate)}
            onDownloadUpdate={() => void window.api.downloadUpdate().then(setUpdate)}
            onInstallUpdate={() => void window.api.installUpdate()}
          />
        </section>
      ) : (
        <>
      <section className="panel glass">
        <div className="panel-head">
          <span className="label">{preset.codec} queue</span>
          {settings.preset !== 'transfer' && (
            <span className="pill" title={ffmpeg.videoEncoder}>
              {ffmpeg.hardware ? 'GPU' : 'CPU'}
            </span>
          )}
          <span className="label numeral" style={{ color: 'var(--text-dim)' }}>
            {busy ? `${finished} of ${pending}` : pending ? `${pending} file${pending > 1 ? 's' : ''}` : 'empty'}
          </span>
          <div className="spacer" />
          {files.length > 0 && !busy && (
            <>
              <button className="btn btn-quiet" style={{ height: 30, padding: '0 12px' }} onClick={() => setFiles([])}>
                Clear
              </button>
              <button className="btn btn-quiet" style={{ height: 30, padding: '0 12px' }} onClick={pick}>
                <PlusGlyph />
                Add
              </button>
            </>
          )}
        </div>

        {files.length === 0 ? (
          <div className="drop" data-over={dragging} onClick={pick} role="button" tabIndex={0}>
            <div className="drop-inner">
              <div style={{ color: 'var(--text-faint)', marginBottom: 6 }}>
                <FilmGlyph size={28} />
              </div>
              <h2 style={{ fontSize: 15 }}>Drop clips here</h2>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-dim)', maxWidth: 330 }}>
                {preset.blurb}
              </p>
            </div>
          </div>
        ) : (
          <div className="list">
            {files.map((file, i) => (
              <QueueRow
                key={file.id}
                file={file}
                job={jobs[file.id]}
                busy={busy}
                index={i}
                onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
                onReveal={(path) => void window.api.reveal(path)}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="bar glass">
        <div className="field">
          <span className="label">
            Quality <span className="numeral">{locked ? BOTH_CRF : settings.crf}</span>
            {locked ? ' fixed' : ''}
          </span>
          <input
            className="slider"
            type="range"
            min={12}
            max={30}
            value={locked ? BOTH_CRF : settings.crf}
            disabled={busy || locked}
            onChange={(e) => {
              const crf = Number(e.target.value)
              setSettings({ ...settings, crf })
              void window.api.setCrf(crf)
            }}
          />
        </div>

        <div className="field" style={{ minWidth: 0 }}>
          <span className="label">Output</span>
          <button
            className="path-btn"
            disabled={busy}
            title={settings.outputDir || 'Beside each source file'}
            onClick={async () => {
              const dir = await window.api.pickOutputDir()
              if (dir) void window.api.setOutputDir(dir).then(patch)
            }}
          >
            <FolderGlyph size={12} />{' '}
            {settings.outputDir ? shorten(settings.outputDir) : 'Next to source'}
          </button>
        </div>

        <div className="spacer" />

        {busy ? (
          <button className="btn btn-quiet" onClick={() => void window.api.cancelConvert()}>
            Cancel
          </button>
        ) : (
          <button
            className="btn solid"
            style={{ position: 'relative', overflow: 'hidden' }}
            disabled={pending === 0 || !ffmpeg.available}
            onClick={start}
          >
            Convert {pending > 0 ? pending : ''}
            <ArrowGlyph size={14} />
          </button>
        )}
      </footer>
        </>
      )}

      {dragging && (
        <div className="drop-veil">
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-faint)' }}>
              <PlusGlyph size={30} />
            </div>
            <h2 style={{ fontSize: 15, marginTop: 8 }}>Add to queue</h2>
          </div>
        </div>
      )}
    </div>
  )
}

function applyTheme(mode: ThemeMode): void {
  const resolved =
    mode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : mode
  document.documentElement.dataset.theme = resolved
}

/** Keeps the drive and the last folder, which is what identifies a path. */
function shorten(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean)
  if (parts.length <= 2) return path
  return `${parts[0]}\\...\\${parts[parts.length - 1]}`
}
