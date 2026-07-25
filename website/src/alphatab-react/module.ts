import { useEffect, useState } from 'react';
// Static import: the AlphaTabWebPackPlugin instruments alphaTab at build time
// by scanning `import ... from '@coderline/alphatab'` and injecting the correct
// worker + audio-worklet script paths on `alphaTab.Environment`. A dynamic
// `import('@coderline/alphatab')` bypasses that instrumentation and the synth
// then silently fails to load its worklet — playback runs but no audio.
import * as alphaTab from '@coderline/alphatab';

export type AlphaTabModule = typeof import('@coderline/alphatab');

const staticAlphaTab: AlphaTabModule = alphaTab;
let alphaTabPromise: Promise<AlphaTabModule> | undefined;
let registeredLoader: (() => Promise<AlphaTabModule>) | undefined;

/**
 * Override the default loader. Rarely needed — the default resolves the
 * statically-imported module synchronously so the webpack plugin's worker /
 * worklet instrumentation is preserved. Provide a custom loader only when
 * you have to lazy-load alphaTab through a bundler-specific pipeline you
 * are certain preserves the same instrumentation.
 */
export function registerAlphaTabLoader(loader: () => Promise<AlphaTabModule>): void {
    registeredLoader = loader;
    alphaTabPromise = undefined;
}

export function initAlphaTab(): Promise<AlphaTabModule> {
    if (!alphaTabPromise) {
        alphaTabPromise = registeredLoader
            ? registeredLoader()
            : Promise.resolve(staticAlphaTab);
    }
    return alphaTabPromise;
}

/**
 * Synchronous accessor for the statically-imported alphaTab module. Preferred
 * over `useAlphaTabModule` when the caller needs the module before the async
 * effect that populates it has resolved (e.g. imperative access from inside
 * an event handler that fires on the very first render).
 */
export function getAlphaTabModule(): AlphaTabModule {
    return staticAlphaTab;
}

export function useAlphaTabModule(): AlphaTabModule | null {
    const [module, setModule] = useState<AlphaTabModule | null>(staticAlphaTab);
    useEffect(() => {
        let cancelled = false;
        initAlphaTab().then((m) => {
            if (!cancelled) setModule(m);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    return module;
}
