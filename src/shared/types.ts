export type ThemeMode = 'light' | 'dark' | 'system'

/** Interface languages. 'system' follows the OS locale and falls back to English. */
export const LANGUAGE_CODES = ['en', 'ro', 'de', 'fr', 'es', 'it'] as const
export type LanguageCode = (typeof LANGUAGE_CODES)[number]
export type Language = 'system' | LanguageCode

/**
 * premiere: H.264 at constant quality, the pair Premiere never argues with.
 * shorts: the whole clip, still 16:9, prepared for a shorts editor in CapCut.
 */
export type Preset = 'premiere' | 'shorts'

/** One preset writes one file, so the two names mean the same thing. */
export type EncodeKind = Preset

export interface MediaInfo {
  width: number
  height: number
  fps: number
  durationSec: number
  videoCodec: string
  audioCodec: string | null
  /** True when the source carries more than 8 bits per channel. */
  tenBit: boolean
  /** True when the container reports a variable frame rate, the usual crash cause. */
  variableFps: boolean
}

export interface QueueFile {
  id: string
  path: string
  name: string
  sizeBytes: number
  info: MediaInfo | null
  /** Set when the file could not be probed, so the row can explain itself. */
  error: string | null
  /** A small JPEG of an early frame as a data URI, or null when none came out. */
  thumb: string | null
}

export type JobState = 'queued' | 'running' | 'done' | 'failed' | 'cancelled'

export interface JobOutput {
  kind: EncodeKind
  path: string
  bytes: number
}

export interface JobProgress {
  id: string
  state: JobState
  /** 0 to 1. */
  percent: number
  /** Encoding speed as a multiple of realtime, e.g. 2.4 means 2.4x. */
  speed: number | null
  /** Which encode is running, shown only when a preset has more than one. */
  stage: EncodeKind | null
  /** Files written so far. One entry per finished stage. */
  outputs: JobOutput[]
  message: string | null
}

export interface ConvertRequest {
  files: { id: string; path: string }[]
  preset: Preset
  /** Constant Rate Factor. Lower keeps more detail and costs size. */
  crf: number
  /** Empty string means write beside each source file. */
  outputDir: string
}

export interface ShutdownStatus {
  /** Armed means Windows holds the timer, not merely this app. */
  armed: boolean
  /** Unix ms when the machine goes down, or null when nothing is armed. */
  at: number | null
}

export interface FfmpegStatus {
  available: boolean
  path: string | null
  version: string | null
  /** The encoder that survived the startup probe, e.g. h264_nvenc. */
  videoEncoder: VideoEncoder
  /** False when no hardware encoder worked and the processor is doing it. */
  hardware: boolean
}

/** 'auto' keeps the startup probe's choice. Anything else forces that encoder. */
export type EncoderChoice = 'auto' | VideoEncoder

export type VideoEncoder = 'h264_nvenc' | 'h264_amf' | 'h264_qsv' | 'libx264'

export const ENCODER_LABELS: Record<EncoderChoice, string> = {
  auto: 'Automatic',
  h264_nvenc: 'Nvidia NVENC',
  h264_amf: 'AMD AMF',
  h264_qsv: 'Intel QuickSync',
  libx264: 'Processor',
}

export const AUDIO_BITRATES = [128, 192, 256, 320] as const

export type UpdateState = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error'

export interface UpdateStatus {
  state: UpdateState
  /** The version waiting on GitHub, once one is known. */
  version: string | null
  /** 0 to 100 while downloading. */
  percent: number
  message: string | null
}

export interface AppSettings {
  theme: ThemeMode
  preset: Preset
  crf: number
  outputDir: string
  encoder: EncoderChoice
  audioBitrate: number
  /** Holds off system sleep while a queue runs. Off risks a truncated file. */
  keepAwake: boolean
  animations: boolean
  autoCheckUpdates: boolean
  language: Language
}

/**
 * The shorts copy is capped at 4K. A 9:16 frame cut from 16:9 is only 9/16 of
 * the width wide, so reaching the 1080x1920 every platform wants needs a
 * source at least 1920 tall. 4K clears that with room to reframe, anything
 * bigger is just weight in CapCut, and smaller sources are never upscaled.
 */
export const SHORTS_MAX_EDGE = 3840

/** Output size of the shorts copy: fitted inside a 3840 box, never enlarged. */
export function shortsSize(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(1, SHORTS_MAX_EDGE / Math.max(width, height, 1))
  const even = (n: number): number => Math.max(2, Math.round((n * scale) / 2) * 2)
  return { width: even(width), height: even(height) }
}

/**
 * Target bitrate in Mbps by output size, at the top of YouTube's upload
 * recommendations for SDR (4K 35-45 / 53-68, 1440p 16 / 24). 1080p sits
 * above YouTube's 8 / 12 because a crop out of it is enlarged on export.
 * Tiers go by the short edge, so a 4096 wide DCI clip still counts as 4K.
 */
export function shortsMbps(width: number, height: number, fps: number): number {
  const out = shortsSize(width, height)
  const short = Math.min(out.width, out.height)
  const high = Math.min(fps, 60) > 30
  if (short >= 1800) return high ? 68 : 45
  if (short >= 1300) return high ? 24 : 16
  return high ? 16 : 12
}

/** The tiers shortsMbps can land on, for the table the interface draws. */
export const SHORTS_TIERS = [
  { label: '4K', low: 45, high: 68 },
  { label: '1440p', low: 16, high: 24 },
  { label: '1080p', low: 12, high: 16 },
] as const
