# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Electron desktop app for Windows (electron-vite, React, TypeScript). The renderer is a web surface inside a fixed desktop window (min 940x640, default 1180x800), with its own title bar over the native Windows buttons.

## Users

Video creators and the editors they hand footage to. It started with Remus (creator, films 4K60 on Fuji and DJI) and Aron (editor), and the repo is public, so any creator or editor who installs it must understand it without a walkthrough. Typical scene: a large batch of raw camera files after a shoot, converted before editing, often left running while the machine shuts itself down.

## Product Purpose

Turns camera and screen recordings into files an editor can work with, in one pass, leaving the source untouched. Success: drop clips, press Convert, get files that open and scrub cleanly in the target editor, with no settings knowledge needed.

## Positioning

Two jobs, one tool, each tuned from measurement rather than guesswork: a Premiere preset (H.264, constant frame rate, hardware encoder detected by actually encoding a frame) and a Shorts preset (whole clip kept 16:9, capped at 4K so a 9:16 crop stays sharp, bitrate to YouTube, TikTok, Instagram and Facebook upload specs, keyframe every second for CapCut).

## Operating Context

- Input: Fuji and DJI 4K60 files (often 10 bit HEVC with timecode and thumbnail tracks), screen recordings, any common container.
- Output: next to the source or in a chosen folder, suffixed `_premiere` or `_shorts`.
- Runs for long stretches; scheduled shutdown and keep-awake exist for overnight queues.
- Updates come from GitHub Releases (CyberKird/cadence-convert) via electron-updater; downloading is always a deliberate click.

## Capabilities and Constraints

- Presets: Premiere, Shorts. Transfer and Both were removed in 1.2.0.
- Queue with probe info per file (resolution, fps, duration, size, variable frame rate warning), live progress and speed, before/after size.
- Settings: encoder override, quality (Premiere only), audio bitrate, output folder, keep awake, motion, theme, language, update controls.
- Renderer is sandboxed; every file and process action crosses validated IPC. CSP allows only self-hosted assets, so fonts must be bundled.
- ffmpeg and ffprobe ship with the installer.

## Brand Commitments

- Belongs to the Cadence family (the Cadence web app for Remus and Aron): monochrome, glass surfaces, radial wash in the background. Keep it recognizable, elevate the craft.
- Icon: a pixel-art moon on a rounded gradient tile.
- Motion is rich and always on by default, independent of the Windows reduced-motion flag; a single Settings toggle reduces it.
- Interface language follows the system by default, falls back to English, and can be changed in Settings.

## Evidence on Hand

No testimonials, user counts or benchmarks beyond the measured bitrates in README. Do not invent any.

## Product Principles

1. The queue explains itself: every file says what it is and what will happen to it.
2. Defaults are measured, not guessed; controls exist for overrides, not for setup.
3. Nothing surprising happens on its own: no auto downloads, no silent deletes of sources.
4. Long runs are safe: awake while working, clean failure, no half-written files left behind.
