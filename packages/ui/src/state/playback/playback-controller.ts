import * as alphaTab from '@coderline/alphatab';
import type { AlphaTabApi, ICursorHandler, model, platform, rendering } from '@coderline/alphatab';
import { type DownloadProgress, fetchWithProgress } from './fetch-with-progress';
import type { PlaybackPreferencesStore } from './preferences';
import type { ScoreSource, SyncPointSource } from './score-source';
import type { SoundFontId } from './soundfont-entry';
import type { SoundFontProvider } from './soundfont-library';

export type PlaybackSourceKind = 'synthesizer' | 'backingTrack' | 'externalMedia';

export interface PlaybackPreparation {
    kind: 'soundFont' | 'backingTrack';
    loaded: number;
    total: number;
}

export interface PlaybackState {
    /** Source alphaTab currently plays with; `null` while no player exists. */
    effective: PlaybackSourceKind | null;
    /** Source the controller is moving to; differs from `effective` while preparing. */
    target: PlaybackSourceKind | null;
    /** The author fixed this instance's player mode; the source preference does not apply. */
    isFixed: boolean;
    hasBackingTrack: boolean;
    /** Whether an in-player source shortcut makes sense for this instance and file. */
    canSwitchSource: boolean;
    preparing: PlaybackPreparation | null;
    notice: string | null;
    isReadyForPlayback: boolean;
    /** SoundFont loaded into the current synthesizer, if any. */
    soundFontId: SoundFontId | null;
}

export interface PlaybackControllerOptions {
    /** The instance sets its own `player.playerMode`. */
    fixedSource: boolean;
    /** The instance loads its own SoundFont; implied without `soundFonts`. */
    ownSoundFont: boolean;
    /** Supplies the SoundFont the preferences select. */
    soundFonts: SoundFontProvider | null;
    /** The source and SoundFont preferences of the host. */
    preferences: PlaybackPreferencesStore;
}

export const initialPlaybackState: PlaybackState = {
    effective: null,
    target: null,
    isFixed: false,
    hasBackingTrack: false,
    canSwitchSource: false,
    preparing: null,
    notice: null,
    isReadyForPlayback: false,
    soundFontId: null,
};

/** How close a reported position must be to the restored one to count as the new player having arrived. */
const HOLD_TOLERANCE_TICKS = 3840;
/** Restored positions the new player never reports, e.g. after a failed load, release the hold after this. */
const HOLD_SETTLE_MS = 1000;
const HOLD_MAX_MS = 15000;

/**
 * Ignores alphaTab's placements, so the cursors stay at the held beat. A player switch recreates the
 * cursor elements; those are placed at `bounds` instead of appearing at the start of the song.
 */
class FrozenCursorHandler implements ICursorHandler {
    private barCursor: platform.IContainer | null = null;
    private beatCursor: platform.IContainer | null = null;

    constructor(private bounds: rendering.BeatBounds | null) {}

    moveTo(bounds: rendering.BeatBounds | null): void {
        this.bounds = bounds;
        this.place();
    }

    onAttach(cursors: platform.Cursors): void {
        this.barCursor = cursors.barCursor;
        this.beatCursor = cursors.beatCursor;
        this.place();
    }

    onDetach(): void {}
    placeBarCursor(): void {}
    placeBeatCursor(): void {}
    transitionBeatCursor(): void {}

    private place(): void {
        const bounds = this.bounds;
        if (!bounds) { return; }
        const bar = bounds.barBounds.masterBarBounds.visualBounds;
        this.barCursor?.setBounds(bar.x, bar.y, bar.w, bar.h);
        this.beatCursor?.transitionToX(0, bounds.onNotesX);
        this.beatCursor?.setBounds(bounds.onNotesX, bar.y, 1, bar.h);
    }
}

/** The position the UI keeps showing while a switch replaces the player. */
interface PositionHold {
    tick: number;
    /** The new player was sent to `tick`; the hold ends once it reports a position there. */
    restored: boolean;
    frozenCursor: FrozenCursorHandler;
    cursorHandler: ICursorHandler | undefined;
    timer: ReturnType<typeof setTimeout>;
}

// Session-scoped: backing-track audio is small and not worth persisting.
const audioCache = new Map<string, Promise<Uint8Array>>();
const syncPointCache = new Map<string, Promise<model.FlatSyncPoint[]>>();

function loadShared<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>): Promise<T> {
    let pending = cache.get(key);
    if (!pending) {
        pending = load();
        cache.set(key, pending);
        pending.catch(() => cache.delete(key));
    }
    return pending;
}

async function resolveSyncPoints(source: SyncPointSource): Promise<model.FlatSyncPoint[] | null> {
    switch (source.from) {
        case 'score':
            return null;
        case 'inline':
            return source.points;
        case 'url':
            return loadShared(syncPointCache, source.url, async () => {
                const response = await fetch(source.url);
                if (!response.ok) { throw new Error(`${source.url}: HTTP ${response.status}`); }
                return (await response.json()) as model.FlatSyncPoint[];
            });
    }
}

function hasSyncPoints(score: model.Score): boolean {
    return score.masterBars.some((mb) => (mb.syncPoints?.length ?? 0) > 0);
}

function errorMessage(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
}

/**
 * Owns the playback lifecycle of one `AlphaTabApi`: decides between
 * synthesizer and backing track from the file, the instance options and the
 * host's preferences, prepares only what that source needs, and applies it
 * with an explicit alphaTab `PlayerMode`. UI code reads `PlaybackState` and
 * never changes player modes directly.
 */
export class PlaybackController {
    private state: PlaybackState;
    private readonly listeners = new Set<() => void>();
    private readonly unsubscribers: (() => void)[] = [];

    private source: ScoreSource | null = null;
    private score: model.Score | null = null;
    private backingTrackFailed = false;
    /** False from a score load until its first source is applied. */
    private scorePrepared = false;
    private generation = 0;
    private destroyed = false;

    private fontId: SoundFontId | null = null;
    private fontBytes: Uint8Array | null = null;
    /** SoundFont loaded into the current player instance; reset on every player rebuild. */
    private loadedFontId: SoundFontId | null = null;
    /** Position to restore once the player is ready again after a switch, rebuild or SoundFont change. */
    private pendingTick: number | null = null;
    /** Playback was running when the pending switch started and resumes once the player is ready. */
    private resumeAfterReady = false;
    private restoreTimer: ReturnType<typeof setTimeout> | undefined;
    private hold: PositionHold | null = null;
    private playerSubscribed = false;
    private sourceOverride: PlaybackSourceKind | null = null;
    private readonly soundFonts: SoundFontProvider | null;
    private readonly preferences: PlaybackPreferencesStore;
    private readonly ownSoundFont: boolean;

    constructor(
        private readonly api: AlphaTabApi,
        private readonly options: PlaybackControllerOptions,
    ) {
        this.ownSoundFont = options.ownSoundFont || !options.soundFonts;
        this.soundFonts = this.ownSoundFont ? null : options.soundFonts;
        this.preferences = options.preferences;
        this.state = { ...initialPlaybackState, isFixed: options.fixedSource };
        this.ensurePlayerSubscription();
        this.unsubscribers.push(
            api.scoreLoaded.on(this.onScoreLoaded),
            // Fired right after alphaTab (re)creates a player for a score, so a player created outside this controller is noticed.
            api.midiLoad.on(() => this.ensurePlayerSubscription()),
            api.playerReady.on(this.onReadyForPlayback),
            this.preferences.subscribe(() => this.reconcile()),
        );
        if (this.soundFonts) {
            this.unsubscribers.push(this.soundFonts.subscribe(this.onLibraryChanged));
        }
        this.reconcile();
    }

    /**
     * The SoundFont an audio export should render with: the preferred one when this controller
     * supplies SoundFonts, otherwise `undefined` for the one loaded into the synthesizer.
     */
    async soundFontForExport(): Promise<Uint8Array | undefined> {
        return this.soundFonts ? this.soundFonts.load(this.preferences.getSnapshot().soundFontId) : undefined;
    }

    readonly subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    readonly getSnapshot = (): PlaybackState => this.state;

    /** Describes the score that is loaded next. `null` for scores without author configuration. */
    setSource(source: ScoreSource | null): void {
        this.source = source;
    }

    /**
     * Forces a source for this instance regardless of the site-wide preference; `null` returns to the
     * preference. Stays in effect across score loads. Ignored for instances with a fixed source.
     * `'backingTrack'` falls back to the synthesizer while the score has no backing track.
     */
    setSourceOverride(kind: PlaybackSourceKind | null): void {
        if (this.sourceOverride === kind) { return; }
        this.sourceOverride = kind;
        this.backingTrackFailed = false;
        this.patch({ notice: null });
        this.reconcile();
    }

    /**
     * Attaches user-provided audio as the backing track of the current score, replacing any existing
     * one. Sync points are left as they are; without any, alphaTab maps the audio 1:1 to the score tempo.
     */
    attachBackingTrack(audio: Uint8Array): void {
        const score = this.score;
        if (!score) { return; }
        const backingTrack = new alphaTab.model.BackingTrack();
        backingTrack.rawAudioFile = audio;
        score.backingTrack = backingTrack;
        this.backingTrackFailed = false;
        this.patch({ notice: null });
        if (this.api.actualPlayerMode === alphaTab.PlayerMode.EnabledBackingTrack) {
            this.api.loadMidiForScore();
        }
        this.reconcile();
    }

    /** Destroys and recreates the player in its current mode, keeping the position and resuming playback. */
    rebuildPlayer(): void {
        const { PlayerMode } = alphaTab;
        const mode = this.api.actualPlayerMode;
        if (mode === PlayerMode.Disabled) { return; }
        this.holdPosition();
        this.api.pause();
        this.api.settings.player.playerMode = PlayerMode.Disabled;
        this.api.updateSettings();
        this.api.settings.player.playerMode = mode;
        this.loadedFontId = null;
        this.api.updateSettings();
        this.ensurePlayerSubscription();
        this.refresh();
    }

    /**
     * Applies a seek requested while a switch is pending to the position restored afterwards.
     * Returns `false` when no switch is pending and the caller seeks the player itself.
     */
    seekWhileSwitching(tick: number): boolean {
        if (this.pendingTick === null) {
            this.releaseHold();
            return false;
        }
        this.pendingTick = tick;
        if (this.hold) {
            this.hold.tick = tick;
            this.hold.frozenCursor.moveTo(this.beatBoundsAt(tick));
        }
        return true;
    }

    /** Drops a pending resume, e.g. because the user paused during a switch. Returns whether one was pending. */
    cancelResume(): boolean {
        const pending = this.resumeAfterReady;
        this.resumeAfterReady = false;
        return pending;
    }

    /** Playback stopped for a switch and restarts once the new player is ready. */
    get isResumePending(): boolean {
        return this.resumeAfterReady;
    }

    /**
     * Whether a reported position should reach the UI. While a switch replaces the player, the new
     * instance reports interim positions (the song start, mostly) before the held one is restored;
     * those are dropped. The first position near the restored one ends the hold.
     */
    acceptPosition(tick: number): boolean {
        const hold = this.hold;
        if (!hold) { return true; }
        if (!hold.restored || Math.abs(tick - hold.tick) > HOLD_TOLERANCE_TICKS) { return false; }
        this.releaseHold();
        return true;
    }

    /** Clears a backing-track failure and tries the preferred source again. */
    retry(): void {
        this.backingTrackFailed = false;
        this.patch({ notice: null });
        this.reconcile();
    }

    destroy(): void {
        this.destroyed = true;
        this.generation++;
        clearTimeout(this.restoreTimer);
        this.releaseHold();
        for (const unsubscribe of this.unsubscribers) { unsubscribe(); }
        this.listeners.clear();
    }

    /**
     * `api.player` stays `null` until alphaTab created the first player instance. The wrapper it
     * returns is stable afterwards and re-fires `ready` for every rebuilt instance.
     */
    private ensurePlayerSubscription(): void {
        if (this.playerSubscribed || !this.api.player) { return; }
        this.playerSubscribed = true;
        this.unsubscribers.push(this.api.player.ready.on(this.onPlayerInstanceReady));
    }

    private readonly onScoreLoaded = (score: model.Score): void => {
        this.score = score;
        this.backingTrackFailed = false;
        this.scorePrepared = false;
        this.pendingTick = null;
        this.resumeAfterReady = false;
        clearTimeout(this.restoreTimer);
        this.releaseHold();
        this.patch({ notice: null });
        // alphaTab sets up the player right after this event, from the current
        // settings, so choosing the mode here avoids a throwaway player.
        if (!this.options.fixedSource) {
            this.api.settings.player.playerMode = this.initialModeFor(score);
        }
        this.reconcile();
    };

    private readonly onPlayerInstanceReady = (): void => {
        this.loadedFontId = null;
        if (this.options.fixedSource) {
            this.reconcile();
        } else {
            this.feedSoundFont();
            this.refresh();
        }
    };

    private readonly onReadyForPlayback = (): void => {
        this.refresh();
        if (this.pendingTick === null && !this.resumeAfterReady) { return; }
        // alphaTab reports ready from within its MIDI load and only then attaches the backing-track
        // audio and sync points, which resets the position and interrupts a play() made right now.
        clearTimeout(this.restoreTimer);
        this.restoreTimer = setTimeout(this.restorePosition, 0);
    };

    private readonly restorePosition = (): void => {
        if (this.destroyed || !this.api.isReadyForPlayback) { return; }
        if (this.pendingTick !== null) {
            if (this.hold) {
                this.hold.restored = true;
                this.holdFor(HOLD_SETTLE_MS);
            }
            this.api.tickPosition = this.pendingTick;
            this.pendingTick = null;
        }
        if (this.resumeAfterReady) {
            this.resumeAfterReady = false;
            this.api.play();
        }
        this.refresh();
    };

    /**
     * Remembers the position, and whether playback runs, before the player is replaced. Ticks rather
     * than milliseconds, because sync points map the same tick to different times per source. While a
     * restore is already pending the current player has not reached that position yet, so it is kept.
     */
    private holdPosition(): void {
        if (this.pendingTick !== null) { return; }
        this.pendingTick = this.api.tickPosition;
        this.resumeAfterReady = this.isPlaying();
        const bounds = this.beatBoundsAt(this.pendingTick);
        if (this.hold) {
            this.hold.tick = this.pendingTick;
            this.hold.restored = false;
            this.hold.frozenCursor.moveTo(bounds);
        } else {
            const frozenCursor = new FrozenCursorHandler(bounds);
            this.hold = {
                tick: this.pendingTick,
                restored: false,
                frozenCursor,
                cursorHandler: this.api.customCursorHandler,
                timer: undefined!,
            };
            this.api.customCursorHandler = frozenCursor;
        }
        this.holdFor(HOLD_MAX_MS);
    }

    private beatBoundsAt(tick: number): rendering.BeatBounds | null {
        const beat = this.api.tickCache?.findBeat(new Set(this.api.tracks.map((t) => t.index)), tick)?.beat;
        return (beat && this.api.boundsLookup?.findBeat(beat)) || null;
    }

    private holdFor(ms: number): void {
        const hold = this.hold!;
        clearTimeout(hold.timer);
        hold.timer = setTimeout(() => this.releaseHold(), ms);
    }

    private releaseHold(): void {
        const hold = this.hold;
        if (!hold) { return; }
        this.hold = null;
        clearTimeout(hold.timer);
        // alphaTab draws cursor updates in the next animation frame and reads the handler only then,
        // so the update for the position that ended the hold is drawn with the real handler.
        this.api.customCursorHandler = hold.cursorHandler;
    }

    private isPlaying(): boolean {
        return this.api.playerState === alphaTab.synth.PlayerState.Playing;
    }

    private readonly onLibraryChanged = (): void => {
        if (this.state.preparing?.kind !== 'soundFont') { return; }
        const progress = this.soundFonts?.getSnapshot()[this.preferences.getSnapshot().soundFontId];
        if (progress) {
            this.patch({ preparing: { kind: 'soundFont', loaded: progress.loaded, total: progress.total } });
        }
    };

    private hasBackingTrack(): boolean {
        return !!this.source?.backingTrack || !!this.score?.backingTrack?.rawAudioFile;
    }

    private resolveTarget(): PlaybackSourceKind | null {
        if (this.options.fixedSource) { return this.effectiveSource(); }
        if (!this.score) { return null; }
        if (this.sourceOverride === 'externalMedia' || this.sourceOverride === 'synthesizer') {
            return this.sourceOverride;
        }
        if (this.sourceOverride === 'backingTrack') {
            return this.hasBackingTrack() && !this.backingTrackFailed ? 'backingTrack' : 'synthesizer';
        }
        const preference = this.preferences.getSnapshot().source;
        if (preference === 'synthesizer' || !this.hasBackingTrack() || this.backingTrackFailed) {
            return 'synthesizer';
        }
        return 'backingTrack';
    }

    private effectiveSource(): PlaybackSourceKind | null {
        const { PlayerMode } = alphaTab;
        switch (this.api.actualPlayerMode) {
            case PlayerMode.EnabledSynthesizer:
                return 'synthesizer';
            case PlayerMode.EnabledBackingTrack:
                return 'backingTrack';
            case PlayerMode.EnabledExternalMedia:
                return 'externalMedia';
            default:
                return null;
        }
    }

    /** Mode for a freshly loaded score: playable right away if possible, otherwise no player until prepared. */
    private initialModeFor(score: model.Score): number {
        const { PlayerMode } = alphaTab;
        const target = this.resolveTarget();
        if (target === 'externalMedia') {
            return PlayerMode.EnabledExternalMedia;
        }
        if (target === 'backingTrack' && score.backingTrack?.rawAudioFile) {
            return PlayerMode.EnabledBackingTrack;
        }
        const synthReady =
            this.ownSoundFont ||
            (this.fontBytes !== null && this.fontId === this.preferences.getSnapshot().soundFontId);
        if (target === 'synthesizer' && synthReady) {
            return PlayerMode.EnabledSynthesizer;
        }
        // An existing synthesizer can keep playing the new score while its real source is prepared;
        // a backing-track player without this score's audio cannot.
        return this.api.actualPlayerMode === PlayerMode.EnabledSynthesizer
            ? PlayerMode.EnabledSynthesizer
            : PlayerMode.Disabled;
    }

    private reconcile(): void {
        if (this.destroyed) { return; }
        const generation = ++this.generation;
        const target = this.resolveTarget();
        this.patch({ target });
        if (target === 'synthesizer') {
            void this.applySynthesizer(generation);
        } else if (target === 'backingTrack') {
            void this.applyBackingTrack(generation);
        } else if (target === 'externalMedia') {
            this.applyExternalMedia();
        } else {
            this.patch({ preparing: null });
            this.refresh();
        }
    }

    private async applySynthesizer(generation: number): Promise<void> {
        const soundFonts = this.soundFonts;
        if (soundFonts) {
            const id = this.preferences.getSnapshot().soundFontId;
            if (this.fontId !== id || !this.fontBytes) {
                if (!soundFonts.isInMemory(id)) {
                    const progress = soundFonts.getSnapshot()[id];
                    this.patch({
                        preparing: { kind: 'soundFont', loaded: progress?.loaded ?? 0, total: progress?.total ?? 0 },
                    });
                }
                let bytes: Uint8Array;
                try {
                    bytes = await soundFonts.load(id);
                } catch (e) {
                    if (generation !== this.generation) { return; }
                    this.patch({ preparing: null, notice: `SoundFont could not be loaded: ${errorMessage(e)}` });
                    return;
                }
                if (generation !== this.generation) { return; }
                this.fontId = id;
                this.fontBytes = bytes;
            }
        }
        this.patch({ preparing: null });
        if (!this.options.fixedSource) {
            this.switchMode('synthesizer');
        }
        this.feedSoundFont();
        this.scorePrepared = true;
        this.refresh();
    }

    private async applyBackingTrack(generation: number): Promise<void> {
        const score = this.score!;
        let attachedNow = false;
        if (!score.backingTrack?.rawAudioFile) {
            try {
                await this.attachExternalBackingTrack(score);
                attachedNow = true;
            } catch (e) {
                if (score !== this.score) { return; }
                this.backingTrackFailed = true;
                this.patch({
                    preparing: null,
                    notice: `Backing track unavailable (${errorMessage(e)}), playing the synthesizer.`,
                });
                this.reconcile();
                return;
            }
        }
        if (generation !== this.generation) { return; }
        this.patch({ preparing: null });
        // A new player picks up audio and sync points via alphaTab's own loadMidiForScore on ready.
        if (!this.switchMode('backingTrack') && attachedNow) {
            this.api.loadMidiForScore();
        }
        this.scorePrepared = true;
        this.refresh();
    }

    private applyExternalMedia(): void {
        this.patch({ preparing: null });
        if (!this.options.fixedSource) {
            this.switchMode('externalMedia');
        }
        this.scorePrepared = true;
        this.refresh();
    }

    /** Fetches audio and sync points, applies the sync points, then attaches the audio. */
    private async attachExternalBackingTrack(score: model.Score): Promise<void> {
        const backingTrack = this.source?.backingTrack;
        if (backingTrack?.kind !== 'external') {
            throw new Error('the file contains no backing-track audio');
        }
        this.patch({ preparing: { kind: 'backingTrack', loaded: 0, total: 0 } });
        const onProgress = ({ loaded, total }: DownloadProgress) => {
            if (this.state.preparing?.kind === 'backingTrack') {
                this.patch({ preparing: { kind: 'backingTrack', loaded, total } });
            }
        };
        const [audio, syncPoints] = await Promise.all([
            loadShared(audioCache, backingTrack.audioUrl, () => fetchWithProgress(backingTrack.audioUrl, onProgress)),
            resolveSyncPoints(backingTrack.syncPoints),
        ]);
        if (score !== this.score) { throw new Error('score changed'); }

        if (syncPoints) {
            score.applyFlatSyncPoints(syncPoints);
        } else if (!hasSyncPoints(score)) {
            throw new Error('the score has no sync points');
        }
        const attached = new alphaTab.model.BackingTrack();
        attached.rawAudioFile = audio;
        score.backingTrack = attached;
    }

    /** Switches alphaTab to the given source, keeping the position. Returns whether a new player was requested. */
    private switchMode(kind: PlaybackSourceKind): boolean {
        const { PlayerMode } = alphaTab;
        const mode =
            kind === 'synthesizer' ? PlayerMode.EnabledSynthesizer :
            kind === 'backingTrack' ? PlayerMode.EnabledBackingTrack :
                                      PlayerMode.EnabledExternalMedia;
        if (this.api.actualPlayerMode === mode) {
            this.api.settings.player.playerMode = mode;
            return false;
        }
        if (this.scorePrepared && this.api.actualPlayerMode !== PlayerMode.Disabled) {
            this.holdPosition();
            this.api.pause();
        }
        this.api.settings.player.playerMode = mode;
        this.loadedFontId = null;
        this.api.updateSettings();
        this.ensurePlayerSubscription();
        return true;
    }

    private feedSoundFont(): void {
        if (this.ownSoundFont || !this.fontBytes || this.loadedFontId === this.fontId) { return; }
        if (this.api.actualPlayerMode !== alphaTab.PlayerMode.EnabledSynthesizer) { return; }
        if (!this.api.player?.isReady) { return; }
        // The synthesizer pauses itself to swap SoundFonts and reports ready again once the presets are loaded.
        this.resumeAfterReady ||= this.isPlaying();
        this.api.loadSoundFont(this.fontBytes, false);
        this.loadedFontId = this.fontId;
        this.patch({ soundFontId: this.fontId });
    }

    private refresh(): void {
        const hasBackingTrack = this.hasBackingTrack();
        this.patch({
            effective: this.effectiveSource(),
            hasBackingTrack,
            canSwitchSource: hasBackingTrack && !this.options.fixedSource && this.sourceOverride === null,
            isReadyForPlayback:
                this.api.isReadyForPlayback && (this.options.fixedSource || this.scorePrepared),
        });
    }

    private patch(partial: Partial<PlaybackState>): void {
        if (this.destroyed) { return; }
        let changed = false;
        for (const key of Object.keys(partial) as (keyof PlaybackState)[]) {
            if (this.state[key] !== partial[key]) {
                changed = true;
                break;
            }
        }
        if (!changed) { return; }
        this.state = { ...this.state, ...partial };
        for (const listener of this.listeners) { listener(); }
    }
}
