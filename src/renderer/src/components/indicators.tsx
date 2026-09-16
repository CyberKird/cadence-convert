/* A monochrome glyph set. Every one is currentColor only, so it inherits
   whatever surface it sits on and nothing here introduces a hue. */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function Spinner({ size = 14 }: { size?: number }) {
  const width = 1.8
  const r = (size - width) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ animation: 'spin 0.7s linear infinite' }} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={width} opacity={0.18} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={`${c * 0.28} ${c}`}
      />
    </svg>
  )
}

export function FilmGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <rect x="2.5" y="4" width="15" height="12" rx="2.5" {...stroke} />
      <path d="M6.5 4v12M13.5 4v12" {...stroke} opacity={0.45} />
    </svg>
  )
}

export function CheckGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" {...stroke} strokeWidth={1.9} />
    </svg>
  )
}

export function AlertGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="7" {...stroke} />
      <path d="M10 6.5v4.5" {...stroke} />
      <circle cx="10" cy="13.8" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PlusGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <path d="M10 4.5v11M4.5 10h11" {...stroke} />
    </svg>
  )
}

export function CloseGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" {...stroke} />
    </svg>
  )
}

export function FolderGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <path d="M2.8 6.2a1.7 1.7 0 011.7-1.7h2.6l1.5 1.9h6.7a1.7 1.7 0 011.7 1.7v6a1.7 1.7 0 01-1.7 1.7h-11a1.7 1.7 0 01-1.7-1.7z" {...stroke} />
    </svg>
  )
}

export function SunGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="3.4" {...stroke} />
      <path d="M10 2.4v1.8M10 15.8v1.8M17.6 10h-1.8M4.2 10H2.4M15.4 4.6l-1.3 1.3M5.9 14.1l-1.3 1.3M15.4 15.4l-1.3-1.3M5.9 5.9L4.6 4.6" {...stroke} />
    </svg>
  )
}

export function MoonGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <path d="M16 11.7A6.6 6.6 0 018.3 4a6.6 6.6 0 107.7 7.7z" {...stroke} />
    </svg>
  )
}

export function PowerGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <path d="M10 3.4v6.1" {...stroke} />
      <path d="M14.3 5.7a6 6 0 11-8.6 0" {...stroke} />
    </svg>
  )
}

export function ArrowGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <path d="M4 10h11M10.5 5.5L15 10l-4.5 4.5" {...stroke} strokeWidth={1.8} />
    </svg>
  )
}
