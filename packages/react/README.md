# alphaTab React

React bindings for [alphaTab](https://alphatab.net): they create and destroy the `AlphaTabApi` with the component tree and give components access to the API and its events. Application state, UI controls, styles and SoundFont handling are left to the application.

```tsx
import { PlayerMode } from '@coderline/alphatab';
import { AlphaTabHost, AlphaTabProvider, useAlphaTabApi, useAlphaTabEvent } from '@coderline/alphatab-react';
import { useState } from 'react';

function PlayButton() {
    const api = useAlphaTabApi();
    return <button onClick={() => api?.playPause()} disabled={!api}>Play/Pause</button>;
}

function Title() {
    const [title, setTitle] = useState('');
    useAlphaTabEvent('scoreLoaded', score => setTitle(score.title));
    return <h1>{title}</h1>;
}

export function Score() {
    return (
        <AlphaTabProvider
            file="/files/song.gp"
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

- `AlphaTabProvider` owns one API instance. It is created when the `AlphaTabHost` mounts and destroyed when the host or the provider unmounts. `configureSettings` prepares the settings before construction; `file`, `tex` and `tracks` are the initial sources. A changed `settings` patch is applied at runtime and never recreates the API. `onApi` receives each new instance and may return a cleanup that runs before the instance is destroyed. A ref exposes `{ api }`.
- `AlphaTabHost` renders the scroll element, a `position: relative` wrapper with the mount element, and an optional `overlay`. It may sit anywhere below the provider.
- `useAlphaTabApi()`, `useAlphaTabElements()`, `useAlphaTabEvent(event, handler)`, `useAlphaTabEvent(api, event, handler)` and `useAlphaTabEventValue(api, event, select, read)` give components access to the API.

`react`, `react-dom` (19) and `@coderline/alphatab` are peer dependencies. Set up alphaTab's bundler plugin (`@coderline/alphatab-webpack` or `@coderline/alphatab-vite`) as for any alphaTab application.
