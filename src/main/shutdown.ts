import { spawn } from 'node:child_process'
import { powerSaveBlocker } from 'electron'
import type { ShutdownStatus } from '../shared/types'

/** Ten hours. Long enough for any queue, short enough to catch a typo. */
const MAX_SECONDS = 36000

let armedAt: number | null = null
let blockerId: number | null = null
let holders = 0

/** No shell, so a value can never be read as a second command. */
function run(args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('shutdown', args, { windowsHide: true })
    child.on('error', () => resolve(false))
    child.on('close', (code) => resolve(code === 0))
  })
}

/**
 * Keeps the machine awake. Reference counted, because an encode and an armed
 * timer both want it held, and whichever ends first must not drop it for the
 * other.
 */
export function holdAwake(): void {
  holders += 1
  if (blockerId === null) {
    // prevent-app-suspension lets the screen go dark but keeps the CPU alive,
    // which is what a long encode actually needs. Blanking the display is a
    // courtesy, not a risk.
    blockerId = powerSaveBlocker.start('prevent-app-suspension')
  }
}

export function releaseAwake(): void {
  holders = Math.max(0, holders - 1)
  if (holders === 0 && blockerId !== null) {
    powerSaveBlocker.stop(blockerId)
    blockerId = null
  }
}

export async function arm(seconds: number): Promise<ShutdownStatus> {
  // This number arrives from the renderer and becomes a command line
  // argument, so it is validated before it goes anywhere near one.
  if (!Number.isFinite(seconds)) return status()
  const safe = Math.min(MAX_SECONDS, Math.max(1, Math.round(seconds)))

  // Windows refuses a new timer while one is still pending, so any existing
  // one is cleared first. Failing here only means there was nothing to clear.
  await run(['/a'])

  if (!(await run(['/s', '/t', String(safe)]))) return status()

  if (armedAt === null) holdAwake()
  armedAt = Date.now() + safe * 1000
  return status()
}

export async function cancel(): Promise<ShutdownStatus> {
  await run(['/a'])
  if (armedAt !== null) {
    armedAt = null
    releaseAwake()
  }
  return status()
}

export function status(): ShutdownStatus {
  // Windows owns the real timer, so a timestamp in the past means it already
  // fired or was cancelled from outside the app.
  if (armedAt !== null && armedAt <= Date.now()) {
    armedAt = null
    releaseAwake()
  }
  return { armed: armedAt !== null, at: armedAt }
}
