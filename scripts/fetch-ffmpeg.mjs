import { execFileSync } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { copyFile, mkdir, mkdtemp, readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const target = join(root, 'resources', 'ffmpeg')
const WANTED = ['ffmpeg.exe', 'ffprobe.exe']
const BUILD_URL = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip'

const force = process.argv.includes('--force')

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

const installed = await Promise.all(WANTED.map((name) => exists(join(target, name))))
if (installed.every(Boolean) && !force) {
  console.log(`ffmpeg and ffprobe already in ${target}, pass --force to replace them.`)
  process.exit(0)
}

async function find(directory, name) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      const hit = await find(path, name)
      if (hit) return hit
    } else if (entry.name.toLowerCase() === name.toLowerCase()) {
      return path
    }
  }
  return null
}

const work = await mkdtemp(join(tmpdir(), 'cadence-ffmpeg-'))
const zip = join(work, 'ffmpeg.zip')
const unpacked = join(work, 'unpacked')

try {
  console.log(`Downloading ${BUILD_URL}`)
  const response = await fetch(BUILD_URL)
  if (!response.ok || !response.body) throw new Error(`download failed: HTTP ${response.status}`)
  await pipeline(Readable.fromWeb(response.body), createWriteStream(zip))

  await mkdir(unpacked, { recursive: true })
  // bsdtar ships with Windows and reads the zip without another dependency.
  execFileSync('tar', ['-xf', zip, '-C', unpacked], { stdio: 'inherit' })

  await mkdir(target, { recursive: true })
  for (const name of WANTED) {
    const source = await find(unpacked, name)
    if (!source) throw new Error(`${name} missing from the archive`)
    await copyFile(source, join(target, name))
    console.log(`Placed ${name} in ${target}`)
  }

  // These are GPL builds, so the licence has to sit next to the shipped binaries.
  const licence = await find(unpacked, 'LICENSE')
  if (licence) await copyFile(licence, join(target, 'LICENSE.txt'))
} finally {
  await rm(work, { recursive: true, force: true })
}
