# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.1] - 2026-09-06

### Fixed

- Switching to a new image via "Change image" could momentarily serve a
  stale download: the previously generated PNG Blobs stayed in
  `sizeBlobs` and their Download buttons remained enabled while the new
  image's sizes were still being (re)generated asynchronously via
  `canvas.toBlob()`. A click on Download during that window silently
  downloaded the *previous* image's icon instead of the new one. Blobs,
  per-size info text, and Download buttons are now reset/disabled the
  moment a new image is loaded, before generation starts.
