import { useEffect, useState } from 'react';

export type AlphaTabModule = typeof import('@coderline/alphatab');

let alphaTabPromise: Promise<AlphaTabModule> | undefined;
let registeredLoader: (() => Promise<AlphaTabModule>) | undefined;

export function registerAlphaTabLoader(loader: () => Promise<AlphaTabModule>): void {
    registeredLoader = loader;
    alphaTabPromise = undefined;
}

export function initAlphaTab(): Promise<AlphaTabModule> {
    if (!alphaTabPromise) {
        if (!registeredLoader) {
            throw new Error('[alphaTab-react] No alphaTab loader registered. Call registerAlphaTabLoader() before mounting.');
        }
        alphaTabPromise = registeredLoader();
    }
    return alphaTabPromise;
}

export function useAlphaTabModule(): AlphaTabModule | null {
    const [module, setModule] = useState<AlphaTabModule | null>(null);
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

registerAlphaTabLoader(() => import('@coderline/alphatab'));
