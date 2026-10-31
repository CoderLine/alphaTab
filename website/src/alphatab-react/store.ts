import type { AlphaTabApi, importer, model, Settings } from '@coderline/alphatab';
import type { ColorMode } from '@docusaurus/theme-common';
import type { AlphaTabModule } from './module';
import { applyAlphaTabSettings, applyPlayerDefaults, applyTheme, type AlphaTabPreset } from './settings';
import {
    PlaybackController,
    initialPlaybackState,
    type PlaybackControllerOptions,
    type PlaybackSourceKind,
    type PlaybackState,
} from './playback/playback-controller';
import type { BackingTrackSource, ScoreSource } from './playback/score-source';
import { bindExternalMedia, type MediaElementLike } from './external-media';

export interface TempoMarker {
    atBar: number;
    bpm: number;
}

export interface LoopRangeBars {
    from: number;
    to: number;
}

export type StaveProfileKey = 'scoreTab' | 'score' | 'tab';
export type LayoutModeKey = 'page' | 'scroll';

/** The player settings exposed by the quick-settings UI; mirrors what the store last applied. */
export interface PlayerViewSettings {
    layoutMode: LayoutModeKey;
    staveProfile: StaveProfileKey;
    /** Render scale, 1 = 100%. */
    scale: number;
    /** 0..1 */
    masterVolume: number;
    /** 1 = original tempo. */
    playbackSpeed: number;
    /** Semitones added to every track's audio, on top of its own `TrackMix.transpose`. */
    transpose: number;
    countIn: boolean;
    metronome: boolean;
    highlight: boolean;
    looping: boolean;
}

/** Per-track mixer state of the loaded score; reset on every score load. */
export interface TrackMix {
    mute: boolean;
    solo: boolean;
    /** Factor on the volume defined in the file, 1 = as authored. */
    volume: number;
    /** Audio-only transposition in semitones. */
    transpose: number;
    /** Transposition of the rendered notation (and its generated audio) in semitones. */
    notationTranspose: number;
    /** Transposition of the standard notation only, e.g. for transposing instruments; playback is unaffected. */
    displayTranspose: number;
}

export const defaultTrackMix: TrackMix = { mute: false, solo: false, volume: 1, transpose: 0, notationTranspose: 0, displayTranspose: 0 };

export interface LoadSourceOptions {
    /** Track indexes to render; `'all'` renders every track. Defaults to the first track; invalid indexes are dropped. */
    tracks?: number[] | 'all';
}

export interface LoadTexOptions extends LoadSourceOptions {
    /** Backing track the alphaTex belongs to, see `ScoreSource.backingTrack`. */
    backingTrack?: BackingTrackSource;
}

export interface AlphaTabState {
    isReady: boolean;
    isPlaying: boolean;
    isRendering: boolean;
    isSoundFontLoaded: boolean;
    soundFontLoadProgress: number;
    currentScore: model.Score | null;
    tracks: model.Track[];
    renderedTracks: model.Track[];
    currentTime: number;
    endTime: number;

    barStartTicks: number[];
    totalBars: number;
    currentBar: number;
    tempoMarkers: TempoMarker[];
    loopRangeBars: LoopRangeBars | null;
    playback: PlaybackState;
    view: PlayerViewSettings;
    /** Keyed by track index. */
    trackMix: Record<number, TrackMix>;
    /** Bumped whenever the loaded score model is mutated in place via `mutateScore`. */
    scoreRevision: number;
}

export const defaultPlayerView: PlayerViewSettings = {
    layoutMode: 'page',
    staveProfile: 'scoreTab',
    scale: 1,
    masterVolume: 1,
    playbackSpeed: 1,
    transpose: 0,
    countIn: false,
    metronome: false,
    highlight: true,
    looping: false,
};

export const initialAlphaTabState: AlphaTabState = {
    isReady: false,
    isPlaying: false,
    isRendering: false,
    isSoundFontLoaded: false,
    soundFontLoadProgress: 0,
    currentScore: null,
    tracks: [],
    renderedTracks: [],
    currentTime: 0,
    endTime: 0,
    barStartTicks: [],
    totalBars: 0,
    currentBar: 0,
    tempoMarkers: [],
    loopRangeBars: null,
    playback: initialPlaybackState,
    view: defaultPlayerView,
    trackMix: {},
    scoreRevision: 0,
};

export type TexDiagnosticSeverity = 'error' | 'warning' | 'hint';

/** An alphaTex diagnostic with 1-based line/column positions. */
export interface TexDiagnostic {
    severity: TexDiagnosticSeverity;
    /** e.g. `AT204`; empty for failures without a diagnostic code. */
    code: string;
    message: string;
    start?: { line: number; col: number };
    end?: { line: number; col: number };
}

export interface TexLoadResult {
    /** Whether the source was free of errors and handed to the renderer. */
    rendered: boolean;
    diagnostics: TexDiagnostic[];
}

export class AlphaTabStore {
    private snapshot: AlphaTabState = { ...initialAlphaTabState };
    private readonly subscribers = new Set<() => void>();
    private pendingRender = false;
    private rafHandle = 0;
    private colorMode: ColorMode;
    private preset: AlphaTabPreset;
    private readonly playback: PlaybackController;
    private loadToken = 0;
    private readonly settingsLayers = new Set<(settings: Settings) => void>();
    private readonly unsubscribers: (() => void)[] = [];
    private scrollDuringPlayback = true;
    /** The store switched `scrollMode` from `Off` for the current playback and owes the switch back. */
    private scrollingForPlayback = false;

    constructor(
        private readonly api: AlphaTabApi,
        private readonly module: AlphaTabModule,
        colorMode: ColorMode,
        preset: AlphaTabPreset = 'docs',
        playbackOptions: PlaybackControllerOptions = { fixedSource: false, ownSoundFont: false },
    ) {
        this.colorMode = colorMode;
        this.preset = preset;
        this.playback = new PlaybackController(api, module, playbackOptions);
        this.playback.subscribe(() => this.update({ playback: this.playback.getSnapshot() }));
        this.wireEvents();
        this.snapshot = {
            ...this.snapshot,
            isReady: true,
            playback: this.playback.getSnapshot(),
            view: { ...defaultPlayerView, ...this.readView() },
        };
    }

    readonly subscribe = (callback: () => void): (() => void) => {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    };

    readonly getSnapshot = (): AlphaTabState => this.snapshot;

    play(): void { this.api.play(); }
    pause(): void {
        if (this.playback.cancelResume()) { this.update({ isPlaying: false }); }
        this.api.pause();
    }
    playPause(): void {
        // During a source switch playback still shows as running, so the toggle means pause.
        if (this.playback.cancelResume()) {
            this.update({ isPlaying: false });
            return;
        }
        this.api.playPause();
    }
    stop(): void {
        if (this.playback.cancelResume()) { this.update({ isPlaying: false }); }
        this.playback.seekWhileSwitching(0);
        this.api.stop();
    }

    setPlaybackSpeed(value: number): void {
        this.api.playbackSpeed = value;
        this.updateView({ playbackSpeed: value });
    }
    setMasterVolume(value: number): void {
        this.api.masterVolume = value;
        this.updateView({ masterVolume: value });
    }
    setCountInVolume(value: number): void {
        this.api.countInVolume = value;
        this.updateView({ countIn: value > 0 });
    }
    setMetronomeVolume(value: number): void {
        this.api.metronomeVolume = value;
        this.updateView({ metronome: value > 0 });
    }
    setLoopPlayback(enabled: boolean): void {
        this.api.isLooping = enabled;
        this.updateView({ looping: enabled });
    }

    setTransposeAllTracks(semitones: number): void {
        this.updateView({ transpose: semitones });
        this.applyTrackMix();
    }

    setTrackMute(track: model.Track, mute: boolean): void {
        this.updateTrackMix(track, { mute });
    }
    setTrackSolo(track: model.Track, solo: boolean): void {
        this.updateTrackMix(track, { solo });
    }
    setTrackVolume(track: model.Track, volume: number): void {
        this.updateTrackMix(track, { volume });
    }
    setTrackTranspose(track: model.Track, semitones: number): void {
        this.updateTrackMix(track, { transpose: semitones });
    }
    setTrackNotationTranspose(track: model.Track, semitones: number): void {
        setTrackPitch(this.api.settings.notation.transpositionPitches, track.index, semitones);
        this.updateTrackMix(track, { notationTranspose: semitones });
        this.scheduleApply();
        // The offset is baked into the generated MIDI.
        this.regenerateMidiDebounced();
    }

    setTrackDisplayTranspose(track: model.Track, semitones: number): void {
        setTrackPitch(this.api.settings.notation.displayTranspositionPitches, track.index, semitones);
        this.updateTrackMix(track, { displayTranspose: semitones });
        this.scheduleApply();
    }

    /** Recreates the audio player, e.g. after changing settings alphaTab reads only when it creates one. */
    rebuildPlayer(): void {
        this.playback.rebuildPlayer();
    }

    /** Overrides the site-wide playback source for this player; see `PlaybackController.setSourceOverride`. */
    setPlaybackSource(kind: PlaybackSourceKind | null): void {
        this.playback.setSourceOverride(kind);
    }

    /** Uses `audio` (any format the browser decodes) as backing track of the loaded score. */
    attachBackingTrackAudio(audio: Uint8Array): void {
        this.playback.attachBackingTrack(audio);
    }

    /** Lets `media` drive playback while the player is in external-media mode; returns the unbind function. */
    bindExternalMedia(media: MediaElementLike): () => void {
        return bindExternalMedia(this.api, media, this);
    }

    /**
     * Mutates the loaded score model (stylesheet, staff options, ...) and bumps `scoreRevision` so
     * UI reading the model re-renders. Re-renders the notation unless `render` is false.
     */
    mutateScore(mutate: (score: model.Score) => void, options: { render?: boolean; regenerateMidi?: boolean } = {}): void {
        const score = this.api.score;
        if (!score) { return; }
        mutate(score);
        this.update({ scoreRevision: this.snapshot.scoreRevision + 1 });
        if (options.regenerateMidi) { this.api.loadMidiForScore(); }
        if (options.render ?? true) { this.api.render(); }
    }

    /** Regenerates the playback MIDI after changing settings that only affect audio generation. */
    regenerateMidi(): void {
        if (this.api.score) { this.api.loadMidiForScore(); }
    }

    private midiTimer = 0;
    private regenerateMidiDebounced(): void {
        clearTimeout(this.midiTimer);
        this.midiTimer = window.setTimeout(() => this.regenerateMidi(), 200);
    }

    setLayoutMode(mode: LayoutModeKey): void {
        this.api.settings.display.layoutMode =
            mode === 'page' ? this.module.LayoutMode.Page : this.module.LayoutMode.Horizontal;
        this.updateView({ layoutMode: mode });
        this.scheduleApply();
    }

    setStaveProfile(profile: StaveProfileKey): void {
        const { StaveProfile } = this.module;
        this.api.settings.display.staveProfile =
            profile === 'score' ? StaveProfile.Score :
            profile === 'tab'   ? StaveProfile.Tab :
                                  StaveProfile.ScoreTab;
        this.updateView({ staveProfile: profile });
        this.scheduleApply();
    }

    setScale(scale: number): void {
        this.api.settings.display.scale = scale;
        this.updateView({ scale });
        this.scheduleApply();
    }

    setEnableHighlight(enabled: boolean): void {
        this.api.settings.player.enableElementHighlighting = enabled;
        this.updateView({ highlight: enabled });
        this.scheduleApply();
    }

    /**
     * While enabled (the default), a `scrollMode` of `Off` turns into `Continuous` for as long as
     * the player plays, so only the player in use follows its cursor. Disable it where the page
     * owns the scroll mode.
     */
    setScrollDuringPlayback(enabled: boolean): void {
        this.scrollDuringPlayback = enabled;
        this.syncPlaybackScroll();
    }

    /**
     * Push arbitrary settings changes and re-render. Merges via
     * `settings.fillFromJson`, then triggers `updateSettings()` + `render()`
     * on the next animation frame (batched).
     */
    updateSettings(patch?: object, options: { render?: boolean } = {}): void {
        if (patch) {
            this.api.settings.fillFromJson(patch as never);
        }
        this.update({ view: { ...this.snapshot.view, ...this.readView() } });
        if (options.render ?? true) {
            this.scheduleApply();
        } else {
            this.api.updateSettings();
        }
    }

    /**
     * Registers settings that are re-applied on top of the base settings whenever the store
     * rebuilds them (color mode switch, reset). Applies `layer` right away. Returns the unregister function.
     */
    addSettingsLayer(layer: (settings: Settings) => void): () => void {
        this.settingsLayers.add(layer);
        layer(this.api.settings);
        this.updateSettings();
        return () => {
            this.settingsLayers.delete(layer);
        };
    }

    /** A fresh copy of the settings this store starts from, e.g. to read default values. */
    createDefaultSettings(): Settings {
        const settings = new this.module.Settings();
        applyAlphaTabSettings(this.module, settings, { colorMode: this.colorMode, preset: this.preset });
        applyPlayerDefaults(this.module, settings);
        return settings;
    }

    applyColorMode(colorMode: ColorMode): void {
        if (this.colorMode === colorMode) { return; }
        this.colorMode = colorMode;
        applyTheme(this.module, this.api.settings, colorMode);
        for (const layer of this.settingsLayers) { layer(this.api.settings); }
        this.scheduleApply();
    }

    resetSettings(): void {
        // Player mode and SoundFont belong to the playback controller, not to the visual defaults.
        const { playerMode, soundFont } = this.api.settings.player;
        applyAlphaTabSettings(this.module, this.api.settings, {
            colorMode: this.colorMode,
            preset: this.preset,
        });
        applyPlayerDefaults(this.module, this.api.settings);
        const defaults = this.createDefaultSettings();
        this.api.settings.display.scale = defaults.display.scale;
        this.api.settings.display.staveProfile = defaults.display.staveProfile;
        this.api.settings.player.playerMode = playerMode;
        this.api.settings.player.soundFont = soundFont;
        for (const layer of this.settingsLayers) { layer(this.api.settings); }
        this.scheduleApply();
        this.setMasterVolume(1);
        this.setPlaybackSpeed(1);
        this.setCountInVolume(0);
        this.setMetronomeVolume(0);
        this.setLoopPlayback(false);
        this.api.playbackRange = null;
        this.api.settings.notation.transpositionPitches = [];
        this.api.settings.notation.displayTranspositionPitches = [];
        this.update({
            loopRangeBars: null,
            view: { ...defaultPlayerView, ...this.readView(), transpose: 0 },
            trackMix: this.initialTrackMix(this.api.score),
        });
        this.applyTrackMix();
        this.syncPlaybackScroll();
    }

    /** Renders `tracks` in score order; ignored if that would leave nothing to render. */
    renderTracks(tracks: model.Track[]): void {
        if (tracks.length === 0) { return; }
        tracks = [...tracks].sort((a, b) => a.index - b.index);
        this.api.renderTracks(tracks);
    }

    seekToTick(tick: number): void {
        if (this.playback.seekWhileSwitching(tick)) { return; }
        this.api.tickPosition = tick;
    }

    seekToTime(ms: number): void {
        this.api.timePosition = ms;
    }

    seekToBar(bar: number): void {
        const ticks = this.snapshot.barStartTicks;
        if (ticks.length === 0) { return; }
        const clamped = Math.max(0, Math.min(bar, ticks.length - 1));
        this.seekToTick(ticks[clamped]);
    }

    seekToFraction(f: number): void {
        const ticks = this.snapshot.barStartTicks;
        if (ticks.length < 2) { return; }
        const totalTicks = ticks[ticks.length - 1];
        this.seekToTick(Math.max(0, Math.min(f, 1)) * totalTicks);
    }

    setLoopRangeBars(from: number | null, to: number | null): void {
        const ticks = this.snapshot.barStartTicks;
        if (from == null || to == null || ticks.length === 0) {
            this.api.playbackRange = null;
            this.update({ loopRangeBars: null });
            return;
        }
        const lo = Math.max(0, Math.min(from, to));
        const hi = Math.min(ticks.length - 1, Math.max(from, to));
        this.api.playbackRange = {
            startTick: ticks[lo],
            endTick: ticks[hi],
        };
        this.update({ loopRangeBars: { from: lo, to: hi } });
    }

    loadScoreFromUrl(url: string): Promise<void> {
        return this.loadSource({ url });
    }

    loadScoreFromTex(tex: string): void {
        void this.loadSource({ tex });
    }

    /**
     * Loads and renders the notation of `source` right away; any backing track
     * it declares is fetched only once playback actually needs it. A newer
     * call supersedes a pending one.
     */
    async loadSource(source: ScoreSource, options: LoadSourceOptions = {}): Promise<void> {
        const token = ++this.loadToken;
        if (this.snapshot.isPlaying) { this.api.stop(); }
        if (source.url || source.bytes) {
            let buffer = source.bytes;
            if (!buffer) {
                const response = await fetch(source.url!);
                if (!response.ok) {
                    throw new Error(`[alphaTab-react] Failed to fetch ${source.url}: ${response.status}`);
                }
                buffer = new Uint8Array(await response.arrayBuffer());
            }
            if (token !== this.loadToken) { return; }
            const score = this.module.importer.ScoreLoader.loadScoreFromBytes(buffer, this.api.settings);
            this.playback.setSource(source);
            this.api.renderScore(score, resolveTrackIndexes(score, options.tracks));
        } else if (source.tex) {
            this.loadTex(source.tex, { ...options, backingTrack: source.backingTrack });
        }
    }

    /** Loads a user-picked file (any format alphaTab imports), rendering all of its tracks. */
    async loadFile(file: File): Promise<void> {
        const bytes = new Uint8Array(await file.arrayBuffer());
        await this.loadSource({ bytes, name: file.name }, { tracks: 'all' });
    }

    /**
     * Parses `tex` and renders it when it has no errors; otherwise the
     * previously rendered score stays. Supersedes any pending load.
     */
    loadTex(tex: string, options: LoadTexOptions = {}): TexLoadResult {
        ++this.loadToken;
        const importer = new this.module.importer.AlphaTexImporter();
        importer.logErrors = false;
        importer.initFromString(tex, this.api.settings);
        let score: model.Score | null = null;
        let failure: unknown = null;
        try {
            score = importer.readScore();
        } catch (e) {
            failure = e;
        }

        const diagnostics = [
            ...importer.lexerDiagnostics,
            ...importer.parserDiagnostics,
            ...importer.semanticDiagnostics,
        ].map((d) => this.toTexDiagnostic(d));

        if (!score) {
            if (!diagnostics.some((d) => d.severity === 'error')) {
                diagnostics.push({ severity: 'error', code: '', message: describeFailure(failure) });
            }
            return { rendered: false, diagnostics };
        }

        if (this.snapshot.isPlaying) { this.api.stop(); }
        this.playback.setSource({ tex, backingTrack: options.backingTrack });
        this.api.renderScore(score, resolveTrackIndexes(score, options.tracks));
        return { rendered: true, diagnostics };
    }

    /** Retries the preferred playback source after a backing-track failure. */
    retryPlayback(): void {
        this.playback.retry();
    }

    getApi(): AlphaTabApi { return this.api; }

    /** Detaches the store from the API; the API itself stays alive and belongs to its owner. */
    destroy(): void {
        if (this.rafHandle) { cancelAnimationFrame(this.rafHandle); }
        clearTimeout(this.midiTimer);
        this.playback.destroy();
        for (const unsubscribe of this.unsubscribers) { unsubscribe(); }
        this.unsubscribers.length = 0;
    }

    private updateView(partial: Partial<PlayerViewSettings>): void {
        this.update({ view: { ...this.snapshot.view, ...partial } });
    }

    /** Settings can change from outside the store, e.g. through the player's `settings` prop. */
    private refreshView(): void {
        const next = this.readView();
        const view = this.snapshot.view;
        if ((Object.keys(next) as (keyof typeof next)[]).some((key) => view[key] !== next[key])) {
            this.updateView(next);
        }
    }

    private readView(): Pick<PlayerViewSettings, 'layoutMode' | 'staveProfile' | 'scale' | 'highlight'> {
        const { display, player } = this.api.settings;
        const { StaveProfile, LayoutMode } = this.module;
        return {
            layoutMode: display.layoutMode === LayoutMode.Horizontal ? 'scroll' : 'page',
            staveProfile:
                display.staveProfile === StaveProfile.Score ? 'score' :
                display.staveProfile === StaveProfile.Tab ? 'tab' :
                                                            'scoreTab',
            scale: display.scale,
            highlight: player.enableElementHighlighting,
        };
    }

    private initialTrackMix(score: model.Score | null): Record<number, TrackMix> {
        const mix: Record<number, TrackMix> = {};
        for (const track of score?.tracks ?? []) {
            mix[track.index] = {
                ...defaultTrackMix,
                mute: track.playbackInfo.isMute,
                solo: track.playbackInfo.isSolo,
            };
        }
        return mix;
    }

    private updateTrackMix(track: model.Track, partial: Partial<TrackMix>): void {
        const current = this.snapshot.trackMix[track.index] ?? defaultTrackMix;
        this.update({ trackMix: { ...this.snapshot.trackMix, [track.index]: { ...current, ...partial } } });
        this.applyTrackMix([track]);
    }

    /** Channel state lives in the synthesizer and is lost whenever alphaTab rebuilds the player or reloads the MIDI. */
    private applyTrackMix(tracks: model.Track[] = this.api.score?.tracks ?? []): void {
        if (!this.api.player || !this.api.score) { return; }
        const { trackMix, view } = this.snapshot;
        for (const track of tracks) {
            const mix = trackMix[track.index] ?? defaultTrackMix;
            this.api.changeTrackMute([track], mix.mute);
            this.api.changeTrackSolo([track], mix.solo);
            this.api.changeTrackVolume([track], mix.volume);
            this.api.changeTrackTranspositionPitch([track], view.transpose + mix.transpose);
        }
    }

    private update(partial: Partial<AlphaTabState>): void {
        this.snapshot = { ...this.snapshot, ...partial };
        for (const sub of this.subscribers) { sub(); }
    }

    private scheduleApply(): void {
        if (this.pendingRender) { return; }
        this.pendingRender = true;
        this.rafHandle = requestAnimationFrame(() => {
            this.pendingRender = false;
            this.rafHandle = 0;
            this.api.updateSettings();
            if (this.api.score) { this.api.render(); }
        });
    }

    private syncPlaybackScroll(): void {
        const player = this.api.settings.player;
        const { ScrollMode } = this.module;
        if (this.scrollDuringPlayback && this.snapshot.isPlaying) {
            if (player.scrollMode !== ScrollMode.Off) { return; }
            player.scrollMode = ScrollMode.Continuous;
            this.scrollingForPlayback = true;
        } else {
            if (!this.scrollingForPlayback) { return; }
            this.scrollingForPlayback = false;
            // Someone picked a different mode during playback; keep theirs.
            if (player.scrollMode !== ScrollMode.Continuous) { return; }
            player.scrollMode = ScrollMode.Off;
        }
        this.api.updateSettings();
    }

    private wireEvents(): void {
        const { synth } = this.module;

        this.unsubscribers.push(this.api.settingsUpdated.on(() => this.refreshView()));

        this.unsubscribers.push(this.api.scoreLoaded.on((score) => {
            const tables = this.deriveBarTables(score);
            // A re-parse of the same piece (e.g. an edited alphaTex) keeps the mix; any other file starts fresh.
            const samePiece = sameTrackLayout(this.snapshot.currentScore, score);
            const trackMix = samePiece ? this.snapshot.trackMix : this.initialTrackMix(score);
            const { notation } = this.api.settings;
            if (!samePiece && (notation.transpositionPitches.length > 0 || notation.displayTranspositionPitches.length > 0)) {
                notation.transpositionPitches = [];
                notation.displayTranspositionPitches = [];
                this.scheduleApply();
            }
            this.update({
                currentScore: score,
                tracks: [...score.tracks],
                ...tables,
                currentBar: 0,
                loopRangeBars: null,
                trackMix,
            });
        }));
        this.unsubscribers.push(this.api.midiLoaded.on(() => this.applyTrackMix()));
        this.unsubscribers.push(this.api.playerReady.on(() => this.applyTrackMix()));
        this.unsubscribers.push(this.api.renderStarted.on(() => {
            this.update({ isRendering: true });
        }));
        this.unsubscribers.push(this.api.postRenderFinished.on(() => {
            this.update({ isRendering: false, renderedTracks: [...this.api.tracks] });
        }));
        this.unsubscribers.push(this.api.playerStateChanged.on((e) => {
            // A switch pauses the old player and resumes the new one; the UI keeps showing playback.
            this.update({ isPlaying: e.state === synth.PlayerState.Playing || this.playback.isResumePending });
            this.syncPlaybackScroll();
        }));
        this.unsubscribers.push(this.api.playerFinished.on(() => {
            this.update({ isPlaying: false, currentTime: 0, currentBar: 0 });
            this.syncPlaybackScroll();
        }));
        this.unsubscribers.push(this.api.playerPositionChanged.on((e) => {
            if (!this.playback.acceptPosition(e.currentTick)) { return; }
            const currentBar = this.findBarForTick(e.currentTick);
            this.update({
                currentTime: e.currentTime,
                endTime: e.endTime,
                currentBar,
            });
        }));
        // alphaTab's built-in user interaction (drag-select on the score) sets
        // this. Convert ticks back to bar indices so the scrubber overlay and
        // flyout hint can reflect the user's actual selection.
        this.unsubscribers.push(this.api.playbackRangeChanged.on((e) => {
            if (!e.playbackRange) {
                this.update({ loopRangeBars: null });
                return;
            }
            const from = this.findBarForTick(e.playbackRange.startTick);
            const to = this.findBarForTick(e.playbackRange.endTick);
            this.update({ loopRangeBars: { from, to } });
        }));
        this.unsubscribers.push(this.api.soundFontLoad.on((e) => {
            const progress = e.total > 0 ? e.loaded / e.total : 0;
            this.update({ soundFontLoadProgress: progress });
        }));
        this.unsubscribers.push(this.api.soundFontLoaded.on(() => {
            this.update({ isSoundFontLoaded: true, soundFontLoadProgress: 1 });
        }));
    }

    private deriveBarTables(score: model.Score): {
        barStartTicks: number[];
        totalBars: number;
        tempoMarkers: TempoMarker[];
    } {
        try {
            const barStartTicks: number[] = [];
            const tempoMarkers: TempoMarker[] = [];
            let tick = 0;
            let lastBpm = -1;
            for (let i = 0; i < score.masterBars.length; i++) {
                const mb = score.masterBars[i];
                barStartTicks.push(tick);
                const bpm = mb.tempoAutomations?.[0]?.value ?? score.tempo;
                if (bpm !== lastBpm) {
                    tempoMarkers.push({ atBar: i, bpm });
                    lastBpm = bpm;
                }
                tick += mb.calculateDuration();
            }
            barStartTicks.push(tick);
            if (tempoMarkers.length === 0) {
                tempoMarkers.push({ atBar: 0, bpm: score.tempo });
            }
            return { barStartTicks, totalBars: score.masterBars.length, tempoMarkers };
        } catch {
            return {
                barStartTicks: [],
                totalBars: score.masterBars.length,
                tempoMarkers: [{ atBar: 0, bpm: score.tempo }],
            };
        }
    }

    private toTexDiagnostic(d: importer.alphaTex.AlphaTexDiagnostic): TexDiagnostic {
        const { AlphaTexDiagnosticsSeverity } = this.module.importer.alphaTex;
        const severity: TexDiagnosticSeverity =
            d.severity === AlphaTexDiagnosticsSeverity.Error ? 'error' :
            d.severity === AlphaTexDiagnosticsSeverity.Warning ? 'warning' :
                                                                 'hint';
        return {
            severity,
            code: `AT${String(d.code).padStart(3, '0')}`,
            message: d.message,
            start: d.start ? { line: d.start.line, col: d.start.col } : undefined,
            end: d.end ? { line: d.end.line, col: d.end.col } : undefined,
        };
    }

    private findBarForTick(tick: number): number {
        const ticks = this.snapshot.barStartTicks;
        if (ticks.length === 0) { return 0; }
        let lo = 0;
        let hi = ticks.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >>> 1;
            if (ticks[mid] <= tick) { lo = mid; }
            else { hi = mid - 1; }
        }
        return lo;
    }
}

function setTrackPitch(pitches: number[], index: number, semitones: number): void {
    while (pitches.length <= index) { pitches.push(0); }
    pitches[index] = semitones;
}

function resolveTrackIndexes(score: model.Score, tracks: number[] | 'all' | undefined): number[] | undefined {
    if (tracks === 'all') { return [-1]; }
    const valid = tracks?.filter((i) => i >= 0 && i < score.tracks.length);
    return valid && valid.length > 0 ? valid : undefined;
}

function sameTrackLayout(previous: model.Score | null, next: model.Score): boolean {
    if (!previous || previous.tracks.length !== next.tracks.length) { return false; }
    return previous.tracks.every((t, i) => t.name === next.tracks[i].name);
}

function describeFailure(failure: unknown): string {
    if (failure instanceof Error) {
        const cause = (failure as Error & { cause?: unknown }).cause;
        return cause instanceof Error ? cause.message : failure.message;
    }
    return String(failure);
}
