# AlphaTab
[![Official Site](https://img.shields.io/badge/site-alphatab.net-blue.svg)](https://alphatab.net)
[![License MPL-2.0](https://img.shields.io/badge/license-MPL--2.0-green.svg)](https://www.mozilla.org/en-US/MPL/2.0/)
[![Twitter](https://img.shields.io/badge/twitter-alphaTabMusic-blue.svg)](https://twitter.com/alphaTabMusic)
[![Facebook](https://img.shields.io/badge/facebook-alphaTabMusic-blue.svg)](https://facebook.com/alphaTabMusic)

alphaTab is a cross platform music notation and guitar tablature rendering library. You can use alphaTab within your own website or application to load and display music sheets from data sources like Guitar Pro or the built in markup language named alphaTex.

![alphaTab](img/banner.png?raw=true "alphaTab")

# Getting Started

To get started follow our guides and tutorials at: 

* https://www.alphatab.net/docs/introduction
* https://www.alphatab.net/docs/tutorials

## Build Status

> Until the official 1.0 release we recommend to use pre release versions based on the `develop` branch.

&nbsp; | &nbsp;
--- | ---
**Build** | ![Build](https://github.com/CoderLine/alphaTab/workflows/Build/badge.svg?branch=develop)
**Documentation** | [![Documentation](https://img.shields.io/badge/docs-master-brightgreen.svg)](https://www2.alphatab.net/)

# Downloads

The latest binaries based  are available for download at either npmjs.org or NuGet.org.
Use the links below to grab the binaries from the latest builds. We recommend using package managers to pull the files to your projects. 

&nbsp; | &nbsp;
--- | --- |
**JavaScript** | [NPM](https://www.npmjs.com/package/@coderline/alphatab)
**.net** | [NuGet](https://www.nuget.org/profiles/CoderLine)

# Features
alphaTab mostly focuses on web based platforms allowing music notation to be embedded into websites and browser based apps but is designed to be used also from .net based platforms like Windows, UWP and Xamarin.

alphaTab can load music notation from various sources like Guitar Pro 3-7, AlphaTex and MusicXML (experimental) and render them into beautiful music sheets right within your browser (or application). Using a built in midi synthesizer named alphaSynth the music sheets can also be played in your browser.

* load GuitarPro 3-5, GuitarPro 6, AlphaTex or MusicXML (experimental)
* render as SVG, HTML5 canvas, GDI+,...
* display single or multiple instruments as standard music notation and guitar tablatures consisting of song information, repeats, alternate endings, guitar tunints, clefs, key signatures, time signatures, notes, rests, accidentals, drum tabs, piano grand staff, tied notes, grace notes, dead notes, ghost notes, markers, tempos, lyrics, chords, vibratos, dynamics, tap/slap/pop, fade-in, let-ring, palm-mute, string bends, whammy bar, tremolo picking, strokes, slides, trills, pick strokes, tuplets, fingering, triplet feels,...
* adapt to your responsive design by dynamic resizing
* play the music sheet via HTML5 Web Audio API (only if browser supports it)

# Thanks to...

... the guys of BrowserStack for a free plan. This allows me to test alphaTab on all browsers on all operating systems. Only with this I can ensure that alphaTab is shown to all your visitors as expected.

<p align="center">
<a href="https://www.browserstack.com" target="_blank"><img src="img/BrowserStack.png?raw=true" width="400" align="center"/></a>
</p>

... to [Bernhard Schelling](https://github.com/schellingb/TinySoundFont) the author of TinySoundFont and [Steve Folta](https://github.com/stevefolta/SFZero) the author of SFZero for providing the core of the synthesis engine.

... to all you people using alphaTab providing new feature ideas and and bug reports.
