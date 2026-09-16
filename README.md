# Cadence Convert

A desktop tool that turns camera and screen recordings into files an editor can
actually work with, and into smaller copies worth sending.

![platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![license](https://img.shields.io/badge/license-MIT-blue)

## Why

Footage that crashes or stutters in an editor usually does so for boring
reasons: a variable frame rate, a timecode track no encoder accepts, or a
drone file whose thumbnail gets mistaken for the real picture. Cadence Convert
normalises all of that in one pass and leaves the source untouched.

## What it does

**Three presets.**

| Preset | Output | For |
|---|---|---|
| Premiere | H.264, constant frame rate | Editing. Runs on the graphics card when there is one. |
| Transfer | HEVC | Upload and sending. Roughly half the size at the same picture. |
| Both | both of the above | Two files per clip, pinned to quality 18. |

**Hardware encoding, detected rather than assumed.** ffmpeg ships every encoder
it was built with whether or not the card can run it, so at startup the app
encodes one real frame with each candidate and keeps the first that works.
Nvidia NVENC, then AMD AMF, then Intel QuickSync, then the processor. The badge
next to the queue shows which one is live.

**A queue that explains itself.** Every file is probed on arrival and shows its
resolution, frame rate, duration and size, plus a marker on the variable frame
rate clips that cause most editor trouble. Progress is read from the encoder
five times a second, and finished rows show the before and after size with the
percentage saved.

**Scheduled shutdown.** Set hours, minutes and seconds, and the machine powers
off when the queue is long and you are not. Windows holds the timer, so it
still fires if the app is closed, and the machine is kept awake for the whole
run so a half written file never happens.

**Settings.** Encoder override when you would rather force one, quality, audio
bitrate, output folder, sleep and animation behaviour, theme, and the update
controls. Every value is revalidated on the way in, so a hand edited config
file cannot push a bad argument at the encoder.

**Updates.** New releases are noticed on launch and shown in Settings.
Downloading is always a deliberate click, never automatic, because a hundred
megabyte pull starting by itself on a metered connection is a bad surprise.

## Requirements

ffmpeg and ffprobe, either on `PATH` or at `C:\ffmpeg\bin`. The app says so
plainly if it cannot find them.

## Install

Download the installer from [Releases](../../releases) and run it. The build is
unsigned, so Windows SmartScreen will warn on first run until the download
earns reputation. Choose More info, then Run anyway.

## Build from source

```bash
npm install
npm run dev        # run it
npm run build      # typecheck and bundle
npm run pack:win   # installer into release/
```

## Stack

Electron, React, TypeScript, Vite, packaged with electron-builder. The renderer
draws only: every file and process action crosses an IPC boundary that the main
process validates, with context isolation and sandboxing on.

## License

MIT
