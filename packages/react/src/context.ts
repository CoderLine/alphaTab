import type { AlphaTabApi } from '@coderline/alphatab';
import { createContext, useContext } from 'react';

/**
 * The DOM elements of the {@link AlphaTabHost} inside the nearest {@link AlphaTabProvider}.
 * Each element is `null` until the host has mounted.
 */
export interface AlphaTabElements {
    /** The outermost host element, passed to alphaTab as `player.scrollElement`. */
    readonly scrollElement: HTMLElement | null;
    /** The element alphaTab renders into. */
    readonly mountElement: HTMLElement | null;
}

/** @internal */
export interface AlphaTabContextValue {
    readonly api: AlphaTabApi | null;
    readonly elements: AlphaTabElements;
    readonly setScrollElement: (element: HTMLElement | null) => void;
    readonly setMountElement: (element: HTMLElement | null) => void;
}

/** @internal */
export const AlphaTabContext = createContext<AlphaTabContextValue | null>(null);

/** @internal */
export function useAlphaTabContext(caller: string): AlphaTabContextValue {
    const context = useContext(AlphaTabContext);
    if (!context) {
        throw new Error(`${caller} must be used inside <AlphaTabProvider>`);
    }
    return context;
}
