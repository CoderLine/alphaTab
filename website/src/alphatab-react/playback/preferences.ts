import { useSyncExternalStore } from 'react';
import { DEFAULT_SOUNDFONT_ID, findSoundFont, type SoundFontId } from './soundfont-registry';

export type PlaybackSourcePreference = 'backingTrackWhenAvailable' | 'synthesizer';

export interface PlaybackPreferences {
    source: PlaybackSourcePreference;
    soundFontId: SoundFontId;
}

const STORAGE_KEY = 'alphatab.playback-preferences.v1';

const DEFAULTS: PlaybackPreferences = {
    source: 'backingTrackWhenAvailable',
    soundFontId: DEFAULT_SOUNDFONT_ID,
};

function sanitize(raw: unknown): PlaybackPreferences {
    const value = (raw ?? {}) as Partial<PlaybackPreferences>;
    return {
        source: value.source === 'synthesizer' ? 'synthesizer' : 'backingTrackWhenAvailable',
        soundFontId: findSoundFont(value.soundFontId).id,
    };
}

function readStored(): PlaybackPreferences {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? sanitize(JSON.parse(raw)) : DEFAULTS;
    } catch {
        return DEFAULTS;
    }
}

/**
 * The site-wide playback preferences: the single copy every player, the
 * navbar menu and in-player shortcuts read and write. Persisted in
 * localStorage and kept in sync across tabs.
 */
class PlaybackPreferencesStore {
    private snapshot: PlaybackPreferences = DEFAULTS;
    private readonly listeners = new Set<() => void>();

    constructor() {
        if (typeof window === 'undefined') return;
        this.snapshot = readStored();
        window.addEventListener('storage', (e) => {
            if (e.key !== STORAGE_KEY) return;
            this.replace(readStored(), false);
        });
    }

    readonly subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    readonly getSnapshot = (): PlaybackPreferences => this.snapshot;
    readonly getServerSnapshot = (): PlaybackPreferences => DEFAULTS;

    setSource(source: PlaybackSourcePreference): void {
        this.replace({ ...this.snapshot, source }, true);
    }

    setSoundFont(soundFontId: SoundFontId): void {
        this.replace({ ...this.snapshot, soundFontId: findSoundFont(soundFontId).id }, true);
    }

    private replace(next: PlaybackPreferences, persist: boolean): void {
        if (next.source === this.snapshot.source && next.soundFontId === this.snapshot.soundFontId) return;
        this.snapshot = next;
        if (persist) {
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
                // Preference still applies for this session.
            }
        }
        for (const listener of this.listeners) listener();
    }
}

export const playbackPreferences = new PlaybackPreferencesStore();

export function usePlaybackPreferences(): PlaybackPreferences {
    return useSyncExternalStore(
        playbackPreferences.subscribe,
        playbackPreferences.getSnapshot,
        playbackPreferences.getServerSnapshot,
    );
}
