import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import type { AppSettings, Preset, ThemeMode } from '../shared/types'

const DEFAULTS: AppSettings = {
  theme: 'system',
  preset: 'premiere',
  crf: 18,
  outputDir: '',
}

const THEMES: ThemeMode[] = ['light', 'dark', 'system']
const PRESETS: Preset[] = ['premiere', 'transfer', 'both']

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
  } catch {
    // A read only profile should not stop the app, the value still applies
    // for this session.
  }
  return next
}
