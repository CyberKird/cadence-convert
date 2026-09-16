import { app } from 'electron'
import electronUpdater from 'electron-updater'
import type { UpdateStatus } from '../shared/types'

const { autoUpdater } = electronUpdater

type Emit = (status: UpdateStatus) => void

let emit: Emit = () => {}
let status: UpdateStatus = { state: 'idle', version: null, percent: 0, message: null }

function set(next: Partial<UpdateStatus>): void {
  status = { ...status, ...next }
  emit(status)
}

export function current(): UpdateStatus {
  return status
}

export function init(onChange: Emit): void {
  emit = onChange

  // Downloading is the user's call. A 100 MB pull starting by itself on a
  // metered connection is the kind of surprise that gets an app uninstalled.
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => set({ state: 'checking', message: null }))

  autoUpdater.on('update-available', (info) =>
    set({ state: 'available', version: info.version, percent: 0, message: null }),
  )

  autoUpdater.on('update-not-available', () =>
    set({ state: 'idle', version: null, percent: 0, message: null }),
  )

  autoUpdater.on('download-progress', (p) =>
    set({ state: 'downloading', percent: Math.round(p.percent) }),
  )

  autoUpdater.on('update-downloaded', (info) =>
    set({ state: 'ready', version: info.version, percent: 100, message: null }),
  )

  autoUpdater.on('error', (err) =>
    set({ state: 'error', message: err?.message ?? 'update check failed' }),
  )
}

/**
 * Only a packaged build has a version to compare against a release, so in
 * development this reports quietly instead of throwing on every launch.
 */
export async function check(): Promise<UpdateStatus> {
  if (!app.isPackaged) {
    set({ state: 'idle', message: 'updates only run in an installed build' })
    return status
  }
  try {
    await autoUpdater.checkForUpdates()
  } catch (err) {
    set({ state: 'error', message: err instanceof Error ? err.message : 'update check failed' })
  }
  return status
}

export async function download(): Promise<UpdateStatus> {
  if (status.state !== 'available') return status
  try {
    set({ state: 'downloading', percent: 0 })
    await autoUpdater.downloadUpdate()
  } catch (err) {
    set({ state: 'error', message: err instanceof Error ? err.message : 'download failed' })
  }
  return status
}

/** Quits and runs the installer. Nothing after this call matters. */
export function install(): void {
  if (status.state === 'ready') autoUpdater.quitAndInstall()
}
