import type { JobProgress, QueueFile } from '../../../shared/types'
import { bytes, delta, duration, fps, resolution } from '../format'
import { AlertGlyph, CheckGlyph, CloseGlyph, FilmGlyph, FolderGlyph, Spinner } from './indicators'

export function QueueRow({
  file,
  job,
  busy,
  index,
  onRemove,
  onReveal,
}: {
  file: QueueFile
  job: JobProgress | undefined
  busy: boolean
  index: number
  onRemove: (id: string) => void
  onReveal: (path: string) => void
}) {
  const state = job?.state ?? 'queued'
  const running = state === 'running'
  const done = state === 'done'
  const failed = state === 'failed'

  const glyph = failed || file.error ? <AlertGlyph /> : done ? <CheckGlyph /> : running ? <Spinner /> : <FilmGlyph />

  return (
    <div
      className="row"
      data-state={state}
      // Capped, so dropping fifty files still finishes settling in under half
      // a second rather than trickling in one row at a time.
      style={{ animationDelay: `${Math.min(index * 35, 420)}ms` }}
    >
      {running && (
        <div className="row-fill" style={{ width: `${Math.round((job?.percent ?? 0) * 100)}%` }}>
          <span className="row-fill-sweep" aria-hidden />
        </div>
      )}

      <div className="row-body">
        <div className="row-glyph" style={done ? { color: 'var(--text)' } : undefined}>
          {glyph}
        </div>

        <div className="row-text">
          <span className="row-name" title={file.path}>
            {file.name}
          </span>
          <span className="row-sub">{subtitle(file, job)}</span>
        </div>

        <div className="row-right">
          {running && job?.stage && (
            <span className="pill">{job.stage === 'premiere' ? 'H.264' : 'HEVC'}</span>
          )}

          {running && job?.speed ? <span className="pill numeral">{job.speed.toFixed(1)}x</span> : null}

          {running && (
            <span className="numeral" style={{ fontSize: 12, minWidth: 34, textAlign: 'right' }}>
              {Math.round((job?.percent ?? 0) * 100)}%
            </span>
          )}

          {done && job && job.outputs.length > 0 && (
            <button
              className="icon-btn"
              style={{ width: 28, height: 28 }}
              onClick={() => onReveal(job.outputs[0].path)}
              title="Show in folder"
            >
              <FolderGlyph />
            </button>
          )}

          {!running && !busy && (
            <button
              className="icon-btn"
              style={{ width: 28, height: 28 }}
              onClick={() => onRemove(file.id)}
              title="Remove"
            >
              <CloseGlyph />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/** One line that changes with state, so a row never needs a second one. */
function subtitle(file: QueueFile, job: JobProgress | undefined) {
  if (file.error) return <span>{file.error}</span>

  if (job?.state === 'failed') return <span>{job.message ?? 'failed'}</span>
  if (job?.state === 'cancelled') return <span>cancelled</span>

  if (job?.state === 'done') {
    return (
      <>
        <span>{bytes(file.sizeBytes)}</span>
        {job.outputs.map((out) => (
          <span className="dot-sep" key={out.path}>
            {out.kind === 'premiere' ? 'H.264' : 'HEVC'} {bytes(out.bytes)}{' '}
            <span className="numeral">{delta(file.sizeBytes, out.bytes)}</span>
          </span>
        ))}
      </>
    )
  }

  const info = file.info
  if (!info) return <span>{bytes(file.sizeBytes)}</span>

  return (
    <>
      <span>{resolution(info.width, info.height)}</span>
      <span className="dot-sep">{fps(info.fps)}</span>
      <span className="dot-sep">{duration(info.durationSec)}</span>
      <span className="dot-sep">{bytes(file.sizeBytes)}</span>
      {info.tenBit && <span className="dot-sep">10 bit</span>}
      {info.variableFps && <span className="dot-sep">variable rate</span>}
    </>
  )
}
