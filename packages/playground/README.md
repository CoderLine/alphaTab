# alphaTab Playground

A development harness for alphaTab. Each demo under `demos/` exercises a specific capability of the
library against the live source under `packages/alphatab/src/`. Editing alphaTab source hot-reloads
the playground via Vite's workspace alias.

The playground is **not** a framework reference for end users. Framework-specific components are
planned as separate packages. The patterns shown here are deliberately framework-agnostic: a
React/Angular/Svelte/Vue user can read these classes, understand which alphaTab events to subscribe
to and when to clean up, then apply the same logic in their framework's idiomatic shape.

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

## Architecture at a glance

```
demos/<feature>/index.html         minimal "<div id='app'></div>" + module script
demos/<feature>/index.ts           constructs an App and appends `app.root`

src/apps/<Feature>App.ts           top-level composer per demo, owns the AlphaTabApi
src/components/<Composer>.ts       alphaTab-aware composer (TransportBar, Footer, Sidebar, …)
src/components/primitives/         alphaTab-unaware UI bricks (IconButton, Dropdown, Slider, …)
src/util/Dom.ts                    html/css tagged templates, parseHtml, injectStyles, mount
src/util/Icons.ts                  lucide pass-through
src/util/Paths.ts                  default file paths
src/styles/common.css              palette, fonts, resets — global CSS
```

The component tree for a typical demo is `App → composers → primitives`. The App constructs the
AlphaTabApi after mounting its viewport, then mounts composers into placeholders in its template.
Composers do the same for their primitives.

## The component contract

Every UI piece is a class with this consistent shape:

```ts
class Transport implements Mountable {
    readonly root: HTMLElement;            // detached at construction; mounted by caller

    constructor(api: alphaTab.AlphaTabApi); // engine deps as args; never `parent`

    setReady(ready: boolean): void;         // parent → child push API
    onSomething: (() => void) | null = null; // child → parent event API

    dispose(): void;
}
```

Rules:

- **Constructor takes engine dependencies and props, never `parent`.** Build DOM detached as `.root`.
  Mounting is the caller's job.
- **Public methods are the parent → child push API.** Parents call `transport.setReady(true)`
  directly. No prop diffing, no virtual DOM.
- **Assignable callback fields are the child → parent event API.** A child exposes
  `onPlayClick: (() => void) | null = null`; the parent assigns a function. For multi-listener
  fan-out, a typed `EventEmitter<T>` is fine.
- **`dispose()` releases everything**: api event subscriptions (the `() => void` returned by
  `api.event.on(...)`), DOM listeners, intervals, ResizeObservers, child components. Removing
  `this.root` takes the entire DOM subtree with it.
- **Composition over inheritance.** `Footer` composes `TransportBar`; `App` composes one of each
  top-level piece.
- **Engine events drive UI.** Each component subscribes directly to the alphaTab events it needs
  (`TransportBar` → `playerStateChanged`; `TrackList` → `scoreLoaded`; `TimeSlider` →
  `playerPositionChanged`; `Waveform` → `scoreLoaded` + DOM events on the audio element). The api
  is the source of truth — no intermediate state container.

### No IDs, kebab-prefixed classes, component-local nesting

- **No `id` attributes inside component markup.** IDs collide across multiple instances. Use class
  names or `data-*`.
- **Prefix every class with the component's kebab name** — `at-icon-btn`, `at-transport-…`,
  `at-drum-pad-…`. Names are global; prefixes prevent leaks.
- **Nested selectors stay component-local** — `.at-track .at-track-controls`, never bare
  `.at-track-controls`.

### Styles co-located via `injectStyles`

```ts
import { html, css, parseHtml, injectStyles } from '../../util/Dom';

injectStyles('IconButton', css`
  .at-icon-btn { display: inline-flex; align-items: center; … }
  .at-icon-btn[disabled] { opacity: 0.4; cursor: default; }
`);
```

`injectStyles(key, sheet)` is keyed by component name and injects the `<style>` tag once per page,
no matter how many instances are constructed. The `html` and `css` tagged templates are essentially
identity functions — `html` auto-escapes interpolated runtime strings (XSS guard for track names,
file names, etc.), and editors hook off the tag name for syntax highlighting (recommend the
`bierner.lit-html` VS Code extension; see `.vscode/extensions.json`).

## Two layers — primitives and composers

[`src/components/primitives/`](./src/components/primitives/) holds **generic, alphaTab-unaware UI
bricks**. They take props in their constructor, render a detached subtree, and expose typed methods
plus assignable callbacks. They are reusable across demos and (in spirit) across other projects:

- [IconButton](./src/components/primitives/IconButton.ts) — icon + tooltip + onClick.
- [ToggleButton](./src/components/primitives/ToggleButton.ts) — IconButton with active state.
- [Dropdown](./src/components/primitives/Dropdown.ts) — popper-positioned dropdown with click-outside
  dismissal and keyboard handling.
- [Tooltip](./src/components/primitives/Tooltip.ts) — popper-positioned hover tooltip.
- [ProgressBar](./src/components/primitives/ProgressBar.ts) — clickable horizontal fill with
  `onClickPercent`.
- [Slider](./src/components/primitives/Slider.ts) — `<input type="range">` wrapper.
- [LoadingProgress](./src/components/primitives/LoadingProgress.ts) — circular percentage indicator.
- [Spinner](./src/components/primitives/Spinner.ts) — indeterminate rotating ring.

[`src/components/`](./src/components/) holds the **alphaTab-aware composers**. They take the
`AlphaTabApi` (and sometimes options) in their constructor, declare a layout template with
`cmp-…` placeholders, and mount primitives into those placeholders. Composers translate engine
events into primitive method calls; primitives stay alphaTab-unaware.

A button-per-feature design (`MetronomeToggle`, `CountInToggle`, …) would be a class explosion.
`TransportBar` instead instantiates a `ToggleButton` per toggle inline:

```ts
this.metronome = mount(this.root, '.cmp-metronome',
    new ToggleButton({ icon: Icons.Metronome, tooltip: 'Metronome' }));
this.metronome.onChange = on => { api.metronomeVolume = on ? 1 : 0; };
```

Components stay as their own class only when they have **non-trivial behaviour of their own**:
[Waveform](./src/components/Waveform.ts) (canvas drawing), [TimeSlider](./src/components/TimeSlider.ts),
[TrackItem](./src/components/TrackItem.ts) (compound),
[SelectionHandles](./src/components/SelectionHandles.ts) (drag math),
[Crosshair](./src/components/Crosshair.ts), [DragDrop](./src/components/DragDrop.ts),
the recorder/alphatex/youtube subfolders.

## Composition mechanics

> **A component's constructor builds its DOM detached and exposes it as `.root`. It does not mount
> itself.** Mounting happens at the call-site, in one of two explicit, swappable ways.

### Static layout — placeholder + `mount()`

The composer's `parseHtml` template declares the **complete** visual structure including
`<div class="cmp-…"></div>` placeholders. `mount(parent, '.cmp-x', component)` swaps each
placeholder for the component's root:

```ts
// src/components/Footer.ts
this.root = parseHtml(html`
    <div class="at-footer">
        <div class="cmp-waveform"></div>
        <div class="cmp-time-slider"></div>
        <div class="cmp-transport"></div>
    </div>
`);
this.waveform = mount(this.root, '.cmp-waveform', new Waveform(api));
this.timeSlider = mount(this.root, '.cmp-time-slider', new TimeSlider(api));
this.transport = mount(this.root, '.cmp-transport', new TransportBar(api));
```

Reading the `parseHtml` block tells you the exact layout. To move the waveform after the
time-slider, you swap two `<div>` lines — wiring stays identical.

`mount()` throws on a missing placeholder, so typos fail loudly at construction.

### Dynamic layout — container + direct `appendChild`

For lists whose children depend on runtime state (`TrackList` growing as scores load,
`DrumPadPanel` building pads from a config), the composer's template declares a **container**
rather than placeholders, and instances are appended directly:

```ts
// src/components/TrackList.ts
this.root = parseHtml(html`<div class="at-track-list"></div>`);
api.scoreLoaded.on(score => {
    for (const item of this.items) item.dispose();
    this.items = [];
    for (const track of score.tracks) {
        const item = new TrackItem(api, track);
        this.root.appendChild(item.root);
        this.items.push(item);
    }
});
```

### Mounting the App

The top-level App is mounted by the demo's `index.ts`:

```ts
// demos/control/index.ts
import { ControlApp } from '../../src/apps/ControlApp';
const app = new ControlApp();
document.getElementById('app')!.appendChild(app.root);
```

## Dom utilities

All in [`src/util/Dom.ts`](./src/util/Dom.ts):

- `html\`…\`` — tagged template that auto-escapes interpolated values. Use for runtime strings
  (track names, song titles, MIDI program names). Static literals are inlined as-is.
- `css\`…\`` — identity tag; gives editors a hook for CSS syntax highlighting.
- `parseHtml(markup)` — parses a markup string into an `HTMLElement` (detached).
- `escapeHtml(value)` — manual escape. `html\`…\`` calls this for you.
- `injectStyles(key, sheet)` — injects the sheet once per `key` (component class name).
- `mount(container, selector, component)` — replaces a `cmp-…` placeholder with `component.root`,
  returns the component for chaining.
- `Mountable` — `interface { readonly root: HTMLElement }`. Implemented by every component.

## Conventions and naming

- **`at-…`** — alphaTab-semantic class names (`at-track`, `at-player`, `at-canvas`, `at-viewport`).
  Kept where alphaTab itself or existing CSS expects them.
- **`at-<component-kebab>-…`** — component-local class names (`at-icon-btn`, `at-transport`,
  `at-drum-pad-panel`). Prefix prevents global collisions.
- **`cmp-<slot>`** — placeholder marker classes inside composer templates. Replaced by `mount()`,
  not styled.

## Adding a new demo

1. `mkdir packages/playground/demos/my-feature`
2. Add `index.html`:
   ```html
   <!doctype html>
   <html>
     <head>
       <meta charset="utf-8" />
       <title>alphaTab — My Feature</title>
       <link rel="stylesheet" href="../../src/styles/common.css" />
     </head>
     <body>
       <div id="app"></div>
       <script type="module" src="./index.ts"></script>
     </body>
   </html>
   ```
3. Add `index.ts` constructing your App and appending `app.root` to `#app`.
4. Build the App in `src/apps/MyFeatureApp.ts` — composing existing components from
   `src/components/` and primitives from `src/components/primitives/`.
5. Add the demo to the `DEMOS` array in
   [`src/apps/LabsIndexApp.ts`](./src/apps/LabsIndexApp.ts) so it shows up on the homepage.

## Adding a new component

Decide primitive vs composer:

- **Primitive** if it's alphaTab-unaware — a piece of UI plumbing reusable across demos. Goes in
  `src/components/primitives/`. Constructor takes props only.
- **Composer** if it consumes the `AlphaTabApi` directly. Goes in `src/components/` (or a demo-specific
  subfolder for components used by exactly one demo).

Either way: one file with `injectStyles(name, css\`…\`)` at the top, a class implementing
`Mountable` with a constructor that builds DOM detached, and a `dispose()` that walks tracked
subscriptions and removes `this.root`.

## Demos

| Demo | Path | What it exercises |
| --- | --- | --- |
| Control | [`demos/control/`](./demos/control/) | Full player: track sidebar, transport bar with all toggles/dropdowns, downloads, drag-drop, layout/scroll/zoom pickers. |
| Drum Recorder | [`demos/recorder/`](./demos/recorder/) | Programmatic score construction, dynamic system extension, tick-cache updates, MIDI extension/regeneration, `playedBeatChanged`. |
| AlphaTex Editor | [`demos/alphatex-editor/`](./demos/alphatex-editor/) | Round-trip between AlphaTex source and the Score model via `AlphaTexImporter` / `AlphaTexExporter`, with Monaco LSP. |
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

`@coderline/alphatab` resolves via [`tsconfig.base.json`](../../tsconfig.base.json) paths to
`packages/alphatab/src/alphaTab.main.ts`. Editing any source file under `packages/alphatab/src/`
triggers a Vite full-page reload — no manual rebuild needed.

If you need to test against a built artifact instead, replace the workspace alias path or import
from the published package name in a single demo.

## Troubleshooting

- **`mount()` throws `Placeholder '.cmp-x' not found`** — the placeholder's class name in your
  composer template doesn't match the selector you pass to `mount()`. Both use kebab case, prefixed
  `cmp-`.
- **Style leaks across components** — you forgot to prefix a class, or used a bare nested
  selector (`.label` instead of `.at-icon-btn .label`). Component CSS is global; the prefix is the
  only scoping mechanism.
- **`<style>` tags duplicating in `<head>`** — you called `injectStyles` with a different key for
  the same component. Keep the key constant per component class.
- **Dispose leaks (events still firing after a demo navigation)** — your composer didn't push the
  unsubscribe function returned by `api.event.on(...)` into its tracked-subscriptions array, or
  forgot to walk the array in `dispose()`.
- **Monaco worker fails to load** — see the comment in
  [`alphatexLanguageServerWrap.ts`](./alphatexLanguageServerWrap.ts) explaining the indirection
  required by Vite's `?worker` import.
