import type { ReactNode } from 'react'
import {
  AUDIO_BITRATES,
  ENCODER_LABELS,
  LANGUAGE_CODES,
  type AppSettings,
  type EncoderChoice,
  type FfmpegStatus,
  type Language,
  type ThemeMode,
  type UpdateStatus,
  type VideoEncoder,
} from '../../../shared/types'
import { nativeName, type Translate } from '../../../shared/i18n'
import { useI18n } from '../i18n'
import { Segmented, Select, Slider, Toggle } from './controls'
import { BackGlyph, CheckGlyph, DownloadGlyph, FolderGlyph, RestartGlyph, Spinner } from './indicators'

const ENCODER_ORDER: EncoderChoice[] = ['auto', 'h264_nvenc', 'h264_amf', 'h264_qsv', 'libx264']

export function Settings({
  settings,
  ffmpeg,
  detected,
  update,
  version,
  onBack,
  onPatch,
  onTheme,
  onPickFolder,
  onCheckUpdate,
  onDownloadUpdate,
  onInstallUpdate,
}: {
  settings: AppSettings
  ffmpeg: FfmpegStatus
  detected: VideoEncoder | null
  update: UpdateStatus
  version: string
  onBack: () => void
  onPatch: (patch: Partial<AppSettings>) => void
  onTheme: (mode: ThemeMode, origin: HTMLElement | null) => void
  onPickFolder: () => void
  onCheckUpdate: () => void
  onDownloadUpdate: () => void
  onInstallUpdate: () => void
}) {
  const { t, systemLang } = useI18n()
  const encoderLabel = (e: EncoderChoice): string =>
    e === 'auto' ? t('enc.auto') : e === 'libx264' ? t('enc.cpu') : ENCODER_LABELS[e]

  return (
    <section className="settings glass">
      <header className="settings-head">
        <button className="btn btn-quiet btn-back" onClick={onBack}>
          <BackGlyph size={16} />
          {t('settings.back')}
        </button>
        <h1 className="settings-title">{t('settings.title')}</h1>
      </header>

      <div className="settings-scroll">
        <div className="settings-body">
          <Section title={t('sec.general')} index={0}>
            <Row label={t('set.language')} hint={t('set.languageHint')}>
              <Select<Language>
                label={t('set.language')}
                value={settings.language}
                onChange={(language) => onPatch({ language })}
                options={[
                  { value: 'system', label: t('set.languageSystem', { name: nativeName(systemLang) }) },
                  ...LANGUAGE_CODES.map((code) => ({ value: code as Language, label: nativeName(code) })),
                ]}
              />
            </Row>
            <Row label={t('set.theme')}>
              <div
                // The reveal starts from whichever segment was pressed.
                onClickCapture={(e) => (lastOrigin = e.target as HTMLElement)}
              >
                <Segmented<ThemeMode>
                  label={t('set.theme')}
                  value={settings.theme}
                  onChange={(mode) => onTheme(mode, lastOrigin)}
                  options={[
                    { value: 'system', label: t('set.themeSystem') },
                    { value: 'light', label: t('set.themeLight') },
                    { value: 'dark', label: t('set.themeDark') },
                  ]}
                />
              </div>
            </Row>
            <Row label={t('set.motion')} hint={t('set.motionHint')}>
              <Toggle
                label={t('set.motion')}
                on={!settings.animations}
                onChange={(reduce) => onPatch({ animations: !reduce })}
              />
            </Row>
          </Section>

          <Section title={t('sec.encoding')} index={1}>
            <Row
              label={t('set.encoder')}
              hint={
                settings.encoder === 'auto' && detected
                  ? t('set.encoderAuto', { name: encoderLabel(detected) })
                  : t('set.encoderForced')
              }
            >
              <Select<EncoderChoice>
                label={t('set.encoder')}
                value={settings.encoder}
                onChange={(encoder) => onPatch({ encoder })}
                options={ENCODER_ORDER.map((e) => ({
                  value: e,
                  label:
                    e === 'auto' && detected
                      ? `${encoderLabel(e)} (${encoderLabel(detected)})`
                      : encoderLabel(e),
                }))}
              />
            </Row>
            <Row label={t('set.quality')} hint={t('quality.hint')}>
              <div className="row-control">
                <Slider
                  min={12}
                  max={30}
                  value={settings.crf}
                  label={t('set.quality')}
                  onChange={(crf) => onPatch({ crf })}
                />
                <span className="numeral control-value">{settings.crf}</span>
              </div>
            </Row>
            <Row label={t('set.audio')} hint={t('set.audioHint')}>
              <Segmented<number>
                label={t('set.audio')}
                value={settings.audioBitrate}
                onChange={(audioBitrate) => onPatch({ audioBitrate })}
                options={AUDIO_BITRATES.map((b) => ({
                  value: b,
                  label: <span className="numeral">{b}</span>,
                }))}
              />
            </Row>
          </Section>

          <Section title={t('sec.output')} index={2}>
            <Row label={t('set.folder')} hint={settings.outputDir || t('output.beside')}>
              <div className="row-control">
                {settings.outputDir && (
                  <button className="btn btn-quiet btn-sm" onClick={() => onPatch({ outputDir: '' })}>
                    {t('output.reset')}
                  </button>
                )}
                <button className="btn btn-outline btn-sm" onClick={onPickFolder}>
                  <FolderGlyph size={14} />
                  {t('output.change')}
                </button>
              </div>
            </Row>
          </Section>

          <Section title={t('sec.power')} index={3}>
            <Row label={t('set.awake')} hint={t('set.awakeHint')}>
              <Toggle
                label={t('set.awake')}
                on={settings.keepAwake}
                onChange={(keepAwake) => onPatch({ keepAwake })}
              />
            </Row>
          </Section>

          <Section title={t('sec.updates')} index={4}>
            <Row label={t('set.version')} hint={t('set.versionHint')}>
              <span className="numeral control-value">{version ? `v${version}` : '--'}</span>
            </Row>
            <Row label={t('set.autoCheck')} hint={t('set.autoCheckHint')}>
              <Toggle
                label={t('set.autoCheck')}
                on={settings.autoCheckUpdates}
                onChange={(autoCheckUpdates) => onPatch({ autoCheckUpdates })}
              />
            </Row>
            <Row
              label={t('set.status')}
              hint={updateText(update, t)}
              detail={update.state === 'error' ? firstLine(update.message) : undefined}
              live
            >
              <div className="row-control">
                {update.state === 'checking' && <Spinner size={16} />}
                {update.state === 'downloading' && (
                  <div className="mini-track" aria-hidden>
                    <div style={{ clipPath: `inset(0 ${100 - update.percent}% 0 0 round 99px)` }} />
                  </div>
                )}
                {update.state === 'available' && (
                  <button className="btn solid btn-sm" onClick={onDownloadUpdate}>
                    <DownloadGlyph size={14} />
                    {t('upd.download')}
                  </button>
                )}
                {update.state === 'ready' && (
                  <button className="btn solid btn-sm" onClick={onInstallUpdate}>
                    <RestartGlyph size={14} />
                    {t('upd.install')}
                  </button>
                )}
                {update.state === 'error' && (
                  <button className="btn btn-quiet btn-sm" onClick={() => window.open(RELEASES_URL)}>
                    {t('upd.releases')}
                  </button>
                )}
                {(update.state === 'idle' || update.state === 'error') && (
                  <button className="btn btn-outline btn-sm" onClick={onCheckUpdate}>
                    {update.message === 'latest' && <CheckGlyph size={14} />}
                    {t('upd.check')}
                  </button>
                )}
              </div>
            </Row>
          </Section>

          <Section title={t('sec.system')} index={5}>
            <Row label={t('set.ffmpeg')} hint={ffmpeg.path ?? undefined}>
              <span className="control-value">{ffmpeg.version ?? t('set.ffmpegMissing')}</span>
            </Row>
            <Row label={t('set.active')} hint={t('set.activeHint')}>
              <span className="tag tag-lg">{encoderLabel(ffmpeg.videoEncoder)}</span>
            </Row>
          </Section>
        </div>
      </div>
    </section>
  )
}

const RELEASES_URL = 'https://github.com/CyberKird/cadence-convert/releases/latest'

/** electron-updater errors can run to a stack trace; the first line is the part worth showing. */
function firstLine(message: string | null): string | undefined {
  return message ? message.split('\n')[0].slice(0, 220) : undefined
}

/** Remembered between the capture and the change, so the theme reveal knows where it began. */
let lastOrigin: HTMLElement | null = null

function updateText(u: UpdateStatus, t: Translate): string {
  switch (u.state) {
    case 'checking':
      return t('upd.checking')
    case 'available':
      return t('upd.available', { v: u.version ?? '' })
    case 'downloading':
      return t('upd.downloading', { p: u.percent })
    case 'ready':
      return t('upd.ready', { v: u.version ?? '' })
    case 'error': {
      // Plain words and a next step first; the raw detail sits underneath.
      const raw = u.message ?? ''
      if (
        /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|ECONNREFUSED|net::ERR|getaddrinfo|socket hang up/i.test(raw)
      )
        return t('upd.errNetwork')
      if (/\b404\b|Cannot find latest|No published versions/i.test(raw)) return t('upd.errNoRelease')
      return t('upd.error')
    }
    default:
      return u.message === 'latest' ? t('upd.latest') : u.message === 'dev' ? t('upd.dev') : t('upd.idle')
  }
}

function Section({ title, index, children }: { title: string; index: number; children: ReactNode }) {
  return (
    <section className="settings-section" style={{ animationDelay: `${index * 45}ms` }}>
      <h2>{title}</h2>
      <div className="settings-group">{children}</div>
    </section>
  )
}

function Row({
  label,
  hint,
  detail,
  live,
  children,
}: {
  label: string
  hint?: string
  /** A raw technical line under the hint, selectable so it can be copied into a report. */
  detail?: string
  live?: boolean
  children: ReactNode
}) {
  return (
    <div className="settings-row">
      <div className="settings-text">
        <span className="settings-label">{label}</span>
        {hint && (
          <span className="settings-hint" aria-live={live ? 'polite' : undefined}>
            {hint}
          </span>
        )}
        {detail && (
          <span className="settings-detail" title={detail}>
            {detail}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
