export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * premiere: rewraps to the codec pair Premiere never argues with.
 * transfer: HEVC at a chosen quality, for upload and file sending.
 */
export type EncodeKind = 'premiere' | 'transfer'

/** 'both' runs the two encodes back to back and writes two files. */
export type Preset = EncodeKind | 'both'

/** The quality 'both' pins itself to, so one run is never the weaker copy. */
export const BOTH_CRF = 18

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
  /** 0 to 1 across every stage, so 'both' fills once rather than twice. */
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
  videoEncoder: string
  /** False when no hardware encoder worked and the processor is doing it. */
  hardware: boolean
}

export interface AppSettings {
  theme: ThemeMode
  preset: Preset
  crf: number
  outputDir: string
}
