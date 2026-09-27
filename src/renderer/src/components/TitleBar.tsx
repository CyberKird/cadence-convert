import { useEffect, useRef, useState } from 'react'
import type { ShutdownStatus, UpdateStatus } from '../../../shared/types'
import { countdown } from '../format'
import { useI18n } from '../i18n'
import mark from '../assets/mark.png'
import { DownloadGlyph, GearGlyph, MoonGlyph, PowerGlyph, RestartGlyph, SunGlyph } from './indicators'

const UNITS = [
  { key: 'h' as const, max: 23 },
  { key: 'm' as const, max: 59 },
  { key: 's' as const, max: 59 },
]

export function TitleBar({
  version,
  update,
  shutdown,
  now,
  dark,
  settingsOpen,
  onTheme,
  onSettings,
  onDownloadUpdate,
  onInstallUpdate,
  onArm,
  onCancelShutdown,
}: {
  version: string
  update: UpdateStatus
  shutdown: ShutdownStatus
  now: number
  dark: boolean
  settingsOpen: boolean
  onTheme: (origin: HTMLElement) => void
  onSettings: () => void
  onDownloadUpdate: () => void
  onInstallUpdate: () => void
  onArm: (seconds: number) => void
  onCancelShutdown: () => void
}) {
  const { t } = useI18n()
  const [powerOpen, setPowerOpen] = useState(false)
  const [hms, setHms] = useState({ h: 1, m: 0, s: 0 })
  const powerRef = useRef<HTMLDivElement>(null)
  const seconds = hms.h * 3600 + hms.m * 60 + hms.s

  useEffect(() => {
    if (!powerOpen) return
    const onDown = (e: PointerEvent): void => {
      if (!powerRef.current?.contains(e.target as Node)) setPowerOpen(false)
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setPowerOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [powerOpen])

  const armed = shutdown.armed && shutdown.at !== null

  return (
    <header className="titlebar">
      <div className="brand">
        <img className="brand-mark" src={mark} alt="" draggable={false} />
        <span className="brand-name">Cadence Convert</span>
        {version && <span className="brand-version numeral">{version}</span>}
      </div>

      <div className="spacer" />

      <div className="title-actions">
        {update.state === 'available' && (
          <button className="update-pill" onClick={onDownloadUpdate}>
            <DownloadGlyph size={14} />
            {t('update.available', { v: update.version ?? '' })}
          </button>
        )}
        {update.state === 'downloading' && (
          <span className="update-pill" data-busy="true">
            <span className="update-progress" style={{ clipPath: `inset(0 ${100 - update.percent}% 0 0)` }} aria-hidden />
            <DownloadGlyph size={14} />
            <span className="numeral">{t('update.downloading', { p: update.percent })}</span>
          </span>
        )}
        {update.state === 'ready' && (
          <button className="update-pill" onClick={onInstallUpdate}>
            <RestartGlyph size={14} />
            {t('update.ready')}
          </button>
        )}

        <div className="power" ref={powerRef}>
          <button
            className="icon-btn"
            data-active={armed || powerOpen}
            data-wide={armed}
            data-tip={powerOpen ? undefined : t('tip.power')}
            aria-label={t('tip.power')}
            aria-expanded={powerOpen}
            onClick={() => setPowerOpen((o) => !o)}
          >
            <PowerGlyph />
            {armed && <span className="numeral power-inline">{countdown(shutdown.at! - now)}</span>}
          </button>

          {powerOpen && (
            <div className="popover" role="dialog" aria-label={t('tip.power')}>
              {armed ? (
                <>
                  <span className="popover-title">{t('power.armed')}</span>
                  <span className="power-count numeral">{countdown(shutdown.at! - now)}</span>
                  <button className="btn btn-outline" onClick={onCancelShutdown}>
                    {t('power.cancel')}
                  </button>
                </>
              ) : (
                <>
                  <span className="popover-title">{t('power.title')}</span>
                  <div className="hms">
                    {UNITS.map(({ key, max }) => (
                      <label key={key} className="hms-unit">
                        <input
                          className="hms-input numeral"
                          type="number"
                          min={0}
                          max={max}
                          value={hms[key]}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const v = Math.min(max, Math.max(0, Math.floor(Number(e.target.value) || 0)))
                            setHms((prev) => ({ ...prev, [key]: v }))
                          }}
                        />
                        <span>{t(`unit.${key}`)}</span>
                      </label>
                    ))}
                  </div>
                  <p className="popover-hint">{t('power.hint')}</p>
                  <button
                    className="btn solid"
                    disabled={seconds === 0}
                    onClick={() => {
                      onArm(seconds)
                      setPowerOpen(false)
                    }}
                  >
                    <PowerGlyph size={15} />
                    {t('power.arm')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <button
          className="icon-btn icon-theme"
          data-tip={dark ? t('tip.themeLight') : t('tip.themeDark')}
          aria-label={dark ? t('tip.themeLight') : t('tip.themeDark')}
          onClick={(e) => onTheme(e.currentTarget)}
        >
          {dark ? <SunGlyph /> : <MoonGlyph />}
        </button>

        <button
          className="icon-btn icon-gear"
          data-active={settingsOpen}
          data-tip={t('tip.settings')}
          aria-label={t('tip.settings')}
          aria-pressed={settingsOpen}
          onClick={onSettings}
        >
          <GearGlyph />
          {(update.state === 'available' || update.state === 'ready') && (
            <span className="badge" aria-hidden />
          )}
        </button>
      </div>
    </header>
  )
}
