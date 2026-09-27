import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { CheckGlyph, ChevronGlyph } from './indicators'

export interface Option<T extends string | number> {
  value: T
  label: ReactNode
  /** Second line under the label, used by the large preset switch. */
  sub?: ReactNode
}

/**
 * A segmented switch whose active fill is one element that slides, rather
 * than a background jumping between buttons. Measured from the DOM, because
 * the labels differ in width and equal slices would clip the widest.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
  disabled,
  label,
}: {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'md' | 'lg'
  disabled?: boolean
  label: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const measure = (): void => {
      const active = el.querySelector<HTMLElement>('[aria-checked="true"]')
      if (!active) return
      setPill({ x: active.offsetLeft, w: active.offsetWidth })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, options.length])

  return (
    <div className="seg" data-size={size} ref={root} role="radiogroup" aria-label={label}>
      {pill && (
        <span
          className="seg-pill"
          style={{ transform: `translateX(${pill.x}px)`, width: pill.w }}
          aria-hidden
        />
      )}
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className="seg-item"
          disabled={disabled}
          onClick={() => onChange(o.value)}
        >
          <span className="seg-label">{o.label}</span>
          {o.sub && <span className="seg-sub">{o.sub}</span>}
        </button>
      ))}
    </div>
  )
}

/**
 * A listbox that looks like the rest of the app instead of the grey system
 * dropdown Chromium draws. Arrow keys move, Enter picks, Escape and a click
 * anywhere else close it.
 */
export function Select<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    setCursor(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    )
    const onDown = (e: PointerEvent): void => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [open, options, value])

  const pick = (v: T): void => {
    onChange(v)
    setOpen(false)
  }

  return (
    <div
      className="select"
      ref={root}
      data-open={open}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false)
        if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          setOpen(true)
          return
        }
        if (!open) return
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setCursor((c) => Math.min(options.length - 1, c + 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setCursor((c) => Math.max(0, c - 1))
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          pick(options[cursor].value)
        }
      }}
    >
      <button
        type="button"
        className="select-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="select-value">{current?.label}</span>
        <ChevronGlyph className="select-chevron" />
      </button>
      {open && (
        <ul className="select-menu" role="listbox" aria-label={label}>
          {options.map((o, i) => (
            <li
              key={String(o.value)}
              role="option"
              aria-selected={o.value === value}
              data-cursor={i === cursor}
              className="select-option"
              onPointerEnter={() => setCursor(i)}
              onClick={() => pick(o.value)}
            >
              <span>{o.label}</span>
              {o.value === value && <CheckGlyph size={14} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      className="toggle"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
    >
      <span className="toggle-knob" />
    </button>
  )
}

/** A range input whose filled part is painted from the value, which native WebKit does not do. */
export function Slider({
  min,
  max,
  value,
  onChange,
  disabled,
  label,
}: {
  min: number
  max: number
  value: number
  onChange: (v: number) => void
  disabled?: boolean
  label: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <input
      className="slider"
      type="range"
      min={min}
      max={max}
      value={value}
      disabled={disabled}
      aria-label={label}
      style={{ '--pct': `${pct}%` } as React.CSSProperties}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}
