import type { ReactNode } from 'react'
import {
  AUDIO_BITRATES,
  ENCODER_LABELS,
  type AppSettings,
  type EncoderChoice,
  type FfmpegStatus,
  type UpdateStatus,
  type VideoEncoder,
} from '../../../shared/types'
import { CheckGlyph, DownloadGlyph, FolderGlyph, Spinner } from './indicators'

const ENCODER_ORDER: EncoderChoice[] = ['auto', 'h264_nvenc', 'h264_amf', 'h264_qsv', 'libx264']

export function Settings({
  settings,
  ffmpeg,
  detected,
  update,
  version,
  onPatch,
  onPickFolder,
  onCheckUpdate,
  onDownloadUpdate,
  onInstallUpdate,
}: {
  settings: AppSettings
  ffmpeg: FfmpegStatus
  detected: VideoEncoder | null
  update: UpdateStatus
  version: string
  onPatch: (patch: Partial<AppSettings>) => void
  onPickFolder: () => void
  onCheckUpdate: () => void
  onDownloadUpdate: () => void
  onInstallUpdate: () => void
}) {
  return (
    <div className="settings">
      <Section title="Encoding">
        <Row
          label="Encoder"
          hint={
            settings.encoder === 'auto' && detected
              ? `Probed at startup and picked ${ENCODER_LABELS[detected]}`
              : 'Forced. Falls back to the processor if the card refuses it.'
          }
        >
          <select
            className="select"
            value={settings.encoder}
            onChange={(e) => onPatch({ encoder: e.target.value as EncoderChoice })}
          >
            {ENCODER_ORDER.map((key) => (
              <option key={key} value={key}>
                {ENCODER_LABELS[key]}
                {key === 'auto' && detected ? ` (${ENCODER_LABELS[detected]})` : ''}
              </option>
            ))}
          </select>
        </Row>

        <Row
          label="Quality"
          hint="Lower keeps more detail and costs size. 18 is near invisible loss."
        >
          <div className="row-control">
            <input
              className="slider"
              type="range"
              min={12}
              max={30}
              value={settings.crf}
              onChange={(e) => onPatch({ crf: Number(e.target.value) })}
            />
            <span className="numeral" style={{ width: 22, textAlign: 'right' }}>
              {settings.crf}
            </span>
          </div>
        </Row>

        <Row label="Audio bitrate" hint="Applied to both presets.">
          <select
            className="select"
            value={settings.audioBitrate}
            onChange={(e) => onPatch({ audioBitrate: Number(e.target.value) })}
          >
            {AUDIO_BITRATES.map((b) => (
              <option key={b} value={b}>
                {b} kbps
              </option>
            ))}
          </select>
        </Row>
      </Section>

      <Section title="Output">
        <Row label="Folder" hint={settings.outputDir || 'Written beside each source file.'}>
          <div className="row-control">
            <button className="btn btn-quiet" style={{ height: 32 }} onClick={onPickFolder}>
              <FolderGlyph size={13} />
              Choose
            </button>
            {settings.outputDir && (
              <button
                className="btn btn-quiet"
                style={{ height: 32 }}
                onClick={() => onPatch({ outputDir: '' })}
              >
                Reset
              </button>
            )}
          </div>
        </Row>
      </Section>

      <Section title="Behaviour">
        <Row
          label="Keep the machine awake"
          hint="While a queue runs. Turning this off risks a truncated file if the machine sleeps."
        >
          <Toggle on={settings.keepAwake} onChange={(v) => onPatch({ keepAwake: v })} />
        </Row>

        <Row label="Animations" hint="Turn off for the quietest possible interface.">
          <Toggle on={settings.animations} onChange={(v) => onPatch({ animations: v })} />
        </Row>

        <Row label="Theme" hint="Follows the system unless you pick one.">
          <select
            className="select"
            value={settings.theme}
            onChange={(e) => onPatch({ theme: e.target.value as AppSettings['theme'] })}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Row>
      </Section>

      <Section title="Updates">
        <Row label="Version" hint="Releases come from the project's GitHub page.">
          <span className="numeral" style={{ fontSize: 13 }}>
            {version ? `v${version}` : '--'}
          </span>
        </Row>

        <Row label="Check on launch" hint="Only checks. Downloading is always your call.">
          <Toggle
            on={settings.autoCheckUpdates}
            onChange={(v) => onPatch({ autoCheckUpdates: v })}
          />
        </Row>

        <Row label="Status" hint={updateHint(update)}>
          <div className="row-control">
            {update.state === 'checking' && <Spinner />}
            {update.state === 'downloading' && (
              <span className="numeral" style={{ fontSize: 13 }}>
                {update.percent}%
              </span>
            )}
            {update.state === 'available' && (
              <button className="btn solid" style={{ height: 32 }} onClick={onDownloadUpdate}>
                <DownloadGlyph size={13} />
                Download
              </button>
            )}
            {update.state === 'ready' && (
              <button className="btn solid" style={{ height: 32 }} onClick={onInstallUpdate}>
                <CheckGlyph size={13} />
                Restart and install
              </button>
            )}
            {(update.state === 'idle' || update.state === 'error') && (
              <button
                className="btn btn-quiet"
                style={{ height: 32 }}
                onClick={onCheckUpdate}
              >
                Check now
              </button>
            )}
          </div>
        </Row>
      </Section>

      <Section title="System">
        <Row label="ffmpeg" hint={ffmpeg.path ?? 'Not found on PATH or at C:\\ffmpeg\\bin.'}>
          <span className="numeral" style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            {ffmpeg.version ?? 'missing'}
          </span>
        </Row>
        <Row label="Active encoder" hint="What the next queue will actually use.">
          <span className="pill">{ffmpeg.videoEncoder}</span>
        </Row>
      </Section>
    </div>
  )
}

function updateHint(u: UpdateStatus): string {
  switch (u.state) {
    case 'checking':
      return 'Asking GitHub.'
    case 'available':
      return `Version ${u.version} is waiting.`
    case 'downloading':
      return 'Downloading in the background.'
    case 'ready':
      return `Version ${u.version} installs on restart.`
    case 'error':
      return u.message ?? 'The check failed.'
    default:
      return u.message ?? 'Up to date.'
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-section">
      <span className="label">{title}</span>
      <div className="settings-rows">{children}</div>
    </section>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="settings-row">
      <div className="settings-text">
        <span className="settings-label">{label}</span>
        {hint && <span className="settings-hint">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className="toggle"
      role="switch"
      aria-checked={on}
      data-on={on}
      onClick={() => onChange(!on)}
    >
      <span className="toggle-knob" />
    </button>
  )
}
