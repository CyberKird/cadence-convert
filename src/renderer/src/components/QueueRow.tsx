import type { JobProgress, Preset, QueueFile } from '../../../shared/types'
import { shortsMbps, shortsSize } from '../../../shared/types'
import type { MessageKey } from '../../../shared/i18n'
import { bytes, clock, codec, delta, duration, fps, resolution } from '../format'
import { useI18n } from '../i18n'
import { AlertGlyph, CheckGlyph, CloseGlyph, FilmGlyph, FolderGlyph } from './indicators'

/** Main reports probe failures in English words; the row says them in the reader's language. */
const PROBE_ERRORS: Record<string, MessageKey> = {
  'file not found': 'row.errNotFound',
  'no video track': 'row.errNoVideo',
  unreadable: 'row.errUnreadable',
}

/** Bytes the shorts copy should land near: video at its target plus audio. */
export function shortsEstimate(file: QueueFile, audioKbps: number): number | null {
  const info = file.info
  if (!info || !info.durationSec) return null
  const mbps = shortsMbps(info.width, info.height, info.fps)
  return ((mbps * 1_000_000 + audioKbps * 1000) * info.durationSec) / 8
}

export function QueueRow({
  file,
  job,
  preset,
  audioKbps,
  busy,
  index,
  leaving,
  onRemove,
  onReveal,
}: {
  file: QueueFile
  job: JobProgress | undefined
  preset: Preset
  audioKbps: number
  busy: boolean
  index: number
  leaving: boolean
  onRemove: (id: string) => void
  onReveal: (path: string) => void
}) {
  const { t } = useI18n()
  const state = job?.state ?? 'queued'
  const running = state === 'running'
  const done = state === 'done'
  const failed = state === 'failed' || !!file.error
  const info = file.info
  const percent = job?.percent ?? 0

  // Remaining time from the encoder's own speed: what is left of the clip,
  // divided by how many seconds of it are encoded per second.
  const left =
    running && job?.speed && info?.durationSec ? (info.durationSec * (1 - percent)) / job.speed : null

  const errorText = file.error
    ? PROBE_ERRORS[file.error]
      ? t(PROBE_ERRORS[file.error])
      : file.error
    : job?.state === 'failed'
      ? (job.message ?? t('row.failed'))
      : null

  return (
    <div
      className="row"
      data-state={failed ? 'failed' : state}
      data-leaving={leaving}
      // Capped, so dropping fifty files still finishes settling in under half
      // a second rather than trickling in one row at a time.
      style={{ animationDelay: leaving ? '0ms' : `${Math.min(index * 45, 450)}ms` }}
    >
      {running && (
        <div className="row-fill" style={{ clipPath: `inset(0 ${100 - percent * 100}% 0 0)` }}>
          <span className="row-fill-sweep" aria-hidden />
        </div>
      )}

      <div className="thumb">
        {file.thumb ? <img src={file.thumb} alt="" draggable={false} /> : <FilmGlyph size={18} />}
        {info && info.durationSec > 0 && !done && !failed && (
          <span className="thumb-time">{duration(info.durationSec)}</span>
        )}
        {(done || failed) && (
          <span className="thumb-state" data-kind={done ? 'done' : 'failed'}>
            {done ? <CheckGlyph size={18} className="draw" /> : <AlertGlyph size={18} />}
          </span>
        )}
      </div>

      <div className="row-text">
        <span className="row-name" title={file.path}>
          {file.name}
        </span>
        <span className="row-meta">
          {errorText ? (
            <span className="row-error" title={errorText}>
              {errorText}
            </span>
          ) : info ? (
            <>
              <span>{resolution(info.width, info.height)}</span>
              <span className="sep">{fps(info.fps)}</span>
              <span className="sep">{bytes(file.sizeBytes)}</span>
              {/* Last and the only part allowed to shrink, so a narrow window
                  trims the codec name rather than leaving a size without its unit. */}
              <span className="sep meta-shrink">
                {codec(info.videoCodec)}
                {info.tenBit ? ' 10-bit' : ''}
              </span>
              {info.variableFps && (
                <span className="tag" title={t('row.vfrTip')}>
                  {t('row.vfr')}
                </span>
              )}
            </>
          ) : (
            <span>{bytes(file.sizeBytes)}</span>
          )}
        </span>
      </div>

      <div className="row-plan">
        {running ? (
          <>
            <span className="plan-main numeral">{Math.round(percent * 100)}%</span>
            <span className="plan-sub">
              {job?.speed ? `${job.speed.toFixed(1)}×` : ''}
              {left !== null ? ` · ${t('row.left', { t: clock(left) })}` : ''}
            </span>
          </>
        ) : done && job?.outputs[0] ? (
          <>
            <span className="plan-main numeral">{bytes(job.outputs[0].bytes)}</span>
            <span className="plan-sub numeral">{delta(file.sizeBytes, job.outputs[0].bytes)}</span>
          </>
        ) : state === 'cancelled' ? (
          <span className="plan-sub">{t('row.cancelled')}</span>
        ) : failed ? (
          <span className="plan-sub">{t('row.failed')}</span>
        ) : info ? (
          <Plan file={file} preset={preset} audioKbps={audioKbps} busy={busy} />
        ) : null}
      </div>

      <div className="row-actions">
        {done && job?.outputs[0] && (
          <button
            className="icon-btn"
            data-tip={t('row.reveal')}
            data-tip-align="end"
            aria-label={t('row.reveal')}
            onClick={() => onReveal(job.outputs[0].path)}
          >
            <FolderGlyph size={15} />
          </button>
        )}
        {!running && !busy && (
          <button
            className="icon-btn row-remove"
            data-tip={t('row.remove')}
            data-tip-align="end"
            aria-label={t('row.remove')}
            onClick={() => onRemove(file.id)}
          >
            <CloseGlyph />
          </button>
        )}
      </div>
    </div>
  )
}

/** What this preset will turn the clip into, so the queue explains itself before it runs. */
function Plan({
  file,
  preset,
  audioKbps,
  busy,
}: {
  file: QueueFile
  preset: Preset
  audioKbps: number
  busy: boolean
}) {
  const { t } = useI18n()
  const info = file.info!
  if (preset === 'shorts') {
    const out = shortsSize(info.width, info.height)
    const outFps = Math.min(info.fps, 60)
    const est = shortsEstimate(file, audioKbps)
    return (
      <>
        <span className="plan-main">
          {resolution(out.width, out.height)} · {fps(outFps)}
        </span>
        <span className="plan-sub numeral">
          {busy
            ? t('row.waiting')
            : `${shortsMbps(info.width, info.height, info.fps)} Mbps · ≈ ${bytes(est)}`}
        </span>
      </>
    )
  }
  return (
    <>
      <span className="plan-main">H.264 · {fps(info.fps)}</span>
      <span className="plan-sub">{busy ? t('row.waiting') : t('val.cfr')}</span>
    </>
  )
}
