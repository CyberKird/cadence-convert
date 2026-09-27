---
name: Cadence Convert
description: Monochrome glass desktop tool for turning camera files into edit-ready and shorts-ready copies
colors:
  ground-light: "#ececef"
  ground-dark: "#09090b"
  ink-light: "#111114"
  ink-dark: "#efeff2"
  wash-lit-light: "#ffffff"
  wash-shade-light: "#c2c2cc"
  wash-lit-dark: "#30303b"
  wash-shade-dark: "#000000"
  solid-light: "#111114"
  on-solid-light: "#f6f6f8"
  solid-dark: "#efeff2"
  on-solid-dark: "#111114"
typography:
  title:
    fontFamily: "'Inter Variable', 'Inter', ui-sans-serif, system-ui, 'Segoe UI', sans-serif"
    fontSize: "20px"
    fontWeight: 650
    letterSpacing: "-0.025em"
  empty-title:
    fontFamily: "'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 660
    letterSpacing: "-0.028em"
  row-name:
    fontFamily: "'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 580
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  meta:
    fontFamily: "'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  figure:
    fontFamily: "'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 660
    letterSpacing: "-0.03em"
rounded:
  control: "11px"
  small-control: "10px"
  row: "14px"
  panel: "20px"
  pill: "99px"
spacing:
  gutter: "16px"
  panel-gap: "14px"
  row-gap: "6px"
  section-gap: "28px"
components:
  button-primary:
    backgroundColor: "{colors.solid-light}"
    textColor: "{colors.on-solid-light}"
    rounded: "{rounded.control}"
    height: "38px"
    padding: "0 16px"
  button-convert:
    backgroundColor: "{colors.solid-light}"
    textColor: "{colors.on-solid-light}"
    rounded: "14px"
    height: "52px"
    width: "100%"
  preset-switch-active:
    backgroundColor: "{colors.solid-light}"
    textColor: "{colors.on-solid-light}"
    rounded: "9px"
  update-pill:
    backgroundColor: "{colors.solid-light}"
    textColor: "{colors.on-solid-light}"
    rounded: "{rounded.pill}"
    height: "30px"
---

# Design System: Cadence Convert

## Overview

A member of the Cadence family: monochrome, glass surfaces floating over a static radial wash, the same look as the Cadence web app for creators and editors. Colour is reserved for the footage itself. Everything the app draws is black, white and the greys between; state is carried by fill, weight and motion, never by hue.

The window is the product. It draws its own title bar over the native Windows buttons, a queue of clips on the left and a recipe panel on the right that explains, in plain terms, what the chosen preset will do. Motion is rich and always on, independent of the Windows reduced-motion flag, with one Reduce motion switch in Settings that turns every animation into an instant change.

## Colors

Two grounds and one ink per theme; every other value is the ink or white at an opacity, defined once as tokens in `src/renderer/src/styles/tokens.css` and redefined under `[data-theme='dark']`.

### Neutral
- **Ground** (`#ececef` light, `#09090b` dark): the window behind everything.
- **Ink** (`#111114` light, `#efeff2` dark): text, strokes, the progress fill. `--ink-2` at 0.64 is secondary text, `--ink-3` at 0.4 is for strokes and decoration only, never text.
- **Solid** (ink colour, inverted text): the one heavy surface. Primary buttons, the active preset, the selected segment, the tier that matches the queue, tooltips, the update pill.
- **Surfaces**: `--surface` (glass panels), `--surface-2` (rows, spec lists, inputs), `--surface-hover`, `--surface-pop` (popovers and menus), `--sunken` (tracks and wells).

### Named Rules
**The Footage Rule.** The only hue on screen is the footage. Thumbnails wait in greyscale and take their colour on hover, while encoding, and once done.

**The One Solid Rule.** A region carries at most one solid element at rest, so the eye always lands on the next action.

## Typography

Inter Variable, bundled with the app (the CSP blocks remote fonts), with `cv05` and `cv08` on so l, I and 1 stay distinct in file names. Numbers that change use tabular figures.

### Hierarchy
- **Title** 20px / 650 / -0.025em: "Clips", "Settings".
- **Empty title** 22px / 660: the empty queue's call to action.
- **Figure** 17 to 36px / 650 to 660: live percentages, quality value, shutdown countdown.
- **Row name** 13.5px / 580: file names, selectable.
- **Body** 13px / 400, **meta** 12px in `--ink-2`, **fine print** 11 to 11.5px in `--ink-2`.

No uppercase tracked labels and no kickers; a heading carries its own weight.

## Layout

Title bar 52px, then a stage with a 16px gutter. The queue view is a two-column grid, `minmax(0, 1fr) 336px`, 14px apart. The recipe panel has a fixed top (preset switch), a scrolling middle with a stable scrollbar gutter, and a pinned foot (save location, summary, Convert), so the primary action never leaves the window. Settings is a single 740px column. The window is 1180x800 by default and never narrower than 940x640.

## Elevation & Depth

Depth is declared once per surface, never as border plus wide shadow. Glass panels carry an inner top highlight and a soft offset shadow (`--shadow-panel`); popovers and menus a deeper one (`--shadow-pop`); solid elements a tight dark shadow (`--shadow-solid`). Rows and wells use a 1px inset hairline instead of a shadow.

## Shapes

Panels 20px, rows 14px, controls 11px (10px small), thumbnails 9px, pills fully round. The preset switch and segmented controls use a sliding solid pill inside a sunken track.

## Components

### Buttons
- **Primary** (`.btn.solid`): solid fill, 38px, lifts 1px on hover, presses to 0.965.
- **Convert** (`.btn-go`): 52px, full width, count chip and an arrow that leans forward on hover, a sheen crossing on hover.
- **Outline** and **quiet** variants for secondary actions; icon buttons are 34px squares that fill on hover and go solid when active.

### Preset switch
Two large segments with a name and a one-line purpose. The solid pill slides and resizes with a slight overshoot.

### Queue row
Thumbnail (16:9, duration chip), name, meta line (resolution, fps, size, codec; only the codec may shrink), and a plan column that says what the clip will become, then live percentage, speed and time left, then size and saving. Progress is a translucent fill clipped from the left with a 2px ink line at the bottom.

### Recipe panel
Plain-language description, a spec list, then either the quality slider (Premiere) or the bitrate table with the queue's tiers marked solid (Shorts).

### Title bar
Moon mark, name, version pill, update pill when a release waits, shutdown, theme, and a toothed cog for Settings that turns on hover.

## Do's and Don'ts

### Do:
- Say what will happen before it happens: every row and the recipe show the output.
- Gate motion on `data-motion`, set from the app's own setting.
- Animate with `clip-path`, `transform`, `opacity` and `filter`; progress never resizes an element.
- Keep new strings in `src/shared/i18n.ts` for all six languages.

### Don't:
- Don't introduce a hue for state, success or error.
- Don't use `--ink-3` for text.
- Don't respect `prefers-reduced-motion` alone; the Settings switch decides.
- Don't draw a sun-like glyph where an action needs recognising; the cog has teeth for a reason.
