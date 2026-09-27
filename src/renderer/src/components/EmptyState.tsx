import type { Preset } from '../../../shared/types'
import { useI18n } from '../i18n'

/**
 * The empty queue shows what the chosen preset actually does to a clip,
 * drawn as plain geometry: Shorts slides a 9:16 window across a 16:9 frame,
 * Social fits a big 16:9 frame down to the size every platform takes, and
 * Premiere lines uneven camera frames up into an even cadence.
 */
export function EmptyState({ preset, over, onPick }: { preset: Preset; over: boolean; onPick: () => void }) {
  const { t } = useI18n()
  return (
    <div
      className="empty"
      data-over={over}
      role="button"
      tabIndex={0}
      onClick={onPick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPick()
        }
      }}
    >
      <div className="empty-art" key={preset}>
        {preset === 'shorts' ? <ShortsArt /> : preset === 'social' ? <SocialArt /> : <PremiereArt />}
        <div className="empty-legend">
          {preset === 'social' ? (
            <>
              <span className="legend-item">
                <i className="legend-swatch" data-kind="frame" />
                {t('empty.socialSource')}
              </span>
              <span className="legend-item">
                <i className="legend-swatch" data-kind="crop" />
                {t('empty.socialOut')}
              </span>
            </>
          ) : preset === 'shorts' ? (
            <>
              <span className="legend-item">
                <i className="legend-swatch" data-kind="frame" />
                {t('empty.shortsSource')}
              </span>
              <span className="legend-item">
                <i className="legend-swatch" data-kind="crop" />
                {t('empty.shortsCrop')}
              </span>
            </>
          ) : (
            <>
              <span className="legend-item">
                <i className="legend-swatch" data-kind="uneven" />
                {t('empty.premiereSource')}
              </span>
              <span className="legend-item">
                <i className="legend-swatch" data-kind="even" />
                {t('empty.premiereOut')}
              </span>
            </>
          )}
        </div>
      </div>
      <h2 className="empty-title">{t('empty.title')}</h2>
      <p className="empty-sub">{t('empty.sub')}</p>
    </div>
  )
}

function ShortsArt() {
  // 240 x 135 is 16:9; the window is 135 tall and 9/16 of that wide.
  return (
    <svg className="art" viewBox="0 0 320 170" width="320" height="170" aria-hidden>
      <defs>
        <mask id="crop-mask">
          <rect x="0" y="0" width="320" height="170" fill="white" />
          <rect className="art-crop-move" x="40" y="16" width="76" height="135" rx="7" fill="black" />
        </mask>
      </defs>
      <rect x="40" y="16" width="240" height="135" rx="11" className="art-frame" />
      <path d="M120 16v135M200 16v135M40 61h240M40 106h240" className="art-guide" />
      <rect x="40" y="16" width="240" height="135" rx="11" className="art-dim" mask="url(#crop-mask)" />
      <g className="art-crop-move">
        <rect x="40" y="16" width="76" height="135" rx="7" className="art-crop" />
        <path d="M46 30v-8h8M110 30v-8h-8M46 137v8h8M110 137v8h-8" className="art-corner" />
      </g>
    </svg>
  )
}

function SocialArt() {
  // The same 16:9 frame as Shorts, with the output box easing from full size
  // down to half of it, the step from 4K to 1080p.
  return (
    <svg className="art" viewBox="0 0 320 170" width="320" height="170" aria-hidden>
      <rect x="40" y="16" width="240" height="135" rx="11" className="art-frame" />
      <path d="M120 16v135M200 16v135M40 61h240M40 106h240" className="art-guide" />
      <rect x="40" y="16" width="240" height="135" rx="11" className="art-crop art-fit" />
    </svg>
  )
}

/** Uneven gaps on top are the variable cadence a camera writes. */
const UNEVEN = [40, 55, 71, 94, 108, 131, 146, 172, 190, 204, 229, 247, 269]
const EVEN = Array.from({ length: 12 }, (_, i) => 40 + i * 20.9)

function PremiereArt() {
  return (
    <svg className="art" viewBox="0 0 320 170" width="320" height="170" aria-hidden>
      <path d="M36 26h248M36 144h248" className="art-guide" />
      {UNEVEN.map((x, i) => (
        <rect
          key={`u${i}`}
          x={x}
          y="32"
          width="11"
          height="34"
          rx="3"
          className="art-cell art-cell-uneven"
          style={{ animationDelay: `${(i * 173) % 900}ms` }}
        />
      ))}
      <path d="M152 80l8 8 8-8" className="art-arrow" />
      {EVEN.map((x, i) => (
        <rect key={`e${i}`} x={x} y="104" width="11" height="34" rx="3" className="art-cell art-cell-even" />
      ))}
      <g className="art-playhead">
        <path d="M40 22v126" />
        <circle cx="40" cy="22" r="3" />
      </g>
    </svg>
  )
}
