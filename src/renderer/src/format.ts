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

/** 3840 becomes 4K, 1920 becomes 1080p. Anything else keeps its height. */
export function resolution(width: number, height: number): string {
  if (!width || !height) return '--'
  if (width >= 3800) return '4K'
  if (width >= 2500) return '1440p'
  if (width >= 1900) return '1080p'
  if (width >= 1200) return '720p'
  return `${height}p`
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
  return change <= 0 ? `${change}%` : `+${change}%`
}
