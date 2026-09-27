import type { AppSettings, FfmpegStatus, JobProgress, Preset, QueueFile } from '../../../shared/types'
import { ENCODER_LABELS, SHORTS_TIERS, shortsSize } from '../../../shared/types'
import { bytes, clock, duration } from '../format'
import { useI18n } from '../i18n'
import { Segmented, Slider } from './controls'
import { ArrowGlyph, CheckGlyph, CloseGlyph, FolderGlyph } from './indicators'
import { shortsEstimate } from './QueueRow'

/** Which row of the shorts table a clip lands on, by the short edge of its output. */
function tierOf(file: QueueFile): { tier: number; high: boolean } | null {
  if (!file.info) return null
  const out = shortsSize(file.info.width, file.info.height)
  const short = Math.min(out.width, out.height)
  return { tier: short >= 1800 ? 0 : short >= 1300 ? 1 : 2, high: Math.min(file.info.fps, 60) > 30 }
}

export function Inspector({
  settings,
  ffmpeg,
  files,
  jobs,
  busy,
  onPreset,
  onCrf,
  onPickFolder,
  onResetFolder,
  onStart,
  onCancel,
  onReveal,
  onClearDone,
}: {
  settings: AppSettings
  ffmpeg: FfmpegStatus
  files: QueueFile[]
  jobs: Record<string, JobProgress>
  busy: boolean
  onPreset: (p: Preset) => void
  onCrf: (crf: number) => void
  onPickFolder: () => void
  onResetFolder: () => void
  onStart: () => void
  onCancel: () => void
  onReveal: (path: string) => void
  onClearDone: () => void
}) {
  const { t } = useI18n()
  const preset = settings.preset
  const valid = files.filter((f) => !f.error)
  const totalSec = valid.reduce((sum, f) => sum + (f.info?.durationSec ?? 0), 0)
  const inBytes = valid.reduce((sum, f) => sum + f.sizeBytes, 0)
  const outBytes =
    preset === 'shorts'
      ? valid.reduce((sum, f) => sum + (shortsEstimate(f, settings.audioBitrate) ?? 0), 0)
      : 0

  const states = valid.map((f) => jobs[f.id]?.state)
  const doneCount = states.filter((s) => s === 'done').length
  const failedCount = states.filter((s) => s === 'failed').length
  // Cancelled clips count as still to do, so the Convert button comes back for them.
  const pending = valid.filter((f) => jobs[f.id]?.state !== 'done')
  const settled = !busy && valid.length > 0 && states.every((s) => s === 'done' || s === 'failed')

  // Progress across the whole queue, weighted by clip length so a two hour
  // file does not count the same as a two second one.
  const encodedSec = valid.reduce((sum, f) => {
    const j = jobs[f.id]
    const d = f.info?.durationSec ?? 0
    if (!j) return sum
    if (j.state === 'done' || j.state === 'failed' || j.state === 'cancelled') return sum + d
    return sum + d * j.percent
  }, 0)
  const overall = totalSec > 0 ? encodedSec / totalSec : 0
  const runningJob = Object.values(jobs).find((j) => j.state === 'running')
  const left = runningJob?.speed ? (totalSec - encodedSec) / runningJob.speed : null
  const firstOutput = valid.map((f) => jobs[f.id]?.outputs[0]?.path).find(Boolean)

  const tiersInQueue = valid.map(tierOf).filter((x): x is { tier: number; high: boolean } => !!x)
  const encoderName =
    ffmpeg.videoEncoder === 'libx264'
      ? t('val.cpu')
      : t('val.gpu', { name: ENCODER_LABELS[ffmpeg.videoEncoder] })

  return (
    <aside className="inspector glass">
      <div className="inspector-top">
        <Segmented<Preset>
          size="lg"
          label={t('preset.premiere') + ' / ' + t('preset.shorts')}
          value={preset}
          disabled={busy}
          onChange={onPreset}
          options={[
            { value: 'premiere', label: t('preset.premiere'), sub: t('preset.premiereTag') },
            { value: 'shorts', label: t('preset.shorts'), sub: t('preset.shortsTag') },
          ]}
        />
      </div>

      {/* Only the middle scrolls, so the Convert button never leaves the window. */}
      <div className="inspector-scroll">
        <div className="recipe" key={preset}>
          <p className="recipe-desc">
            {preset === 'shorts' ? t('preset.shortsDesc') : t('preset.premiereDesc')}
          </p>

          <dl className="specs">
            {preset === 'shorts' ? (
              <>
                <Spec k={t('spec.frame')} v={t('val.frame')} />
                <Spec k={t('spec.frameRate')} v={t('val.upTo60')} />
                <Spec k={t('spec.codec')} v={t('val.h264High')} />
                <Spec k={t('spec.keyframes')} v={t('val.everySecond')} />
                <Spec k={t('spec.audio')} v={t('val.audioStereo', { k: settings.audioBitrate })} />
                <Spec k={t('spec.madeFor')} v={t('val.platforms')} />
              </>
            ) : (
              <>
                <Spec k={t('spec.codec')} v={t('val.h264')} />
                <Spec k={t('spec.frameRate')} v={t('val.cfr')} />
                <Spec k={t('spec.encoder')} v={encoderName} />
                <Spec k={t('spec.audio')} v={t('val.audioAll', { k: settings.audioBitrate })} />
              </>
            )}
          </dl>

          {preset === 'shorts' ? (
            <div className="tiers">
              <div className="tiers-head">
                <span>{t('tier.title')}</span>
                {tiersInQueue.length > 0 && (
                  <span className="tiers-legend">
                    <i /> {t('tier.inQueue')}
                  </span>
                )}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>{t('tier.res')}</th>
                    <th>{t('tier.low')}</th>
                    <th>{t('tier.high')}</th>
                  </tr>
                </thead>
                <tbody>
                  {SHORTS_TIERS.map((tier, i) => (
                    <tr key={tier.label}>
                      <td>{tier.label}</td>
                      {[false, true].map((high) => (
                        <td
                          key={String(high)}
                          className="numeral"
                          data-hit={tiersInQueue.some((q) => q.tier === i && q.high === high)}
                        >
                          {high ? tier.high : tier.low} <small>Mbps</small>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="quality">
              <div className="quality-head">
                <span>{t('quality.label')}</span>
                <span className="numeral quality-value">{settings.crf}</span>
              </div>
              <Slider
                min={12}
                max={30}
                value={settings.crf}
                disabled={busy}
                label={t('quality.label')}
                onChange={onCrf}
              />
              <span className="hint">{t('quality.hint')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="inspector-foot">
        <div className="output">
          <span className="output-label">{t('output.label')}</span>
          <div className="output-row">
            <button
              className="output-btn"
              disabled={busy}
              onClick={onPickFolder}
              title={settings.outputDir || t('output.beside')}
              aria-label={t('output.change')}
            >
              <FolderGlyph size={15} />
              <span>{settings.outputDir ? shorten(settings.outputDir) : t('output.beside')}</span>
            </button>
            {settings.outputDir && !busy && (
              <button
                className="icon-btn"
                data-tip={t('output.reset')}
                data-tip-align="end"
                aria-label={t('output.reset')}
                onClick={onResetFolder}
              >
                <CloseGlyph size={13} />
              </button>
            )}
          </div>
        </div>
        {valid.length > 0 && (
          <div className="summary numeral">
            <span>
              {t('queue.count', { n: valid.length })} · {duration(totalSec)}
            </span>
            <span className="summary-sizes">
              {t('summary.in', { size: bytes(inBytes) })}
              {preset === 'shorts' && outBytes > 0 ? ` · ${t('summary.out', { size: bytes(outBytes) })}` : ''}
            </span>
          </div>
        )}

        <div className="action" data-mode={busy ? 'running' : settled ? 'done' : 'idle'}>
          {busy ? (
            <div className="run" key="run">
              <div className="run-head numeral">
                <span>{t('convert.progress', { done: doneCount + failedCount, total: valid.length })}</span>
                <span className="run-pct">{Math.round(overall * 100)}%</span>
              </div>
              <div className="run-track">
                <div
                  className="run-fill"
                  style={{ clipPath: `inset(0 ${100 - overall * 100}% 0 0 round 99px)` }}
                />
              </div>
              <div className="run-foot">
                <span className="numeral">{left !== null ? t('convert.left', { t: clock(left) }) : ''}</span>
                <button className="btn btn-quiet btn-sm" onClick={onCancel}>
                  {t('convert.cancel')}
                </button>
              </div>
            </div>
          ) : settled ? (
            <div className="finish" key="finish">
              <div className="finish-head">
                <span className="finish-mark">
                  <CheckGlyph size={16} className="draw" />
                </span>
                <span>
                  {failedCount > 0
                    ? t('convert.partial', { ok: doneCount, bad: failedCount })
                    : t('convert.done')}
                </span>
              </div>
              <div className="finish-actions">
                {firstOutput && (
                  <button className="btn solid" onClick={() => onReveal(firstOutput)}>
                    <FolderGlyph size={15} />
                    {t('convert.show')}
                  </button>
                )}
                {failedCount > 0 && (
                  <button className="btn btn-outline" onClick={onStart}>
                    {t('convert.go')}
                    <span className="go-count numeral">{failedCount}</span>
                  </button>
                )}
                <button className="btn btn-quiet" onClick={onClearDone}>
                  {t('queue.clearDone')}
                </button>
              </div>
            </div>
          ) : (
            <button
              key="go"
              className="btn solid btn-go"
              disabled={pending.length === 0 || !ffmpeg.available}
              onClick={onStart}
            >
              <span>{t('convert.go')}</span>
              {pending.length > 0 && <span className="go-count numeral">{pending.length}</span>}
              <ArrowGlyph size={16} className="go-arrow" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="spec">
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  )
}

/** Keeps the drive and the last folder, which is what identifies a path. */
function shorten(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean)
  if (parts.length <= 2) return path
  return `${parts[0]}\\…\\${parts[parts.length - 1]}`
}
