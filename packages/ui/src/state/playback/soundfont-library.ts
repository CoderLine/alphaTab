import { fetchWithProgress } from './fetch-with-progress';
import type { SoundFontEntry, SoundFontId } from './soundfont-entry';

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

/**
 * Supplies SoundFont bytes to the players of a host and reports the state of each SoundFont.
 * `subscribe`, `getSnapshot` and `getServerSnapshot` follow the `useSyncExternalStore` contract and
 * are called without `this`.
 */
export interface SoundFontProvider {
    /** The SoundFonts users can pick from, in display order; never empty. */
    readonly entries: readonly SoundFontEntry[];
    /** The entry of `id`, or the default entry for unknown ids. */
    find(id: SoundFontId | null | undefined): SoundFontEntry;
    /** Resolves to the bytes of the SoundFont; rejects when it cannot be obtained. */
    load(id: SoundFontId): Promise<Uint8Array>;
    /** Whether `load(id)` resolves without cache or network access. */
    isInMemory(id: SoundFontId): boolean;
    /** Removes every persisted SoundFont. Bytes already handed out stay valid. */
    clearStored(): Promise<void>;
    subscribe(listener: () => void): () => void;
    getSnapshot(): SoundFontLibrarySnapshot;
    getServerSnapshot(): SoundFontLibrarySnapshot;
}

export interface SoundFontLibraryOptions {
    /** The SoundFonts of the host; the first one is the default unless `defaultId` names another. */
    entries: readonly SoundFontEntry[];
    defaultId?: SoundFontId;
    /** Name of the Cache Storage cache the downloads persist in; `null` keeps them in memory only. */
    cacheName?: string | null;
}

function absoluteUrl(url: string): string {
    return new URL(url, window.location.href).href;
}

function initialSnapshot(entries: readonly SoundFontEntry[]): SoundFontLibrarySnapshot {
    const snapshot: Record<SoundFontId, SoundFontState> = {};
    for (const entry of entries) {
        snapshot[entry.id] = { status: 'available', loaded: 0, total: entry.sizeBytes };
    }
    return snapshot;
}

/**
 * The default {@link SoundFontProvider}: downloads SoundFonts on demand and persists them in Cache
 * Storage. Bytes stay in memory for the most recently loaded SoundFont only; anything else is
 * re-read from the cache on demand.
 */
export class SoundFontLibrary implements SoundFontProvider {
    readonly entries: readonly SoundFontEntry[];
    private readonly defaultEntry: SoundFontEntry;
    private readonly cacheName: string | null;
    private readonly serverSnapshot: SoundFontLibrarySnapshot;
    private snapshot: SoundFontLibrarySnapshot;
    private readonly listeners = new Set<() => void>();
    private readonly inMemory = new Map<SoundFontId, Promise<Uint8Array>>();
    private readonly resolved = new Set<SoundFontId>();
    private probed = false;

    constructor(options: SoundFontLibraryOptions) {
        if (options.entries.length === 0) {
            throw new Error('A SoundFont library needs at least one entry');
        }
        this.entries = options.entries;
        this.defaultEntry = options.entries.find(e => e.id === options.defaultId) ?? options.entries[0];
        this.cacheName = options.cacheName === undefined ? 'alphatab-soundfonts-v1' : options.cacheName;
        this.serverSnapshot = initialSnapshot(options.entries);
        this.snapshot = this.serverSnapshot;
    }

    find(id: SoundFontId | null | undefined): SoundFontEntry {
        return this.entries.find(e => e.id === id) ?? this.defaultEntry;
    }

    readonly subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        this.probe();
        return () => {
            this.listeners.delete(listener);
        };
    };

    readonly getSnapshot = (): SoundFontLibrarySnapshot => this.snapshot;
    readonly getServerSnapshot = (): SoundFontLibrarySnapshot => this.serverSnapshot;

    /** Bytes of the SoundFont, from memory, the persistent cache, or the network (in that order). */
    load(id: SoundFontId): Promise<Uint8Array> {
        const entry = this.find(id);
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
        return this.resolved.has(this.find(id).id);
    }

    /** Removes every persisted SoundFont. Bytes already handed to players are unaffected. */
    async clearStored(): Promise<void> {
        if (this.cacheName !== null && typeof caches !== 'undefined') {
            try {
                await caches.delete(this.cacheName);
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
        const cache = await this.openCache();
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
        if (this.probed || typeof window === 'undefined') { return; }
        this.probed = true;
        void (async () => {
            const cache = await this.openCache();
            if (!cache) { return; }
            try {
                const registered = new Map(this.entries.map((s) => [absoluteUrl(s.url), s]));
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

    private async openCache(): Promise<Cache | null> {
        if (this.cacheName === null || typeof caches === 'undefined') {
            return null;
        }
        try {
            return await caches.open(this.cacheName);
        } catch {
            return null;
        }
    }

    private setState(id: SoundFontId, state: SoundFontState): void {
        this.snapshot = { ...this.snapshot, [id]: state };
        this.emit();
    }

    private emit(): void {
        for (const listener of this.listeners) { listener(); }
    }
}
