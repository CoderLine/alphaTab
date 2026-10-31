import type { SoundFontId } from './soundfont-entry';
import type { SoundFontProvider } from './soundfont-library';

/**
 * Where a host keeps the user's UI preferences. Values are strings, typically JSON.
 * Implementations must not throw from `getItem` or `setItem`.
 */
export interface PreferencesStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    /** Calls `listener` when `key` changes outside this page, e.g. in another tab. */
    subscribe?(key: string, listener: () => void): () => void;
}

/** The default {@link PreferencesStorage}: `localStorage`, shared and synchronized across tabs. */
export const localStoragePreferences: PreferencesStorage = {
    getItem(key) {
        try {
            return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch {
            // Storage full or blocked; the value still applies for this visit.
        }
    },
    subscribe(key, listener) {
        if (typeof window === 'undefined') {
            return () => {};
        }
        const onStorage = (e: StorageEvent) => {
            if (e.key === key) {
                listener();
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }
};

/** A {@link PreferencesStorage} that forgets everything with the page. */
export function createMemoryPreferences(): PreferencesStorage {
    const values = new Map<string, string>();
    return {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => {
            values.set(key, value);
        }
    };
}

export type PlaybackSourcePreference = 'backingTrackWhenAvailable' | 'synthesizer';

export interface PlaybackPreferences {
    source: PlaybackSourcePreference;
    soundFontId: SoundFontId;
}

const STORAGE_KEY = 'alphatab.playback-preferences.v1';

/**
 * The playback preferences of a host: the single copy every player, settings menu and in-player
 * shortcut reads and writes. Persisted in a {@link PreferencesStorage}. `subscribe`, `getSnapshot`
 * and `getServerSnapshot` follow the `useSyncExternalStore` contract.
 */
export class PlaybackPreferencesStore {
    private readonly defaults: PlaybackPreferences;
    private snapshot: PlaybackPreferences;
    private readonly listeners = new Set<() => void>();

    /** `soundFonts` validates stored SoundFont ids; without one, ids are kept as stored. */
    constructor(
        private readonly storage: PreferencesStorage,
        private readonly soundFonts: SoundFontProvider | null
    ) {
        this.defaults = { source: 'backingTrackWhenAvailable', soundFontId: soundFonts?.find(null).id ?? '' };
        this.snapshot = this.defaults;
        if (typeof window === 'undefined') {
            return;
        }
        this.snapshot = this.read();
        storage.subscribe?.(STORAGE_KEY, () => this.replace(this.read(), false));
    }

    readonly subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    readonly getSnapshot = (): PlaybackPreferences => this.snapshot;
    readonly getServerSnapshot = (): PlaybackPreferences => this.defaults;

    setSource(source: PlaybackSourcePreference): void {
        this.replace({ ...this.snapshot, source }, true);
    }

    setSoundFont(soundFontId: SoundFontId): void {
        this.replace({ ...this.snapshot, soundFontId: this.resolveSoundFont(soundFontId) }, true);
    }

    private resolveSoundFont(id: unknown): SoundFontId {
        if (this.soundFonts) {
            return this.soundFonts.find(typeof id === 'string' ? id : null).id;
        }
        return typeof id === 'string' ? id : this.defaults.soundFontId;
    }

    private read(): PlaybackPreferences {
        const raw = this.storage.getItem(STORAGE_KEY);
        if (!raw) {
            return this.defaults;
        }
        try {
            const value = (JSON.parse(raw) ?? {}) as Partial<PlaybackPreferences>;
            return {
                source: value.source === 'synthesizer' ? 'synthesizer' : 'backingTrackWhenAvailable',
                soundFontId: this.resolveSoundFont(value.soundFontId)
            };
        } catch {
            return this.defaults;
        }
    }

    private replace(next: PlaybackPreferences, persist: boolean): void {
        if (next.source === this.snapshot.source && next.soundFontId === this.snapshot.soundFontId) {
            return;
        }
        this.snapshot = next;
        if (persist) {
            this.storage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        for (const listener of this.listeners) {
            listener();
        }
    }
}
