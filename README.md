# Cadence Convert

A desktop tool that turns camera and screen recordings into files an editor can
actually work with, and into copies ready for a shorts editor.

![platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![license](https://img.shields.io/badge/license-MIT-blue)

## Why

Footage that crashes or stutters in an editor usually does so for boring
reasons: a variable frame rate, a timecode track no encoder accepts, or a
drone file whose thumbnail gets mistaken for the real picture. Cadence Convert
normalises all of that in one pass and leaves the source untouched.

## What it does

**Two presets.**

| Preset | Output | For |
|---|---|---|
| Premiere | H.264, constant frame rate, constant quality | Editing. Runs on the graphics card when there is one. |
| Shorts | H.264 High, 16:9 kept, up to 4K and 60 fps | Handing a whole clip to a shorts editor in CapCut. |

Shorts keeps the frame 16:9 and caps it at 4K, since a 9:16 crop at the
1080x1920 that YouTube, TikTok, Instagram and Facebook all want needs a source
at least 1920 tall. Bitrate follows YouTube's upload recommendations by size
(4K 45 or 68 Mbps, 1440p 16 or 24, 1080p 12 or 16, depending on 30 or 60 fps),
with a keyframe every second so scrubbing in CapCut stays smooth, one stereo
AAC track at 48 kHz, and bt709 SDR tags. Smaller sources are never upscaled.

**Hardware encoding, detected rather than assumed.** ffmpeg ships every encoder
it was built with whether or not the card can run it, so at startup the app
encodes one real frame with each candidate and keeps the first that works.
Nvidia NVENC, then AMD AMF, then Intel QuickSync, then the processor. The
Premiere recipe names the one that is live.

**A queue that explains itself.** Every file is probed on arrival and shows a
frame from the clip, its resolution, frame rate, codec, duration and size, plus
a marker on the variable frame rate clips that cause most editor trouble. Each
row says what it will become before anything runs: for Shorts the output
resolution, target bitrate and estimated size. Progress is read from the
encoder five times a second with speed and time left, and finished rows show
the before and after size.

**Scheduled shutdown.** Set hours, minutes and seconds, and the machine powers
off when the queue is long and you are not. Windows holds the timer, so it
still fires if the app is closed, and the machine is kept awake for the whole
run so a half written file never happens.

**Settings.** Language, appearance, reduce motion, encoder override when you
would rather force one, quality, audio bitrate, output folder, keep awake, and
the update controls. Every value is revalidated on the way in, so a hand edited config
file cannot push a bad argument at the encoder.

**Six languages.** English, Română, Deutsch, Français, Español and Italiano.
The interface follows the Windows language and falls back to English.

**Updates.** New releases are noticed on launch and shown in the title bar and
in Settings.
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
