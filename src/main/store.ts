import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import { AUDIO_BITRATES, type AppSettings, type EncoderChoice, type Preset, type ThemeMode } from '../shared/types'

const DEFAULTS: AppSettings = {
  theme: 'system',
  preset: 'premiere',
  crf: 18,
  outputDir: '',
  encoder: 'auto',
  audioBitrate: 192,
  keepAwake: true,
  animations: true,
  autoCheckUpdates: true,
}

const THEMES: ThemeMode[] = ['light', 'dark', 'system']
const PRESETS: Preset[] = ['premiere', 'transfer', 'both']
const ENCODERS: EncoderChoice[] = ['auto', 'h264_nvenc', 'h264_amf', 'h264_qsv', 'libx264']

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

let cache: AppSettings | null = null

function file(): string {
  return join(app.getPath('userData'), 'settings.json')
}

/**
 * Reads with every field validated rather than trusted. The file is editable
 * by hand, so a bad value there must not reach ffmpeg as an argument.
 */
export function read(): AppSettings {
  if (cache) return cache

  try {
    const raw = JSON.parse(readFileSync(file(), 'utf8')) as Partial<AppSettings>
    cache = {
      theme: THEMES.includes(raw.theme as ThemeMode) ? (raw.theme as ThemeMode) : DEFAULTS.theme,
      preset: PRESETS.includes(raw.preset as Preset) ? (raw.preset as Preset) : DEFAULTS.preset,
      crf:
        typeof raw.crf === 'number' && raw.crf >= 12 && raw.crf <= 30
          ? Math.round(raw.crf)
          : DEFAULTS.crf,
      outputDir: typeof raw.outputDir === 'string' ? raw.outputDir : DEFAULTS.outputDir,
      encoder: ENCODERS.includes(raw.encoder as EncoderChoice)
        ? (raw.encoder as EncoderChoice)
        : DEFAULTS.encoder,
      audioBitrate: (AUDIO_BITRATES as readonly number[]).includes(raw.audioBitrate as number)
        ? (raw.audioBitrate as number)
        : DEFAULTS.audioBitrate,
      keepAwake: bool(raw.keepAwake, DEFAULTS.keepAwake),
      animations: bool(raw.animations, DEFAULTS.animations),
      autoCheckUpdates: bool(raw.autoCheckUpdates, DEFAULTS.autoCheckUpdates),
    }
  } catch {
    cache = { ...DEFAULTS }
  }
  return cache
}

export function write(patch: Partial<AppSettings>): AppSettings {
  const next = { ...read(), ...patch }
  cache = next
  try {
    writeFileSync(file(), JSON.stringify(next, null, 2), 'utf8')
    // Re-read so anything the renderer sent goes through the same validation
    // that guards the file on disk, rather than being trusted once.
    cache = null
    return read()
  } catch {
    // A read only profile should not stop the app. The value still applies
    // for this session, it just will not survive a restart.
    return next
  }
}
