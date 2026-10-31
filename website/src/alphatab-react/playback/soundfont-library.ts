import { useSyncExternalStore } from 'react';
import { fetchWithProgress } from './fetch-with-progress';
import { SOUNDFONTS, findSoundFont, type SoundFontEntry, type SoundFontId } from './soundfont-registry';

/**
 * - `available`: not downloaded on this device
 * - `downloading`: transfer in progress (see `loaded` / `total`)
 * - `stored`: in the persistent SoundFont cache
 * - `sessionOnly`: downloaded, but could not be persisted (no Cache Storage, quota)
 * - `error`: the last download failed
 */
export type SoundFontStatus = 'available' | 'downloading' | 'stored' | 'sessionOnly' | 'error';

export interface SoundFontState {
    status: SoundFontStatus;
    loaded: number;
    total: number;
    error?: string;
}

export type SoundFontLibrarySnapshot = Readonly<Record<SoundFontId, SoundFontState>>;

const CACHE_NAME = 'alphatab-soundfonts-v1';

function absoluteUrl(url: string): string {
    return new URL(url, window.location.href).href;
}

async function openCache(): Promise<Cache | null> {
    if (typeof caches === 'undefined') return null;
    try {
        return await caches.open(CACHE_NAME);
    } catch {
        return null;
    }
}

function initialSnapshot(): SoundFontLibrarySnapshot {
    const snapshot: Record<SoundFontId, SoundFontState> = {};
    for (const entry of SOUNDFONTS) {
        snapshot[entry.id] = { status: 'available', loaded: 0, total: entry.sizeBytes };
    }
    return snapshot;
}

const serverSnapshot = initialSnapshot();

/**
 * Site-wide owner of SoundFont downloads and their persistence. Knows nothing
 * about players: it hands out bytes and reports per-SoundFont status.
 *
 * Bytes stay in memory for the most recently loaded SoundFont only; anything
 * else is re-read from Cache Storage on demand.
 */
class SoundFontLibrary {
    private snapshot: SoundFontLibrarySnapshot = initialSnapshot();
    private readonly listeners = new Set<() => void>();
    private readonly inMemory = new Map<SoundFontId, Promise<Uint8Array>>();
    private readonly resolved = new Set<SoundFontId>();
    private probed = false;

    readonly subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        this.probe();
        return () => {
            this.listeners.delete(listener);
        };
    };

    readonly getSnapshot = (): SoundFontLibrarySnapshot => this.snapshot;
    readonly getServerSnapshot = (): SoundFontLibrarySnapshot => serverSnapshot;

    /** Bytes of the SoundFont, from memory, the persistent cache, or the network (in that order). */
    load(id: SoundFontId): Promise<Uint8Array> {
        const entry = findSoundFont(id);
        let pending = this.inMemory.get(entry.id);
        if (!pending) {
            pending = this.loadUncached(entry);
            this.inMemory.set(entry.id, pending);
            pending.then(
                () => {
                    this.resolved.add(entry.id);
                    this.keepOnlyInMemory(entry.id);
                },
                () => this.inMemory.delete(entry.id),
            );
        }
        return pending;
    }

    /** Whether the bytes are already held in memory, so `load(id)` needs no cache or network access. */
    isInMemory(id: SoundFontId): boolean {
        return this.resolved.has(findSoundFont(id).id);
    }

    /** Removes every persisted SoundFont. Bytes already handed to players are unaffected. */
    async clearStored(): Promise<void> {
        if (typeof caches !== 'undefined') {
            try {
                await caches.delete(CACHE_NAME);
            } catch {
                // Nothing persisted that we could remove.
            }
        }
        const next: Record<SoundFontId, SoundFontState> = {};
        for (const [id, state] of Object.entries(this.snapshot)) {
            next[id] =
                state.status === 'stored'
                    ? { ...state, status: this.inMemory.has(id) ? 'sessionOnly' : 'available' }
                    : state;
        }
        this.snapshot = next;
        this.emit();
    }

    private async loadUncached(entry: SoundFontEntry): Promise<Uint8Array> {
        const cache = await openCache();
        const key = absoluteUrl(entry.url);
        if (cache) {
            try {
                const hit = await cache.match(key);
                if (hit) {
                    const bytes = new Uint8Array(await hit.arrayBuffer());
                    this.setState(entry.id, { status: 'stored', loaded: bytes.length, total: bytes.length });
                    return bytes;
                }
            } catch {
                // Treat an unreadable entry as a miss.
            }
        }

        let bytes: Uint8Array;
        try {
            bytes = await fetchWithProgress(
                entry.url,
                ({ loaded, total }) => this.setState(entry.id, { status: 'downloading', loaded, total }),
                entry.sizeBytes,
            );
        } catch (e) {
            this.setState(entry.id, {
                status: 'error',
                loaded: 0,
                total: entry.sizeBytes,
                error: (e as Error).message,
            });
            throw e;
        }

        const persisted = cache ? await this.persist(cache, key, bytes) : false;
        this.setState(entry.id, {
            status: persisted ? 'stored' : 'sessionOnly',
            loaded: bytes.length,
            total: bytes.length,
        });
        return bytes;
    }

    private async persist(cache: Cache, key: string, bytes: Uint8Array): Promise<boolean> {
        try {
            const estimate = await navigator.storage?.estimate?.();
            if (estimate?.quota !== undefined && estimate.usage !== undefined
                && estimate.quota - estimate.usage < bytes.length) {
                return false;
            }
            await cache.put(
                key,
                new Response(bytes as BufferSource, {
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Content-Length': String(bytes.length),
                    },
                }),
            );
            return true;
        } catch {
            return false;
        }
    }

    private keepOnlyInMemory(id: SoundFontId): void {
        for (const key of [...this.inMemory.keys()]) {
            if (key !== id) {
                this.inMemory.delete(key);
                this.resolved.delete(key);
            }
        }
    }

    /** First client subscription: mark persisted SoundFonts and prune entries no longer registered. */
    private probe(): void {
        if (this.probed || typeof window === 'undefined') return;
        this.probed = true;
        void (async () => {
            const cache = await openCache();
            if (!cache) return;
            try {
                const registered = new Map(SOUNDFONTS.map((s) => [absoluteUrl(s.url), s]));
                for (const request of await cache.keys()) {
                    const entry = registered.get(request.url);
                    if (!entry) {
                        await cache.delete(request);
                    } else if (this.snapshot[entry.id].status === 'available') {
                        this.setState(entry.id, { status: 'stored', loaded: entry.sizeBytes, total: entry.sizeBytes });
                    }
                }
            } catch {
                // Status stays "available"; the next load will tell.
            }
        })();
    }

    private setState(id: SoundFontId, state: SoundFontState): void {
        this.snapshot = { ...this.snapshot, [id]: state };
        this.emit();
    }

    private emit(): void {
        for (const listener of this.listeners) listener();
    }
}

export const soundFontLibrary = new SoundFontLibrary();

export function useSoundFontLibrary(): SoundFontLibrarySnapshot {
    return useSyncExternalStore(
        soundFontLibrary.subscribe,
        soundFontLibrary.getSnapshot,
        soundFontLibrary.getServerSnapshot,
    );
}
