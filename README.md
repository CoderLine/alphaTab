# AlphaTab

[![Official Site](https://img.shields.io/badge/site-alphatab.net-blue.svg)](https://www.alphatab.net/)
[![Documentation](https://img.shields.io/badge/docs-alphatab.net-blue.svg)](https://www.alphatab.net/docs/introduction)
[![License MPL-2.0](https://img.shields.io/badge/license-MPL--2.0-green.svg)](https://www.mozilla.org/en-US/MPL/2.0/)
[![Twitter](https://img.shields.io/badge/twitter-alphaTabMusic-blue.svg)](https://twitter.com/alphaTabMusic)
[![Facebook](https://img.shields.io/badge/facebook-alphaTabMusic-blue.svg)](https://facebook.com/alphaTabMusic)
[![Build](https://github.com/CoderLine/alphaTab/workflows/Build/badge.svg?branch=develop)](https://github.com/CoderLine/alphaTab/actions/workflows/build.yml)

alphaTab is a cross platform music notation and guitar tablature rendering library. You can use alphaTab within your own website or application to load and display music sheets from data sources like Guitar Pro or the built in markup language named alphaTex.

![alphaTab](img/banner.png?raw=true "alphaTab")

## Getting Started

To get started follow our guides and tutorials at:

* <https://www.alphatab.net/docs/introduction>
* <https://www.alphatab.net/docs/tutorials>

## Features

alphaTab mostly focuses on web based platforms allowing music notation to be embedded into websites and browser based apps but is also designed to be used on various other platforms like .net and Android either as a platform native integration or through runtime specific JavaScript engines.

alphaTab can load music notation from various sources like Guitar Pro 3-7, AlphaTex and MusicXML (experimental) and render them into beautiful music sheets right within your browser (or application). Using a built in midi synthesizer named alphaSynth the music sheets can also be played in your browser.

* Load GuitarPro 3-5, GuitarPro 6, Guitar Pro 7, AlphaTex or MusicXML (experimental)
* Render as SVG or Raster Graphics (raster graphics depends on platform: HTML5 canvas, GDI+, SkiaSharp, Android Canvas)...
* Display single or multiple instruments as standard music notation and guitar tablatures consisting of song information, repeats, alternate endings, guitar tunints, clefs, key signatures, time signatures, notes, rests, accidentals, drum tabs, piano grand staff, tied notes, grace notes, dead notes, ghost notes, markers, tempos, lyrics, chords, vibratos, dynamics, tap/slap/pop, fade-in, let-ring, palm-mute, string bends, whammy bar, tremolo picking, strokes, slides, trills, pick strokes, tuplets, fingering, triplet feels,...
* Adapt to your responsive design by dynamic resizing
* Play the music sheet via built-in Midi+SoundFont2 Synthesizer (output depends on platform: HTML5 Web Audio, NAudio, Android AudioTrack)

## Officially Supported Platforms

 Platform | Support | Availability
----------|---------|--------------
Browsers using `script` includes (UMD) | Full experience including low level APIs, Background Workers, Audio Playback, SVG and HTML5 rendering. UI level integration for user interaction and automatic resizing. | 1.0-latest
Node.js using `require` (UMD) | Access to all low level APIs and SVG rendering | 1.0-latest
.net standard 2.0 | Access to all low level APIs and multiple render engines (SVG, GDI+, SkiaSharp) | 1.0-latest
.netcoreapp3.1 (WPF) | Full experience including low level APIs, Background Workers, Audio Playback (through NAudio), SVG and HTML5 rendering. UI level integration for user interaction and automatic resizing. | 1.0-1.2.2
.netcoreapp3.1 (WinForms) | Full experience including low level APIs, Background Workers, Audio Playback (through NAudio), SVG and HTML5 rendering. UI level integration for user interaction and automatic resizing. Reduced UI level integration related to transparency and animations. | 1.0-1.2.2
Browsers using ES6 Modules (ESM) | Full experience including low level APIs, Background Workers, Audio Playback, SVG and HTML5 rendering. UI level integration for user interaction and automatic resizing. | 1.3
Node.js using `import` (ESM) | Access to all low level APIs and SVG rendering | 1.3
.net8.0-windows (WPF) | Full experience including low level APIs, Background Workers, Audio Playback (through NAudio), SVG and HTML5 rendering. UI level integration for user interaction and automatic resizing. | 1.3
.net8.0-windows (WinForms) | Full experience including low level APIs, Background Workers, Audio Playback (through NAudio), SVG and HTML5 rendering. UI level integration for user interaction and automatic resizing. Reduced UI level integration related to transparency and animations. | 1.3
Android (Kotlin) | Full experience including low level APIs, Background Workers, Audio Playback, Android Canvas and SVG rendering. UI level integration for user interaction and automatic resizing. Reduced UI level integration related to transparency and animations. | 1.3

## Thanks to...

... our friends of BrowserStack for a free plan. This allows me to test alphaTab on all browsers on all operating systems. Only with this I can ensure that alphaTab is shown to all your visitors as expected.

<p align="center">
<a href="https://www.browserstack.com" target="_blank"><img src="img/BrowserStack.png?raw=true" width="400" align="center"/></a>
</p>

... our friends at JetBrains for a Open Source License of their products. This allows me to develop all the flavors of alphaTab with the latest and greatest coding and debugging assistance.

<p align="center">
<a href="https://www.jetbrains.com/" target="_blank"><img src="https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.png" width="150" align="center"/></a><br />
Copyright © 2000-2022 JetBrains s.r.o. JetBrains and the JetBrains logo are registered trademarks of JetBrains s.r.o.
</p>

... [Bernhard Schelling](https://github.com/schellingb/TinySoundFont) the author of TinySoundFont and [Steve Folta](https://github.com/stevefolta/SFZero) the author of SFZero for providing the core of the synthesis engine.

... all you people using alphaTab providing new feature ideas and bug reports.
