/* A monochrome glyph set. Every one is currentColor only, so it inherits
   whatever surface it sits on and nothing here introduces a hue. Drawn on a
   20 unit grid at a 1.6 stroke, so they read as one family at any size. */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

type GlyphProps = { size?: number; className?: string }

export function Spinner({ size = 14 }: { size?: number }) {
  const width = 1.8
  const r = (size - width) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="spin" aria-hidden>
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

export function FilmGlyph({ size = 15, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <rect x="2.5" y="4" width="15" height="12" rx="2.5" {...stroke} />
      <path d="M6.5 4v12M13.5 4v12" {...stroke} opacity={0.45} />
    </svg>
  )
}

/** pathLength 1 lets CSS draw the tick on with a single dash offset. */
export function CheckGlyph({ size = 15, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" {...stroke} strokeWidth={1.9} pathLength={1} className="check-path" />
    </svg>
  )
}

export function AlertGlyph({ size = 15, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <circle cx="10" cy="10" r="7" {...stroke} />
      <path d="M10 6.5v4.5" {...stroke} />
      <circle cx="10" cy="13.8" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PlusGlyph({ size = 15, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M10 4.5v11M4.5 10h11" {...stroke} />
    </svg>
  )
}

export function CloseGlyph({ size = 14, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" {...stroke} />
    </svg>
  )
}

export function FolderGlyph({ size = 14, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M2.8 6.2a1.7 1.7 0 011.7-1.7h2.6l1.5 1.9h6.7a1.7 1.7 0 011.7 1.7v6a1.7 1.7 0 01-1.7 1.7h-11a1.7 1.7 0 01-1.7-1.7z" {...stroke} />
    </svg>
  )
}

export function SunGlyph({ size = 16, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <circle cx="10" cy="10" r="3.4" {...stroke} />
      <path d="M10 2.4v1.8M10 15.8v1.8M17.6 10h-1.8M4.2 10H2.4M15.4 4.6l-1.3 1.3M5.9 14.1l-1.3 1.3M15.4 15.4l-1.3-1.3M5.9 5.9L4.6 4.6" {...stroke} />
    </svg>
  )
}

export function MoonGlyph({ size = 16, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M16 11.7A6.6 6.6 0 018.3 4a6.6 6.6 0 107.7 7.7z" {...stroke} />
    </svg>
  )
}

/**
 * A toothed cog, so it can never be mistaken for the sun beside it. Outline
 * adapted from Lucide's settings icon (ISC licence), on its 24 unit grid with
 * the stroke scaled to match the 20 unit set.
 */
export function GearGlyph({ size = 17, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        {...stroke}
        strokeWidth={1.85}
      />
      <circle cx="12" cy="12" r="3" {...stroke} strokeWidth={1.85} />
    </svg>
  )
}

export function DownloadGlyph({ size = 15, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M10 3.5v8.5" {...stroke} />
      <path d="M6.4 8.6L10 12.2l3.6-3.6" {...stroke} />
      <path d="M4.2 15.2h11.6" {...stroke} />
    </svg>
  )
}

export function RestartGlyph({ size = 15, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M4.2 10a5.8 5.8 0 1 0 1.7-4.1" {...stroke} />
      <path d="M4 3.6v2.9h2.9" {...stroke} />
    </svg>
  )
}

export function BackGlyph({ size = 15, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M12 4.5L6.5 10l5.5 5.5" {...stroke} strokeWidth={1.8} />
    </svg>
  )
}

export function ChevronGlyph({ size = 13, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M5.5 8l4.5 4.5L14.5 8" {...stroke} strokeWidth={1.8} />
    </svg>
  )
}

export function PowerGlyph({ size = 16, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M10 3.4v6.1" {...stroke} />
      <path d="M14.3 5.7a6 6 0 11-8.6 0" {...stroke} />
    </svg>
  )
}

export function ArrowGlyph({ size = 15, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M4 10h11M10.5 5.5L15 10l-4.5 4.5" {...stroke} strokeWidth={1.8} />
    </svg>
  )
}
