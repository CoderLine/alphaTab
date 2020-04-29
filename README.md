# AlphaTab
[![Official Site](https://img.shields.io/badge/site-alphatab.net-blue.svg)](https://alphatab.net)
[![License MPL-2.0](https://img.shields.io/badge/license-MPL--2.0-green.svg)](https://www.mozilla.org/en-US/MPL/2.0/)
[![Twitter](https://img.shields.io/badge/twitter-alphaTabMusic-blue.svg)](https://twitter.com/alphaTabMusic)
[![Facebook](https://img.shields.io/badge/facebook-alphaTabMusic-blue.svg)](https://facebook.com/alphaTabMusic)

alphaTab is a cross platform music notation and guitar tablature rendering library. You can use alphaTab within your own website or application to load and display music sheets from data sources like Guitar Pro or the built in markup language named alphaTex.

![alphaTab](img/banner.png?raw=true "alphaTab")

## Build Status

> Until the official 1.0 release we recommend to use `develop` branch.

&nbsp; | `master` | `develop`
--- | --- | ---
**Build** | ![Build](https://github.com/Danielku15/alphaTab/workflows/Build/badge.svg?branch=master)  | ![Build](https://github.com/Danielku15/alphaTab/workflows/Build/badge.svg?branch=develop)
**Documentation** | [![Documentation](https://img.shields.io/badge/docs-master-brightgreen.svg)](https://docs.alphatab.net/master)  | [![Documentation](https://img.shields.io/badge/docs-develop-brightgreen.svg)](https://docs.alphatab.net/develop)

# Downloads

The latest binaries are available for download at [Appveyor](https://ci.appveyor.com/project/Danielku15/alphatab/build/artifacts). Use the links below to grab the binaries from the latest builds. Please do not use the GitHub releases yet, they are not maintained.

> Until the official 1.0 release we recommend to use `develop` branch.

&nbsp; | `master` | `develop`
--- | --- | ---
**JavaScript** | [JavaScript.zip](https://ci.appveyor.com/api/projects/Danielku15/alphaTab/artifacts/JavaScript.zip?branch=master) | [JavaScript.zip](https://ci.appveyor.com/api/projects/Danielku15/alphaTab/artifacts/JavaScript.zip?branch=develop)
**.net (nupkg for download/unzip)** | [AlphaTab.nupkg](https://ci.appveyor.com/api/projects/Danielku15/alphaTab/artifacts/AlphaTab.nupkg?branch=master) | [AlphaTab.nupkg](https://ci.appveyor.com/api/projects/Danielku15/alphaTab/artifacts/AlphaTab.nupkg?branch=develop)
**.net (NuGet feeds)** | (not available until 1.0) | [AlphaTab at MyGet](https://www.myget.org/feed/coderline/package/nuget/AlphaTab)


# Features
alphaTab mostly focuses on web based platforms allowing music notation to be embedded into websites and browser based apps but is designed to be used also from .net based platforms like Windows, UWP and Xamarin.

Before reading further you might simply jump to our demos:

> [Feature Demo](https://docs.alphatab.net/master/features/) - *Take a look at all visual elements that alphaTab can render*
>
> [Player Demo](https://docs.alphatab.net/master/assets/files/player.html) - *By integrating alphaSynth the you get a web based music sheet player*
>
> [alphaTex Introduction](https://docs.alphatab.net/master/alphatex/) - *Learn about alphaTex, the built-in markup language for writing music notation*

alphaTab can load music notation from various sources like Guitar Pro 3-5, Guitar Pro 6, AlphaTex and MusicXML (experimental) and render them into beautiful music sheets right within your browser (or application). Using [alphaSynth](http://github.com/CoderLine/alphaSynth) the music sheets can also be played in your browser.

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
