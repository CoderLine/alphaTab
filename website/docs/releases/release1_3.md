---
title: v1.3
---

## v1.3.1 - Bugfix Release

This is a bugfix release improving the integration with WebPack and Next.js

## Bug Fixes 🕷️ 
fix(webpack): Use webpack instance passed to plugin by @Danielku15 in https://github.com/CoderLine/alphaTab/pull/1539
fix: Source Maps should not be shipped in NPM package by @Danielku15 https://github.com/CoderLine/alphaTab/pull/1540

**Full Changelog**: https://github.com/CoderLine/alphaTab/compare/v1.3.0...v1.3.1

## v1.3.0

Finally a new release of alphaTab. The highlight feature of this release is native Android support allowing you to use alphaTab directly in your Android Views applications as a Kotlin library. 

A big "Thank You" to all people contributing to alphaTab through reporting bugs, bringing in feature ideas and contributing code changes to alphaTab!

Due to a merge mistake in the previous releases creating a reliably diff between the previous and this release was a bit cumbersome. I hope I didn't miss any features or changes worth mentioning in these release notes.

## New Features 💡 

### Support for Native Android Apps

This is the highlight feature of this release. We added a "Kotlin for Android" target to our compilation pipeline and ship now a native Android (Views) control to be used in Android apps. the feature range is similar to what we support already in .net WPF with rendering, interactivity, player, playback cursors etc. all built-in. 

We rely on your feedback to improve the platform support in terms of stability, features and performance.

* https://alphatab.net/docs/getting-started/installation-android
* https://alphatab.net/docs/tutorial-android/introduction
* https://github.com/CoderLine/alphaTabSamplesAndroid

### Bundler and Frontend Framework Support
> Add Full WebPack Support in https://github.com/CoderLine/alphaTab/pull/1386 by @Danielku15
> Add Vite Plugin in in https://github.com/CoderLine/alphaTab/pull/1386 by @Danielku15

With this release we finally achieved compatibility with modern bundlers like WebPack and Vite used in frontend Frameworks like Angular, React and Vue. 

For this we created bundler plugins which take care of the right configuration and bundling aspects so that all features like Web Workers and Audio Worklets work quasi out-of-the-box. Look at our guides and samples to learn about how to integrate alphaTab in your frontend app. 

* https://alphatab.net/docs/getting-started/installation-webpack
* https://alphatab.net/docs/getting-started/installation-vite
* https://github.com/CoderLine/alphaTabSamplesWeb

### System Layout Customization

> Add Support for system layout customization. in https://github.com/CoderLine/alphaTab/pull/1197 by @Danielku15

With this new option you can tell alphaTab to use the layout information which is embedded in the data model and might be read from formats like Guitar Pro. This information might include information like how many bars are in a system (single row with multiple staves) and a relative scaling of these bars within the system. #

See https://alphatab.net/docs/reference/settings/display/systemslayoutmode for more details

### Allow justification of last system

> Add option to allow justification of last system in https://github.com/CoderLine/alphaTab/pull/1240 @Danielku15

With this new option you can choose that the last system is also justified to the page width. Normaly bars are only justified in a system when it is considered full and we have a line wrap. But this option allows you to also justify this last system which might still have space. 

See https://next.alphatab.net/docs/reference/settings/display/justifylastsystem#description for more details

### alphaSkia as render engine

> Integrate alphaSkia in https://github.com/CoderLine/alphaTab/pull/1292 by @Danielku15

With [alphaSkia](https://github.com/CoderLine/alphaSkia) we created our own cross platform drawing library to achieve a consistent renedring experience across all platforms of alphaTab. This engine wraps [Skia](https://skia.org/), the popular 2D Graphics library developed by Google, used in many products like Google Chrome, Android and Mozilla Firefox. 

This engine is available for: 

* .net (where it replaces SkiaSharp)
* Java/Kotlin (where it replaces Skija)
* Node.js (where it replaces libraries like node-canvas).

alphaSkia currently has an alphaTab focus but depending on the interest it might evolve to a full HTML5 canvas alike library for many platforms. 

## Improvements 🚀 

### Reworked Midi Tick Lookup

> Rework Tick Lookup mechanism for cursor placement and highlighting. in https://github.com/CoderLine/alphaTab/pull/1328 by @Danielku15
> Additional cases for new tick lookup in https://github.com/CoderLine/alphaTab/pull/1334 by @Danielku15
> fix: Start and end times have to be relative to the masterbar not absolute in https://github.com/CoderLine/alphaTab/pull/1393 by @Danielku15

A key improvement and change in this release is the reworked "Midi Tick Lookup". This component is responsible to translate efficiently a given midi tick position during playpack, into the bar and beat being played. This component is key part to place the cursors during playback and highlight any currently played elements. 

With this improvement you should not experience any misplaced cursors, skipped items or not highlighted notes anymore. 

### alphaTex extensions

Special thanks to @jonaro00 who contributed various improvements around alphaTex adding improvements around error reporting and some extension around supported elements. 

* Various code improvements. Small AlphaTexImporter bugfix. in https://github.com/CoderLine/alphaTab/pull/1043 by @jonaro00 
* AlphaTex Error improvements. Line/col numbers. in https://github.com/CoderLine/alphaTab/pull/1059 by  @jonaro00 
* feat(alphaTex): allow specifying tempo as a float in a string in https://github.com/CoderLine/alphaTab/pull/1356 by @jonaro00

### Improved Grace Note Positioning

We also had to fight again our old rival, the grace notes. With their special needs in positioning and time handling they are a regular cause of problems in the positioning of notes. We tackled again some positioning related problems around grace notes.

* Adjust grace positioning to utilize free space in https://github.com/CoderLine/alphaTab/pull/1094 by  @Danielku15  
* Handle empty bars and pre-beat grace notes on new lookup logic in https://github.com/CoderLine/alphaTab/pull/1347 by @Danielku15

### MusicXML extensions

Our MusicXML support also got some improvements with new features or adjustments around existing features. Beside the display of chord diagrams there were some improvements on handling ties. 

* Handle correctly the ChordCollection items which have no diagram element. in https://github.com/CoderLine/alphaTab/pull/1211 by @Danielku15
* Improve tie handling for mxml in https://github.com/CoderLine/alphaTab/pull/1219 by @Danielku15
* Adds support for chords in MusicXML importer in https://github.com/CoderLine/alphaTab/pull/1299 by  @coluzziandrea

### SMF1.0 compliant MIDI file export 

> Add SMF1.0 compliant MIDI file export in https://github.com/CoderLine/alphaTab/pull/1239 by @Danielku15

alphaTab internally uses a MIDI standard aligned structure to handle the playback of the song. To handle all playbacks correctly we also use some events and structures from Midi 2.0 (per note pitch bends). But unfortunately this caused incompatibility with Standard Midi File Format 1.0. The SMF2.0 file standard was still not ready after many years and there is no real support for these events in the market. 

To restore compatibility with applications only supporting SMF 1.0 we added a dedicated export feature for SMF 1.0.

* https://next.alphatab.net/docs/guides/lowlevel-apis#generating-midi-files-via-midifilegenerator

In future if needed, we will also add support for the new Midi 2.0 file formats. 

### Chord unification
> Remove duplicate chords in https://github.com/CoderLine/alphaTab/pull/1216 by @AdamSEY

With this improvement we detect now same chords based on their definition and ensure they are only displayed one in the chord diagrams. This should reduce the noise in the chord diagrams where duplicates can happen from the file format design.

### Dynamic change of transposition pitches
> Allow dynamic change of transposition pitches. in https://github.com/CoderLine/alphaTab/pull/1309 by  @Danielku15

With this improvement transposition pitch changes are respected. Before this improvement the separately provided pitches were only applied once on score load. This prevented devs to develop features where a user would dynamically change the transposition to their preference. Now with this improvement pitches are handled in a more dynamic fashion when needed. 

### Others
* Analyze, Document and Fix PartConfiguration handling in https://github.com/CoderLine/alphaTab/pull/1241 by @Danielku15
* Fix: allow the import of gpx files that use displayScale as Float xml node in https://github.com/CoderLine/alphaTab/pull/1243 by @allandiego

## Bug Fixes 🕷️ 

* Fix null/undefined lyrics which cause GP7 exporter to fail in https://github.com/CoderLine/alphaTab/pull/1026 by @Danielku15 (fixes https://github.com/CoderLine/alphaTab/issues/1025)
* Fix wrong reading of alternate endings in GP5 in https://github.com/CoderLine/alphaTab/pull/1028 by @Danielku15 (fixes https://github.com/CoderLine/alphaTab/issues/1023)
* Fix wrong repeats on alternate endings in https://github.com/CoderLine/alphaTab/pull/1054 by @Danielku15 (fixes https://github.com/CoderLine/alphaTab/issues/1046)
* Ensure we respect repeats on getting beat playback position in https://github.com/CoderLine/alphaTab/pull/1055 by @Danielku15 (fixes https://github.com/CoderLine/alphaTab/issues/1047)
* Fix slide rendering on end of staves in https://github.com/CoderLine/alphaTab/pull/1053 by @Danielku15 (fixes https://github.com/CoderLine/alphaTab/issues/1045)
* Ensure we do not signal the UI facade for empty partials in https://github.com/CoderLine/alphaTab/pull/1091 by @Danielku15 (fixes https://github.com/CoderLine/alphaTab/issues/1090)
* Prevent duplicate render requests of partials in https://github.com/CoderLine/alphaTab/pull/1148 by @Danielku15 (fixes https://github.com/CoderLine/alphaTab/issues/1147)
* Fix broken count-in on playback ranges in https://github.com/CoderLine/alphaTab/pull/1149 by @Danielku15 (fixes https://github.com/CoderLine/alphaTab/issues/1140)
* Handle missing effect bands on multi voice effect scenarios. in https://github.com/CoderLine/alphaTab/pull/1223 by @Danielku15 (fixes https://github.com/CoderLine/alphaTab/issues/1200)
* Fix .net related problems with alphaSkia, fix player related problems in https://github.com/CoderLine/alphaTab/pull/1329 by @Danielku15 (fixes https://github.com/CoderLine/alphaTab/issues/1288)
* Fix harsh noise by only synthesizing samples while playing in https://github.com/CoderLine/alphaTab/pull/1330 by @Danielku15 (fixes https://github.com/CoderLine/alphaTab/issues/1298)


## Maintenance 👷‍♂️

### Improved GitHub Actions workflows
We made various improvements around our build system and kept it up to date regarding any dependencies and new practices. 

* Change runner and update workflows in https://github.com/CoderLine/alphaTab/pull/1027 by @Danielku15 
* Fix and cleanup Publish workflow in https://github.com/CoderLine/alphaTab/pull/1113 by @jonaro00 (fixes https://github.com/CoderLine/alphaTab/issues/1112)

### Targeting .net 8.0
> chore: Target net8.0 #1465

As .net 6.0 is now out of support we target the new LTS version .net 8.0 for our .net Windows Libraries (WPF/WinForms). The core library still targets .netstandard 2.0. 

### Other

* Clean up README in https://github.com/CoderLine/alphaTab/pull/1041 by @jonaro00 
* Update/simplify npm scripts in https://github.com/CoderLine/alphaTab/pull/1042 by @jonaro00 
* Optimize TS generator, remove trailing whitespace from generated in https://github.com/CoderLine/alphaTab/pull/1061 by @jonaro00 
* Export more internals https://github.com/CoderLine/alphaTab/pull/1274 by @Danielku15