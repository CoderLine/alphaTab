# alphaTab Playground

A development harness for alphaTab. Each demo under `demos/` exercises a specific capability of the
library against the live source under `packages/alphatab/src/`. Editing alphaTab source hot-reloads
the playground via Vite's workspace alias.

The player demos are built from the same packages as the website's player, also resolved to their
live sources: [`@coderline/alphatab-ui`](../ui/) (player and alphaTex editor components, state and
styles) on top of [`@coderline/alphatab-react`](../react/) (the API lifecycle and event hooks) on top
of `@coderline/alphatab`. A change to any of these layers shows up in the playground right away. The
playground is not a reference for end users; for the raw API without a framework, read the demo
specific parts (`src/components/recorder/DrumRecorder.ts`, `src/components/youtube-sync/YoutubeSync.ts`)
and the packages above.

## Running it

From the monorepo root:

```bash
npm run dev
```

This is a shortcut for `npm run dev --workspace=packages/playground` and opens the labs index at
[`http://localhost:5173/`](http://localhost:5173/).

Other scripts (run from `packages/playground/`):

- `npm run typecheck` — `tsc --noEmit` against the playground's tsconfig.
- `npm run lint` — Biome lint.

Every player demo takes `?engine=svg|html5` and `?loglevel=debug|info|warning|error` in its address;
they apply on top of the UI's settings and survive a settings reset. In the browser console,
`window.api` is the demo's `AlphaTabApi` and `window.alphaTab` the alphaTab module. On the Control
demo, CapsLock shows a crosshair following the mouse.

## Architecture at a glance

```
demos/<feature>/index.html         page shell: "<div id='app'></div>" + module script
demos/<feature>/index.tsx          mountDemo(<FeatureApp />)

src/apps/<Feature>App.tsx          a <PlayerProvider> with the demo's settings and its view
src/player/mount.tsx               mountDemo: React root, UiEnvironment, NavMenu; DevGlobals (window.api)
src/player/environment.ts          the UiEnvironment of the demos, player settings, single-sample documents
src/player/DemoPlayerView.tsx      the shared <PlayerView>: header, track and settings panels, waveform, drops
src/components/recorder/           Drum Recorder: score extension logic, pads, rhythm grid
src/components/youtube-sync/       YouTube Sync: the external-media handler and the video
src/components/NavMenu.ts          demo navigation (vanilla, on every page)
src/components/Crosshair.ts        CapsLock crosshair (vanilla)
src/apps/LabsIndexApp.ts           labs index (vanilla)
src/apps/TestResultsApp.ts         visual test results (vanilla)
src/util/Dom.ts                    html/css tagged templates, parseHtml, injectStyles for the vanilla pages
src/util/Paths.ts                  default file paths
src/styles/common.css              fonts, resets and score cursor colors for every page
src/styles/player.css              full-window layout of the player pages
```

### Player demos

A demo app wraps its view in `<PlayerProvider>` from `@coderline/alphatab-ui`. The provider creates
the `AlphaTabApi` when its host mounts, attaches a `PlayerStore` to it and destroys both on unmount.
Components below it read state through `usePlayerSelector`/`usePlayerState`, act through
`usePlayerControls()`, and reach the API through `useAlphaTabApi()` and `useAlphaTabEvent()` from
`@coderline/alphatab-react`.

- **Settings** come in three layers: the UI's base settings (`applyBaseSettings`), the environment's
  `settingsLayer` (page parameters plus the demo's own layer passed to `mountDemo`, re-applied on
  every settings reset), and the provider's `settings` prop. The prop sets `player.playerMode` and
  `player.soundFont` (see `playerSettings()`), so the playback source is fixed and the SoundFont is
  loaded straight from `/font/`, without the website's SoundFont library and its cache.
- **Documents**: demos that open files use `useScoreDocument` with `singleSampleDocuments(...)`; it
  loads the sample, opens dropped or picked files and re-imports on importer settings changes. The
  alphaTex editor keeps its document in `sessionStorage`.
- **Layout**: `DemoPlayerView` renders the `PlayerView` composite with a header (file, panel
  toggles, open, export menu), the track panel, the settings panel (every alphaTab setting, persisted
  per demo in `localStorage`), the rendering indicator and the backing-track waveform. Demos add an
  editor panel, content above the workspace or an overlay in score coordinates.
- **Styles** are SCSS modules next to their component; the UI's design tokens come from
  `@coderline/alphatab-ui/styles/tokens.scss`.

### Vanilla pages

The labs index, the visual test results and the shared `NavMenu`/`Crosshair` stay framework-free.
They build their DOM detached with `parseHtml(html\`…\`)`, expose it as `root` and remove it in
`dispose()`. `html` escapes interpolated values; `injectStyles(key, sheet)` adds a component's sheet
once per page. Class names are prefixed with the component's kebab name (`at-nav-menu-…`) since the
sheets are global.

## Adding a new demo

1. `mkdir packages/playground/demos/my-feature`
2. Add `index.html`:
   ```html
   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <title>alphaTab — My Feature</title>
       <link rel="stylesheet" href="../../src/styles/common.css" />
       <link rel="stylesheet" href="../../src/styles/player.css" />
     </head>
     <body>
       <div id="app"></div>
       <script type="module" src="./index.tsx"></script>
     </body>
   </html>
   ```
3. Add `index.tsx` calling `mountDemo(<MyFeatureApp />)` from `src/player/mount`.
4. Build the app in `src/apps/MyFeatureApp.tsx`: a `<PlayerProvider settings={playerSettings()}>`
   with `<DevGlobals />` and a view rendering `<DemoPlayerView demo="my-feature" … />`, or the
   `@coderline/alphatab-ui` components directly.
5. Add the demo to the `DEMOS` array in [`src/util/Demos.ts`](./src/util/Demos.ts) so it shows up on
   the labs index and in the navigation.

## Demos

| Demo | Path | What it exercises |
| --- | --- | --- |
| Control | [`demos/control/`](./demos/control/) | Full player: track panel with mute/solo/volume and visibility, transport with loop/count-in/metronome, all settings (layout, scroll mode, zoom, tempo, output device), exports (Guitar Pro, alphaTex, MIDI, WAV, print), drag-drop, backing-track waveform. |
| Drum Recorder | [`demos/recorder/`](./demos/recorder/) | Programmatic score construction, dynamic system extension, tick-cache updates, MIDI extension/regeneration, `playedBeatChanged`. |
| AlphaTex Editor | [`demos/alphatex-editor/`](./demos/alphatex-editor/) | Monaco with the alphaTex language server next to the live rendering; edits re-render with `reuseViewport`, dropped files are converted with `AlphaTexExporter`. |
| YouTube Sync | [`demos/youtube-sync/`](./demos/youtube-sync/) | `EnabledExternalMedia` player mode driving alphaTab from a YouTube IFrame player. |
| Visual Test Results | [`demos/test-results/`](./demos/test-results/) | Diff viewer for visual regression failures with accept-to-reference flow. |

## Dev-server endpoints

The custom Vite plugin in [`vite.plugin.server.ts`](./vite.plugin.server.ts) adds:

- `/font/*` — serves files from `packages/alphatab/font/` (Bravura, sound fonts).
- `/test-data/*` — serves files from `packages/alphatab/test-data/` (GP files, visual-test
  references and fixtures).
- `GET /test-results/list` — JSON list of failing visual tests by crawling for `*.new.png` files
  under `test-data/`.
- `POST /test-results/accept` — accepts one new reference image (replaces the corresponding
  `.png`). Used by the `Visual Test Results` demo.

## Editing alphaTab source

`@coderline/alphatab`, `@coderline/alphatab-react`, `@coderline/alphatab-ui`, the language server and
the Monaco integration resolve via [`tsconfig.base.json`](../../tsconfig.base.json) paths to their
`src/` folders. Editing any of them triggers a Vite hot update or a full-page reload — no manual
rebuild needed. The workers (alphaTab's, Monaco's and the alphaTex language server) are module
workers loaded from source as well.

If you need to test against a built artifact instead, replace the workspace alias path or import
from the published package name in a single demo.

## Troubleshooting

- **The page reloads once on the first visit of a demo** — Vite found dependencies to pre-bundle
  (e.g. the language server's) and reloads after optimizing them.
- **Settings look stuck after experimenting** — the settings panel persists its overrides per demo
  in `localStorage`; use "Reset all" in the panel.
- **Two React copies / invalid hook call** — `resolve.dedupe` in [`vite.config.ts`](./vite.config.ts)
  keeps the ui and react sources on the playground's React; keep it when changing the config.
