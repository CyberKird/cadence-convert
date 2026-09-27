export type ThemeMode = 'light' | 'dark' | 'system'

/** Interface languages. 'system' follows the OS locale and falls back to English. */
export const LANGUAGE_CODES = ['en', 'ro', 'de', 'fr', 'es', 'it'] as const
export type LanguageCode = (typeof LANGUAGE_CODES)[number]
export type Language = 'system' | LanguageCode

/**
 * premiere: H.264 at constant quality, the pair Premiere never argues with.
 * shorts: the whole clip, still 16:9, prepared for a shorts editor in CapCut.
 * social: the whole clip, still 16:9, inside the limits of every platform so
 * it uploads as is to YouTube, TikTok and Instagram.
 */
export type Preset = 'premiere' | 'shorts' | 'social'
export const PRESETS: readonly Preset[] = ['premiere', 'shorts', 'social']

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

/** Presets that scale to a size and encode to a bitrate target. */
export type SizedPreset = Exclude<Preset, 'premiere'>

export interface BitrateTier {
  label: string
  /** Smallest short edge of the output that lands on this tier. */
  minShort: number
  /** Mbps up to 30 fps, and above it. */
  low: number
  high: number
}

export interface SizedProfile {
  /** Longest edge of the output. Smaller sources are never enlarged. */
  maxEdge: number
  tiers: readonly BitrateTier[]
  /** Hard ceiling on the peak rate, when a platform enforces one. */
  peakMbps: number | null
  /** Fixed audio rate, when a platform enforces one. Null follows settings. */
  audioKbps: number | null
}

export const PROFILES: Record<SizedPreset, SizedProfile> = {
  /**
   * Capped at 4K. A 9:16 frame cut from 16:9 is only 9/16 of the width wide,
   * so reaching the 1080x1920 every platform wants needs a source at least
   * 1920 tall. 4K clears that with room to reframe. Rates sit at the top of
   * YouTube's SDR upload recommendations (4K 35-45 / 53-68, 1440p 16 / 24);
   * 1080p sits above YouTube's 8 / 12 because a crop out of it is enlarged.
   * Tiers go by the short edge, so a 4096 wide DCI clip still counts as 4K.
   */
  shorts: {
    maxEdge: 3840,
    peakMbps: null,
    audioKbps: null,
    tiers: [
      { label: '4K', minShort: 1800, low: 45, high: 68 },
      { label: '1440p', minShort: 1300, low: 16, high: 24 },
      { label: '1080p', minShort: 0, low: 12, high: 16 },
    ],
  },
  /**
   * The strictest of the three platforms sets every limit: Instagram's Reels
   * spec takes at most 1920 horizontal pixels, 25 Mbps VBR, 60 fps and AAC
   * at 128 kbps 48 kHz. TikTok (up to 4096 px) and YouTube accept all of it.
   */
  social: {
    maxEdge: 1920,
    peakMbps: 25,
    audioKbps: 128,
    tiers: [
      { label: '1080p', minShort: 1000, low: 16, high: 20 },
      { label: '720p', minShort: 0, low: 8, high: 10 },
    ],
  },
}

/** Output size: fitted inside the profile's box, never enlarged. */
export function outputSize(
  preset: SizedPreset,
  width: number,
  height: number,
): { width: number; height: number } {
  const scale = Math.min(1, PROFILES[preset].maxEdge / Math.max(width, height, 1))
  const even = (n: number): number => Math.max(2, Math.round((n * scale) / 2) * 2)
  return { width: even(width), height: even(height) }
}

/** Index into the profile's tiers that a clip of this size lands on. */
export function tierIndex(preset: SizedPreset, width: number, height: number): number {
  const out = outputSize(preset, width, height)
  const short = Math.min(out.width, out.height)
  const tiers = PROFILES[preset].tiers
  const i = tiers.findIndex((t) => short >= t.minShort)
  return i === -1 ? tiers.length - 1 : i
}

/** Target bitrate in Mbps for a clip of this size and frame rate. */
export function targetMbps(preset: SizedPreset, width: number, height: number, fps: number): number {
  const tier = PROFILES[preset].tiers[tierIndex(preset, width, height)]
  return Math.min(fps, 60) > 30 ? tier.high : tier.low
}
