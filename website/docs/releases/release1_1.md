---
title: v1.1
---

The next release of alphaTab is done. The theme of this release was: 

> Main focus is some small features requested from various people which are straight forward to achieve.
 
This release brings you:

## New Features 💡 

- [File Formats] Add basic support for Capella file format (Issue: #392, PR: #375)
<br/>

- [Rendering] Add support for percussion instruments with 1,2 or 3 staff lines (Issue: #94, PR: #382)
- [Rendering] Add support for percussion instruments with 1,2 or 3 staff lines (Issue: #94, PR: #382)
<br/>

- [Audio] Add support for loading multiple soundfonts (Issue: #302, PR: #380)
- [Audio] Added API for playing a single beat or note (Issue: #187, PR: #428)
- [Audio] Added new count-in option to play one bar with metronome before actual playback starts (Issue: #242, PR: #432)

## Improvements 🚀 

- [General] Updated development dependencies and upgraded to TypeScript 4 (Issue: #424, #423, PR: #431, #426, thanks to @wassertim for the contribution)
<br/>

- [File Formats] Respect accidentals as noted in Guitar Pro 6 and 7 files (Issue: #365, PR: #381)
- [File Formats] Respect parsed lyrics information in Guitar Pro 6 and 7 files (Issue: #220, PR: #429)
<br/>

- [Rendering] Improvements on the spacing algorithm (Issue: #394, PR: #397)
- [Rendering] Ensure cursor selection is updated visually when the playbackRange is set via API (Issue: #412, PR: #419)
<br/>

- [Audio] Allow playback of songs without soundfont loaded (Issue: #403, PR: #404)
- [Audio] Improved looping logic to make it more seamless (Issue: #410, PR: #420)

## Bug Fixes 🕷️ 

- [File Formats] Proper support of harmonics in Guitar Pro 3 (Issue: #388, PR: #389)
- [File Formats] Fixed issue on tempo automations of files by Guitar Pro 7.5 for MacOS (Issue: #391)
- [File Formats] Fixed issue Guitar Pro files having the lyrics start bar beyond the last bar (PR: #439, thanks to @thoun for the contribution)
<br/>

- [Rendering] Bend Slur was rendered as filled triangle instead of edged line (Issue: #405, PR: #418)
<br/>

- [Audio] Setting of the master volume did not work (Issue: #399)
- [Audio] Wrong metronome calculation on tempo changes (Issues: #408, #400, PR: #414)
- [Audio] Ensure metronome plays when some tracks are set to solo (Issue: #434, PR: #440)


