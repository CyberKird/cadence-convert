import { spawn } from 'node:child_process'
import { access, rm, stat } from 'node:fs/promises'
import { constants } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import type { EncodeKind, EncoderChoice, MediaInfo, VideoEncoder } from '../shared/types'

/**
 * Candidate locations, in the order a Windows machine usually has them. The
 * plain names rely on PATH, which is where a winget or choco install lands.
 */
const FFMPEG_CANDIDATES = ['ffmpeg', 'C:\\ffmpeg\\bin\\ffmpeg.exe']
const FFPROBE_CANDIDATES = ['ffprobe', 'C:\\ffmpeg\\bin\\ffprobe.exe']

let ffmpegPath: string | null = null
let ffprobePath: string | null = null

/** Runs a binary with no shell, so a path with spaces cannot become two args. */
function exec(
  bin: string,
  args: string[],
  timeoutMs = 20000,
): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    let settled = false

    const child = spawn(bin, args, { windowsHide: true })
    const timer = setTimeout(() => {
      child.kill()
      if (!settled) {
        settled = true
        resolve({ ok: false, stdout, stderr: 'timed out' })
      }
    }, timeoutMs)

    child.stdout.on('data', (d) => (stdout += d.toString()))
    child.stderr.on('data', (d) => (stderr += d.toString()))
    child.on('error', () => {
      clearTimeout(timer)
      if (!settled) {
        settled = true
        resolve({ ok: false, stdout, stderr: 'not found' })
      }
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (!settled) {
        settled = true
        resolve({ ok: code === 0, stdout, stderr })
      }
    })
  })
}

async function firstWorking(candidates: string[]): Promise<string | null> {
  for (const bin of candidates) {
    const { ok } = await exec(bin, ['-version'], 6000)
    if (ok) return bin
  }
  return null
}

export async function locate(): Promise<{ path: string | null; version: string | null }> {
  ffmpegPath = await firstWorking(FFMPEG_CANDIDATES)
  ffprobePath = await firstWorking(FFPROBE_CANDIDATES)
  if (!ffmpegPath) return { path: null, version: null }

  const { stdout } = await exec(ffmpegPath, ['-version'], 6000)
  const version = stdout.split('\n')[0]?.replace('ffmpeg version ', '').split(' ')[0] ?? null

  detected = await pickEncoder()

  return { path: ffmpegPath, version }
}

/** Frame rate strings arrive as "30000/1001". Zero denominators do occur. */
function parseRate(rate: string | undefined): number {
  if (!rate) return 0
  const [num, den] = rate.split('/').map(Number)
  if (!num || !den) return 0
  return num / den
}

export async function probe(path: string): Promise<MediaInfo> {
  if (!ffprobePath) throw new Error('ffprobe not available')

  const { ok, stdout, stderr } = await exec(ffprobePath, [
    '-v',
    'error',
    '-show_entries',
    'stream=codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,pix_fmt',
    '-show_entries',
    'format=duration',
    '-of',
    'json',
    path,
  ])
  if (!ok) throw new Error(stderr.trim().split('\n').pop() || 'could not read file')

  const parsed = JSON.parse(stdout) as {
    streams?: {
      codec_type?: string
      codec_name?: string
      width?: number
      height?: number
      r_frame_rate?: string
      avg_frame_rate?: string
      pix_fmt?: string
    }[]
    format?: { duration?: string }
  }

  const video = parsed.streams?.find((s) => s.codec_type === 'video')
  const audio = parsed.streams?.find((s) => s.codec_type === 'audio')
  if (!video) throw new Error('no video track')

  const nominal = parseRate(video.r_frame_rate)
  const average = parseRate(video.avg_frame_rate)

  return {
    width: video.width ?? 0,
    height: video.height ?? 0,
    fps: average || nominal,
    durationSec: Number(parsed.format?.duration ?? 0),
    videoCodec: video.codec_name ?? 'unknown',
    audioCodec: audio?.codec_name ?? null,
    // Matches yuv420p10le, yuv422p10be and p010. A bare '10' test would also
    // catch yuv410p, which is 8 bit with 4:1:0 chroma.
    tenBit: /10(le|be)$|p010/.test(video.pix_fmt ?? ''),
    // A gap between nominal and average rate is what variable frame rate looks
    // like from outside. The 1% band keeps rounding noise from flagging.
    variableFps: nominal > 0 && average > 0 && Math.abs(nominal - average) / nominal > 0.01,
  }
}

/** Nvidia, then AMD, then Intel. Anything else falls back to the processor. */
const HW_ENCODERS: VideoEncoder[] = ['h264_nvenc', 'h264_amf', 'h264_qsv']

/** What the startup probe found, before any user override. */
let detected: VideoEncoder = 'libx264'
let override: EncoderChoice = 'auto'
let audioBitrate = 192

export function activeEncoder(): VideoEncoder {
  return override === 'auto' ? detected : override
}

export function detectedEncoder(): VideoEncoder {
  return detected
}

/** Settings the renderer owns, handed over before a queue runs. */
export function configure(opts: { encoder: EncoderChoice; audioBitrate: number }): void {
  override = opts.encoder
  audioBitrate = opts.audioBitrate
}

/**
 * A hardware encoder's QP scale is not x264's CRF scale, so the slider cannot
 * drive both the same way. Measured on a 4K60 clip: AMF at QP 20 produced 61
 * Mbps where x264 at CRF 18 lands near 37, and roughly every six points of QP
 * halves the rate. Shifting six points across makes one slider number mean
 * about the same file size whichever encoder is running.
 */
function gpuQp(crf: number): number {
  return Math.min(51, crf + 6)
}

/** Constant quality flags, which every encoder spells differently. */
function qualityArgs(enc: VideoEncoder, crf: number): string[] {
  switch (enc) {
    case 'h264_nvenc':
      return ['-rc', 'constqp', '-qp', String(gpuQp(crf)), '-preset', 'p5', '-tune', 'hq']
    case 'h264_amf':
      return [
        '-rc',
        'cqp',
        '-qp_i',
        String(gpuQp(crf)),
        '-qp_p',
        String(gpuQp(crf)),
        '-quality',
        'quality',
      ]
    case 'h264_qsv':
      return ['-global_quality', String(gpuQp(crf)), '-preset', 'medium']
    case 'libx264':
      return ['-crf', String(crf), '-preset', 'medium']
  }
}

/**
 * ffmpeg ships every encoder it was built with, whether or not the card in
 * this machine can run it: av1_amf lists fine on an RDNA2 card that has no AV1
 * encoder at all. So each candidate has to actually encode a frame before it
 * can be trusted.
 */
async function encoderWorks(enc: VideoEncoder): Promise<boolean> {
  const { ok } = await exec(
    ffmpegPath ?? 'ffmpeg',
    [
      '-v',
      'error',
      '-f',
      'lavfi',
      '-i',
      'testsrc=size=320x240:rate=1',
      '-frames:v',
      '1',
      '-c:v',
      enc,
      ...qualityArgs(enc, 18),
      '-pix_fmt',
      'yuv420p',
      '-f',
      'null',
      '-',
    ],
    25000,
  )
  return ok
}

async function pickEncoder(): Promise<VideoEncoder> {
  for (const candidate of HW_ENCODERS) {
    if (await encoderWorks(candidate)) return candidate
  }
  return 'libx264'
}

function argsFor(kind: EncodeKind, crf: number, input: string, output: string): string[] {
  const common = [
    '-y',
    // Progress as key=value lines on stdout, five times a second. ffmpeg's
    // default is once, which is what makes a bar hop rather than glide.
    '-progress',
    'pipe:1',
    '-nostats',
    '-stats_period',
    '0.2',
    '-i',
    input,
    // Camera files carry a tmcd timecode track that no mp4 encoder accepts,
    // and drone files add an mjpeg thumbnail that default mapping can mistake
    // for the real picture, so both streams are named by hand. Every audio
    // track is kept, not just the first, and the '?' lets a silent clip pass.
    '-map',
    '0:v:0',
    '-map',
    '0:a?',
    '-dn',
    '-fps_mode',
    'cfr',
  ]
  const audio = ['-c:a', 'aac', '-b:a', `${audioBitrate}k`]

  if (kind === 'premiere') {
    // The editing copy goes to whichever encoder this machine actually has,
    // decided once at startup. It is an intermediate, so finishing in minutes
    // beats shaving a few percent off the size, and it leaves the processor
    // free for everything else.
    //
    // 8 bit on purpose, even from a 10 bit camera. H.264 only carries 10 bit
    // as High 10, a profile with no hardware decoding that Premiere handles
    // badly, so the depth would cost more than it returns.
    const enc = activeEncoder()
    return [
      ...common,
      '-c:v',
      enc,
      ...qualityArgs(enc, crf),
      '-pix_fmt',
      'yuv420p',
      ...audio,
      // faststart lets a player begin before the whole file is read, which
      // also makes Premiere's first scrub feel immediate.
      '-movflags',
      '+faststart',
      output,
    ]
  }

  return [
    ...common,
    '-c:v',
    'libx265',
    '-crf',
    String(crf),
    '-preset',
    'slow',
    // Without hvc1 the file plays in VLC but not in QuickTime or Premiere.
    '-tag:v',
    'hvc1',
    // The copy meant for sending stays 8 bit on purpose. It has to open on
    // any phone or TV, and the extra depth buys a viewer nothing.
    '-pix_fmt',
    'yuv420p',
    ...audio,
    '-movflags',
    '+faststart',
    output,
  ]
}

export function outputPathFor(input: string, kind: EncodeKind, outputDir: string): string {
  const suffix = kind === 'premiere' ? '_premiere' : '_compressed'
  const dir = outputDir || dirname(input)
  return join(dir, `${basename(input, extname(input))}${suffix}.mp4`)
}

/**
 * ffmpeg writes stream metadata to stderr alongside real problems, so the
 * last line is usually something harmless like a timecode tag. This walks
 * back to the last line that actually reads like a failure.
 */
function failureLine(stderr: string, code: number | null, killedBy: string | null): string {
  const lines = stderr
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const looksWrong =
    /error|unsupported|invalid|failed|cannot|unable|no such|denied|not supported|no space/i

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (looksWrong.test(lines[i])) return lines[i]
  }

  // An ffmpeg that crashes or gets killed prints no error at all, so the tail
  // holds nothing but its startup banner. Saying so plainly beats quoting a
  // metadata tag and calling it a diagnosis.
  if (killedBy) return `ffmpeg was stopped (${killedBy})`
  return `ffmpeg crashed, exit code ${code ?? 'unknown'}`
}

export interface RunHandle {
  promise: Promise<{ ok: boolean; cancelled: boolean; message: string; bytes: number | null }>
  cancel: () => void
}

/**
 * Encodes one file. Progress comes from `-progress pipe:1`, which prints
 * key=value lines, rather than from scraping the human readable stderr.
 */
export function convert(
  input: string,
  kind: EncodeKind,
  crf: number,
  outputDir: string,
  durationSec: number,
  onProgress: (percent: number, speed: number | null) => void,
): RunHandle {
  const output = outputPathFor(input, kind, outputDir)
  let cancelled = false

  const child = spawn(ffmpegPath ?? 'ffmpeg', argsFor(kind, crf, input, output), {
    windowsHide: true,
  })

  const promise = new Promise<{
    ok: boolean
    cancelled: boolean
    message: string
    bytes: number | null
  }>((resolve) => {
    let tail = ''
    let buffer = ''

    child.stdout.on('data', (chunk) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      // The final element may be a partial line, so it waits for more data.
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const [key, value] = line.trim().split('=')
        if (key === 'out_time_us' && durationSec > 0) {
          const seconds = Number(value) / 1_000_000
          if (Number.isFinite(seconds)) {
            onProgress(Math.min(seconds / durationSec, 0.999), null)
          }
        } else if (key === 'speed') {
          const speed = Number(value.replace('x', ''))
          if (Number.isFinite(speed) && speed > 0) onProgress(-1, speed)
        }
      }
    })

    // ffmpeg writes its real error on the last stderr lines, so only the tail
    // is worth keeping for the failure message.
    child.stderr.on('data', (d) => {
      // Generous, because ffmpeg's banner and per stream metadata alone run to
      // well over a kilobyte and would push a real error out of a short tail.
      tail = (tail + d.toString()).slice(-6000)
    })

    child.on('error', () =>
      resolve({ ok: false, cancelled: false, message: 'ffmpeg failed to start', bytes: null }),
    )

    child.on('close', async (code, killedBy) => {
      // Anything short of a clean exit leaves an mp4 with no moov atom: a file
      // that looks like a result, sits at gigabytes, and plays in nothing.
      // Removing it is kinder than leaving it to be found later.
      const discard = async (): Promise<void> => {
        try {
          await rm(output, { force: true })
        } catch {
          // Already gone, or still held open. Not worth surfacing.
        }
      }

      if (cancelled) {
        await discard()
        resolve({ ok: false, cancelled: true, message: 'cancelled', bytes: null })
        return
      }
      if (code !== 0) {
        await discard()
        resolve({
          ok: false,
          cancelled: false,
          message: failureLine(tail, code, killedBy),
          bytes: null,
        })
        return
      }
      try {
        await access(output, constants.R_OK)
        const { size } = await stat(output)
        resolve({ ok: true, cancelled: false, message: output, bytes: size })
      } catch {
        resolve({ ok: false, cancelled: false, message: 'output was not written', bytes: null })
      }
    })
  })

  return {
    promise,
    cancel: () => {
      cancelled = true
      child.kill()
    },
  }
}
