---
title: v1.2
---

## v1.2.3

Even though this is "only" a patch release, there is plenty of stuff to discover.🥳🎉

This release aims to ship all improvements and bugfixes done as part of 1.3 already in 1.2 to keep the 1.3 theme of official Android and iOS Native support. 

A big "Thank You" to all people contributing to alphaTab through reporting bugs, bringing in feature ideas and contributing code changes to alphaTab!


# Highlights of this release

## New Features 💡 

- [General] ES6 module flavor build of alphaTab. (Issue: #666, PR: #678) 
- [General] New Event whenever the playback range changes. (Issue: #732, PR: #782) 
- [General] New Event for obtaining the currently played beats across all tracks and voices. (Issue: #722, PR: #878) 
<br/>

- [File Formats] Unicode Characters support in alphaTex. (Issue: #579, PR: #580) 
- [File Formats] Alternate Endings support in alphaTex. (Issue: #671, PR: #791) Thanks @jonaro00 for this contribution.
- [File Formats] Minor Key Signature support in alphaTex. (Issue: #875, PR: #880) Thanks @jonaro00 for this contribution.
- [File Formats] Brush Stroke and arpeggio support to alphaTex. (Issue: #505, PR: #799) Thanks @jonaro00 for this contribution.
<br/>

- [Rendering] New Options for disabling cursor animations and element highlighting (Issue: #558, PR: #644) 
- [Rendering] Allow the use of multiple font families with fallbacks. (Issue: #546, PR: #953) 

- [Audio] Use AudioWorklets for audio playback when available. (Issue: #480, PR: #642)
- [Audio] Expose MidiTickLookup for manual lookup of elements by a given midi position. (Discussion: #732, Commit: e8b58506190f776b6987cdcddd5d0a48ab7e2ae8)
<br/>

## Improvements 🚀 

- [General] Improved WebPack support. We are not yet at 100% to support everything properly (mainly due to missing features in WebPack like AudioWorklets) but things are getting better. We plan to ship some extended examples over at https://github.com/CoderLine/alphaTabSamplesWeb soon. 
- [General] Improved Node.js support. (Issue: #542, PR: #544) 
- [General] Improved module exports to have better TypeScript compatibility. (Issue: #682, PR: #684) 
- [General] Allow dynamic changing of the display of cursors and the cursor colors. (Issue: #876, PR: #899) 
- [General] More exposed low-level APIs. (Issue: #897, PR: #956) 
- [General] Allow dynamic change of the transposition pitches. (Issue: #896, PR: #957) 
<br/>

- [Rendering] Render half-note rhythm notation stems different (Issue: #602, PR: #605, Discussion: #601) 
- [Rendering] Avoid grace notes sticking fully to the previous note (Issue: #604, PR: #606) 
- [Rendering] Use of native browser smooth scrolling (Issue: #558, PR: #644) 
- [Rendering] Improved element positioning to reduce browser CPU load (Issue: #558, PR: #644) 
- [Rendering] Reduced CPU load on cursor placement (Issue: #558, PR: #645) 
- [Rendering] Added Virtualized Display of Rendered Partials (Issue: #532, PR: #689) 
<br/>

- [Audio] Avoid delayed audio settings due to buffering (Issue: #657, PR: #686) 
- [Audio] Configurable audio buffer size (Issue: #736, PR: #788) 
- [Audio] Improved WebAudio context suspend/resume handling (Issue: #760, PR: #768) 

<br/>

## Bug Fixes 🕷️ 

- [General] Fixed wrong decoding of Colors (Issue: #387, PR: 543) Thanks @kyledecot for this contribution.
- [General] Fixed wrong Score model when not sending it through serializer (Issue: #551, PR: #610)
- [General] Fixed bad detection of note positions (Issue: #744, PR: #746) Thanks @gallegretti for this contribution.
- [General] Allow loading of alphaTab/Skia in Avalonia (Issue: #774, PR: #789) 
- [General] Fix beat removeNote function keeping stringLookup reference (Issue #932, PR: #933) Thanks @gallegretti for this contribution.
<br/>

- [File Formats] Allow Sections to start with a rest in alphaTex (Issue: #683, PR: #685)
- [File Formats] Errornous Slur handling and improved repeat group calculation (Issue: #865, PR: #898)
- [File Formats] Tempo changes on first bar not handled correctly (Issue: #988, PR: #994)
- [File Formats] Ensure Correct Vibrato audio for GP5 files (Issue: #1011, PR: #1014)
<br/>

- [Rendering] Prevent double printing dialogs/events (Issue: #844, PR: #846) 
- [Rendering] Corrected wrong placement of key signatures (Issue: #872, PR: #881) 
- [Rendering] Corrected wrong placement of brush strokes (Issue: #935, PR: #955) 
- [Rendering] Inability to place the cursor on some beats upon clicking (Issue: #959, PR: #960) 
<br/>

- [Audio] Prevent invalid playback ranges when selecting reverse (Issue: #733, PR: #783)
- [Audio] Corrected timesignature generation causing metronome behavior (Issue: #567, PR: #574)
- [Audio] Ensure Player is fully destroyed with the rest of alphaTab (Issue: #594, PR: #595)
- [Audio] Reworked playback of count-in and individual notes and beats (Issue: #758, PR: #787) 
- [Audio] Cursor Snaps/Jumps to Next Bar  (Issue: #976, PR: #888) 

## Maintenance 👷‍♂️

- [General] TypeScript upgrade, use `override`
- [General] Update of Dev and Runtime Dependencies to latest versions.
- [File Formats] AlphaTexImporter corrections and simplifications (PR: #852) Thanks @jonaro00 for this contribution.
- [Rendering] Update Visual Test Suite to use Free Fonts (Issue: #559, PR: #560)
<br/>

# All Changes 

**Issues:** [v1.2.3](https://github.com/CoderLine/alphaTab/issues?q=is%3Aopen%20is%3Aissue%20project%3Acoderline%2F9)

**Full Changelog**: https://github.com/CoderLine/alphaTab/compare/v1.2.2...v1.2.3

## v1.2.2 - Bugfix Release

There was an unintentional breaking change introduced in 1.2.x related to the `Settings.fillFromJson`. This PR restores API compatibility with 1.1.0 

## Bug Fixes 🕷️ 

- [General] Restore API compatibility for Settings.fillFromJson (Issue: #674 , PR: #676) Thanks to @goodgame365 for reporting this
<br/>

## v1.2.1 - Bugfix Release

There were two findings since the 1.2.0 release which made me release an 1.2.1 containing the related fixes:

## Bug Fixes 🕷️ 

- [Rendering]For iOS devices, tab numbers are not vertically centered to the lines (Issue: #556, PR: #570)
- [Rendering] Ensure Notation and Chord Diagrams are properly rendered when using a `scale` different than 1.0 (#564)

## v1.2.0

The next release of alphaTab is done. The theme of this release was: 

> Main focus will be improving the visual display by avoiding collisions and improving some visual elements.
 
We tried to avoid any breaking changes on the API level and upgrades should be possible without any code changes. 
But there are various behavior changes where you might want to adopt new settings, values etc.  

This release brings you:

## In alphaTab 1.2 we dropped support for Internet Explorer ❗
One of the biggest changes/decisions we took in version 1.2 is to drop support for Internet Explorer.
This allowed us to make various improvements in regards to performance and more modern code. 
We made [a poll](https://github.com/CoderLine/alphaTab/discussions/460) whether dropping IE support is generally accepted, but in case you missed it and have need for Internet Explorer support, reach out to us via [Discussions](https://github.com/CoderLine/alphaTab/discussions) and we will see what we can do. 

## New Features 💡 

- [General] JSON Serialization for the .net platform (Issue: #461, PR: #466, [Docs](https://www.alphatab.net/docs/guides/lowlevel-apis/#serialize-data-model-fromto-json)) 
<br/>

- [File Formats] Guitar Pro 7 Exporter (Issue: #443, PR: #447, [Docs](https://www.alphatab.net/docs/guides/exporter))
- [File Formats] Detect Lyrics from beat text for Guitar Pro 3-5 files (Issue: #402, PR: #506, [Docs](https://www.alphatab.net/docs/reference/settings/importer/beattextaslyrics/))
<br/>

## Improvements 🚀 

- [General] Respect original settings when printing and allow additional print settings (Issue: #469, PR: #486, [Docs](https://www.alphatab.net/docs/reference/api/print/))
- [General] Compilation of alphaTab to ES6 code for smaller footprint and more modern code (Issue: #508, PR: #512)
- [General] Smaller copyright watermark (PR: #512)
- [General] Removed various polyfills, usage of oudated APIs, better SVG generation (Issue: #509, PR: #514)
<br/>

- [File Formats] Respect track volume in Guitar Pro 7 files (Issue: #446, PR: #445 thanks to @jordanske for the contribution)
- [File Formats] Respect track volume and balance in MusicXML files (Issue: #451, PR: #454 thanks to @jordanske for the contribution)
- [File Formats] Auto detection of instruments and tunings in alphaTex (Issue: #484, PR: #449)
- [File Formats] Add support for full bar rests in Capella and MusicXML (Issue: #495, PR: #503)
<br />

- [Rendering] New Note Beaming algorithm which avoids collisions on rests (Issue: #296, PR: #491)
- [Rendering] Render multiple tunings in multi-track rendering cases (Issue: #463, PR: #492)
- [Rendering] New Grace Positioning Logic (Issues: #227, #335, PR: #493)
- [Rendering] Render HighDPI images for HTML5 Canvas (Issue: #496, PR: #497)
- [Rendering] Displace Rests in multi-voice scenarios (Issue: #355, PR: #502)
- [Rendering] Fixed various alignment issues of notes, tuplets and beams (PR: #502)
- [Rendering] Use of IntersectionObserver for faster lazy loading (Issue: #510, PR: #515)
- [Rendering] Use of ResizeObserver for faster/more-reliable resize detection (Issue: #511, PR: #516)
<br/>

- [Audio] Removed max volume limitation (Issue: #453, PR: #487)
- [Audio] More data on the `midiLoaded` event for synchronization with external audio sources (Discussion: #520, PR: #522)
- [Audio] New event fors for obtaining midi events like metronome (Issue: #450, PR: #523, [Docs](https://www.alphatab.net/docs/guides/handling-midi-events))

## Bug Fixes 🕷️ 

- [Rendering] Correct display of accidentals on tied notes across bars (Issue: #472, PR: #485)
- [Rendering] Various zoom related issues (Issue: #452, PR: #483)
- [Rendering] Added new property for WinForms control page background (replaces Foreground) (Issue: #503) 
If you had custom colors before, be sure to set the new `NotationBackColor` property. 
<br/>

- [Audio] Fixed wrong bend generations on tied bends (Issue: #470, PR: #488)

## Maintenance

- [General] Automatic generation of JSON serialization code (Issue: #461, PR: #466)
<br/>
