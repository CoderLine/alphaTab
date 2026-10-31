import type { Settings } from '@coderline/alphatab';
import { createContext, type ReactNode, useContext, useMemo, useSyncExternalStore } from 'react';
import {
    localStoragePreferences,
    type PlaybackPreferences,
    PlaybackPreferencesStore,
    type PreferencesStorage
} from './state/playback/preferences';
import type { SoundFontLibrarySnapshot, SoundFontProvider } from './state/playback/soundfont-library';
import type { UiTheme } from './state/settings';

/**
 * What the player and editor components need from their host. One environment usually serves a
 * whole application; {@link UiEnvironmentProvider} can override parts of it for a subtree.
 */
export interface UiEnvironment {
    /** The color scheme the notation is rendered for. */
    readonly theme: UiTheme;
    /** `core.fontDirectory` of every player; `undefined` keeps alphaTab's own lookup. */
    readonly fontDirectory?: string;
    /**
     * Supplies the SoundFont of every player that does not load its own. Without one, players load
     * the SoundFont of their `player.soundFont` setting.
     */
    readonly soundFonts: SoundFontProvider | null;
    /** Persists UI preferences such as panel layouts and setting overrides. */
    readonly storage: PreferencesStorage;
    /** The playback source and SoundFont the user prefers. */
    readonly playbackPreferences: PlaybackPreferencesStore;
    /**
     * Applied on top of the base settings of every player at creation, on theme switches and on
     * resets, e.g. a music font or debug options. A new function is applied to living players too.
     */
    readonly settingsLayer?: (settings: Settings) => void;
}

/** The parts a host sets; the rest takes the defaults of {@link createUiEnvironment}. */
export interface UiEnvironmentOptions {
    theme?: UiTheme;
    fontDirectory?: string;
    soundFonts?: SoundFontProvider | null;
    storage?: PreferencesStorage;
    settingsLayer?: (settings: Settings) => void;
}

/**
 * An environment with its own playback preferences. Defaults: light theme, alphaTab's font lookup,
 * no SoundFont provider and `localStorage`.
 */
export function createUiEnvironment(options: UiEnvironmentOptions = {}): UiEnvironment {
    const soundFonts = options.soundFonts ?? null;
    const storage = options.storage ?? localStoragePreferences;
    return {
        theme: options.theme ?? 'light',
        fontDirectory: options.fontDirectory,
        soundFonts,
        storage,
        playbackPreferences: new PlaybackPreferencesStore(storage, soundFonts),
        settingsLayer: options.settingsLayer
    };
}

let defaultEnvironment: UiEnvironment | null = null;
function getDefaultEnvironment(): UiEnvironment {
    defaultEnvironment ??= createUiEnvironment();
    return defaultEnvironment;
}

const UiEnvironmentContext = createContext<UiEnvironment | null>(null);

/** The environment of the nearest {@link UiEnvironmentProvider}, or the defaults without one. */
export function useUiEnvironment(): UiEnvironment {
    return useContext(UiEnvironmentContext) ?? getDefaultEnvironment();
}

export interface UiEnvironmentProviderProps {
    /**
     * Overrides of the surrounding environment. A `settingsLayer` applies after the surrounding one.
     * Keep the object stable between renders where possible; a new `settingsLayer` function
     * re-applies to every living player.
     */
    value: Partial<UiEnvironment>;
    children?: ReactNode;
}

/** Provides the environment of the player and editor components below it. */
export function UiEnvironmentProvider({ value, children }: UiEnvironmentProviderProps) {
    const parent = useUiEnvironment();
    const merged = useMemo<UiEnvironment>(() => {
        const outer = parent.settingsLayer;
        const inner = value.settingsLayer;
        const settingsLayer =
            outer && inner && outer !== inner
                ? (settings: Settings) => {
                      outer(settings);
                      inner(settings);
                  }
                : (inner ?? outer);
        return { ...parent, ...value, settingsLayer };
    }, [parent, value]);
    return <UiEnvironmentContext.Provider value={merged}>{children}</UiEnvironmentContext.Provider>;
}

const noSubscription = () => () => {};
const emptyLibrary: SoundFontLibrarySnapshot = {};
const emptySnapshot = () => emptyLibrary;

/** The state of every SoundFont of the environment's provider; empty without one. */
export function useSoundFontLibrary(): SoundFontLibrarySnapshot {
    const { soundFonts } = useUiEnvironment();
    return useSyncExternalStore(
        soundFonts ? soundFonts.subscribe : noSubscription,
        soundFonts ? soundFonts.getSnapshot : emptySnapshot,
        soundFonts ? soundFonts.getServerSnapshot : emptySnapshot
    );
}

/** The environment's playback preferences. */
export function usePlaybackPreferences(): PlaybackPreferences {
    const { playbackPreferences } = useUiEnvironment();
    return useSyncExternalStore(
        playbackPreferences.subscribe,
        playbackPreferences.getSnapshot,
        playbackPreferences.getServerSnapshot
    );
}
