# alphaTab React

React bindings for [alphaTab](https://alphatab.net): they create and destroy the `AlphaTabApi` with the component tree and give components access to the API and its events. Application state, UI controls, styles and SoundFont handling are left to the application.

```tsx
import { PlayerMode } from '@coderline/alphatab';
import {
    AlphaTabHost,
    AlphaTabProvider,
    useAlphaTabApi,
    useAlphaTabEventValue
} from '@coderline/alphatab-react';

function PlayButton() {
    const api = useAlphaTabApi();
    return <button onClick={() => api?.playPause()} disabled={!api}>Play/Pause</button>;
}

function Title() {
    const title = useAlphaTabEventValue('scoreLoaded', score => score.title);
    return <h1>{title}</h1>;
}

export function Score({ file }: { file: string }) {
    return (
        <AlphaTabProvider
            file={file}
            configureSettings={settings => {
                settings.player.playerMode = PlayerMode.EnabledAutomatic;
                settings.player.soundFont = '/soundfont/sonivox.sf2';
            }}
            settings={{ display: { scale: 0.8 } }}>
            <Title />
            <PlayButton />
            <AlphaTabHost className="score-viewport" />
        </AlphaTabProvider>
    );
}
```

## `AlphaTabProvider`

Owns one API instance. It is created when the `AlphaTabHost` mounts and recreated only when the host's elements change; change the provider's `key` to recreate it for other reasons.

- `configureSettings` prepares the settings right before construction; `player.scrollElement` is already set to the host's scroll element.
- `settings` is a patch applied at construction and, when values change, at runtime through `fillFromJson`, `updateSettings()` and `render()`, batched to the next animation frame. Values are compared structurally (plain objects by key, arrays and `Map`s by content, DOM nodes and class instances by identity), and only changed values are applied, so settings changed through the API stay in place. Keys removed from the patch keep their last applied value.
- `file` (a URL) or `tex` (alphaTex) is the displayed score, and `tracks` the displayed tracks. They are reactive: the score is loaded through `api.load`/`api.tex` once the API is provided, after the descendants' effects have subscribed, and again when `file` or `tex` changes; a changed `tracks` re-renders the displayed score. `file` takes precedence over `tex`. Applications that load scores through the API themselves should omit `file` and `tex`.
- `onApi` receives each new instance; a returned cleanup runs right before that instance is destroyed. If `onApi` throws, the instance is destroyed and the error propagates.
- A ref exposes a stable `{ api }` object whose `api` is the live instance or `null`.

A replaced or unmounted instance is no longer provided right away and is destroyed once the effect cleanups of the components that used it have run, so these cleanups may still call it.

## `AlphaTabHost`

Renders the scroll element, a `position: relative` wrapper with the mount element, and an optional `overlay`. HTML attributes such as `className`, `style` or `id` apply to the scroll element, `mountClassName` to the mount element. The host may sit anywhere below its provider; each provider takes one host.

## Hooks

- `useAlphaTabApi()` and `useAlphaTabElements()` return the provider's API and host elements.
- `useAlphaTabEvent(event, handler)` and `useAlphaTabEvent(api, event, handler)` subscribe to an event; the latest handler is called without resubscribing, and errors it throws are reported through `reportError` without affecting alphaTab.
- `useAlphaTabEventValue(event, select, read?)` and `useAlphaTabEventValue(api, event, select, read?)` return a value derived from the latest event, or from `read` until the event fires.

alphaTab calls new listeners right away for events whose state already exists, such as `scoreLoaded` after a score was loaded or `playerStateChanged`. Event hooks receive this replay whenever they subscribe, which `<StrictMode>` does twice on mount in development.

## Setup

`react` (19) and `@coderline/alphatab` are peer dependencies. The package is marked `'use client'` for React Server Components. Set up alphaTab's bundler plugin (`@coderline/alphatab-webpack` or `@coderline/alphatab-vite`) as for any alphaTab application.
