# Favicon Generator Pro

[![CI](https://github.com/kasapdev/favicon-generator-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/kasapdev/favicon-generator-pro/actions/workflows/ci.yml)

Generate a complete favicon set — 16px to 512px, apple-touch-icon, and a manifest.json — from one image, entirely in your browser.

> A zero-dependency favicon workbench. Drop in one square-ish image, get back every PNG size a modern site needs, a ready-to-paste `<head>` snippet, and a valid `manifest.json` — nothing ever leaves your machine.

## Overview

Favicon Generator Pro is part of the **Web Utility Suite**. It runs entirely in the browser with no build step, no frameworks, and no network calls — open `index.html` from disk and it works. Upload an image and it's automatically center-cropped to a square, then downscaled with `<canvas>` into every target favicon size. Each size gets a live preview on a checkerboard backdrop (so transparency is visible), its generated file size, and an individual download button — plus copy-paste `manifest.json` and `<head>` HTML blocks so you can wire the results into a real site in seconds.

## Features

- **Drag-and-drop or click-to-browse upload** — accepts PNG, JPG, WEBP, SVG, GIF, and BMP.
- **Square-crop-then-resize pipeline** — the source image is always center-cropped to a square (cover-fit crop, no distortion) into a high-resolution master canvas first, then every target size is downscaled from that master. This means results look correct regardless of the source image's aspect ratio.
- **Six target sizes generated as real PNGs**: `16×16`, `32×32`, `48×48`, `180×180` (apple-touch-icon), `192×192`, and `512×512` — all produced client-side via `canvas.toBlob('image/png')`.
- **Live per-size preview** — each generated size is rendered on a checkerboard background (derived from the shared theme variables) so transparent regions are visible, along with its pixel dimensions and generated file size.
- **Individual downloads** — a dedicated Download button per size, saving conventionally-named files (`favicon-16x16.png`, `apple-touch-icon.png`, etc.) with zero dependencies — no ZIP library, just `canvas.toBlob` + `<a download>`.
- **"Generate all"** — (re)renders every size from the current source in one click; also fires automatically the moment a source image is loaded.
- **Non-blocking warnings** — a toast (not a hard error) if the source isn't square or is smaller than 512×512; generation proceeds either way.
- **`manifest.json` snippet** — a valid, pretty-printed web app manifest with an editable app name, an `icons` array covering every generated size, `theme_color`, `background_color`, and `display: "standalone"`. One-click copy.
- **`<head>` HTML snippet** — correct `<link rel="icon">` tags per size, `<link rel="apple-touch-icon">`, `<link rel="manifest">`, and a `<meta name="theme-color">` tag. One-click copy.
- **Clear / reset** — wipes the loaded image and all generated previews to start over.
- **Dark & light themes**, glassmorphism panels, fully responsive down to 360px, and keyboard accessible.

## Installation

No dependencies, no build step.

```bash
git clone https://github.com/kasapdev/favicon-generator-pro.git
cd favicon-generator-pro
```

Then simply open `index.html` in any modern browser (double-click it, or `file://` it). That's it.

## Usage

1. Drag an image onto the drop zone, or click it to browse for one.
2. The image is automatically center-cropped to a square and every favicon size is generated instantly — dimensions, warnings (if the source isn't square or is under 512×512), and file sizes appear right away.
3. Review each size's live preview on the checkerboard background, then click **Download** on any card to save that PNG.
4. Click **Generate all** any time to re-render every size from the current source.
5. Edit the **App name** field to update the `manifest.json` snippet live, then use **Copy** on either the manifest or `<head>` snippet panel to grab the text.
6. Paste the `<head>` snippet into your site, and upload the downloaded PNGs plus a saved `manifest.json` alongside your HTML.
7. Click **Clear** to reset and start over with a different image.

## Keyboard Shortcuts

| Action                  | Shortcut                       |
| ------------------------ | ------------------------------- |
| Upload / choose image     | <kbd>Ctrl/⌘</kbd> + <kbd>O</kbd> |
| Generate all sizes         | <kbd>Ctrl/⌘</kbd> + <kbd>G</kbd> |
| Show shortcuts help          | <kbd>?</kbd>                    |
| Close dialog                    | <kbd>Esc</kbd>                  |

## Screenshots

> _Screenshots coming soon._

![screenshot](docs/screenshot-1.png)
![screenshot](docs/screenshot-2.png)

## Roadmap

- [ ] ICO multi-resolution bundling (a single `favicon.ico` containing 16/32/48px layers)
- [ ] ZIP download of all generated sizes in one click
- [ ] Maskable / adaptive icon variants for Android with configurable safe-area padding
- [ ] Batch mode — generate favicons for multiple source images in one session

## License

MIT Licensed.
