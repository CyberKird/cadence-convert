export function bytes(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '--'
  if (value < 1024) return `${value} B`
  const units = ['KB', 'MB', 'GB']
  let n = value / 1024
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i += 1
  }
  return `${n < 10 ? n.toFixed(1) : Math.round(n)} ${units[i]}`
}

export function duration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '--'
  const total = Math.round(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Named by the short edge, so a vertical 1080x1920 phone clip reads as 1080p
 * and a 4096 wide DCI clip still reads as 4K.
 */
export function resolution(width: number, height: number): string {
  if (!width || !height) return '--'
  const short = Math.min(width, height)
  if (short >= 2100) return '4K'
  if (short >= 1400) return '1440p'
  if (short >= 1000) return '1080p'
  if (short >= 700) return '720p'
  return `${short}p`
}

/** hevc becomes HEVC, h264 becomes H.264; anything else is shown as ffprobe names it. */
export function codec(name: string): string {
  const known: Record<string, string> = {
    h264: 'H.264',
    hevc: 'HEVC',
    av1: 'AV1',
    vp9: 'VP9',
    prores: 'ProRes',
    mpeg2video: 'MPEG-2',
    mpeg4: 'MPEG-4',
  }
  return known[name] ?? name.toUpperCase()
}

/** m:ss under an hour, h:mm:ss above, for remaining time next to a bar. */
export function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '--'
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

export function fps(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '--'
  return `${Math.round(value * 100) / 100} fps`.replace('.00 ', ' ')
}

/** h:mm:ss, so a running countdown never changes width as it ticks. */
export function countdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Signed percentage change, used for the size delta after an encode. */
export function delta(before: number, after: number): string {
  if (!before || !after) return ''
  const change = Math.round(((after - before) / before) * 100)
  // A real minus sign, which sits at the width and height of the plus.
  return change <= 0 ? `−${Math.abs(change)}%` : `+${change}%`
}
