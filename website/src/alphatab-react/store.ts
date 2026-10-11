import type { AlphaTabApi, model, Settings } from '@coderline/alphatab';
import type { ColorMode } from '@docusaurus/theme-common';
import type { AlphaTabModule } from './module';
import { applyAlphaTabSettings, applyTheme, type AlphaTabPreset } from './settings';
import {
    PlaybackController,
    initialPlaybackState,
    type PlaybackControllerOptions,
    type PlaybackState,
} from './playback/playback-controller';
import type { ScoreSource } from './playback/score-source';

export interface TempoMarker {
    atBar: number;
    bpm: number;
}

export interface LoopRangeBars {
    from: number;
    to: number;
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
}

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
};

export type StaveProfileKey = 'scoreTab' | 'score' | 'tab';
export type LayoutModeKey = 'page' | 'scroll';

export class AlphaTabStore {
    private snapshot: AlphaTabState = { ...initialAlphaTabState };
    private readonly subscribers = new Set<() => void>();
    private pendingRender = false;
    private rafHandle = 0;
    private colorMode: ColorMode;
    private preset: AlphaTabPreset;
    private readonly playback: PlaybackController;
    private loadToken = 0;

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
        this.snapshot = { ...this.snapshot, isReady: true, playback: this.playback.getSnapshot() };
    }

    readonly subscribe = (callback: () => void): (() => void) => {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    };

    readonly getSnapshot = (): AlphaTabState => this.snapshot;

    play(): void { this.api.play(); }
    pause(): void { this.api.pause(); }
    playPause(): void { this.api.playPause(); }
    stop(): void { this.api.stop(); }

    setPlaybackSpeed(value: number): void { this.api.playbackSpeed = value; }
    setMasterVolume(value: number): void { this.api.masterVolume = value; }
    setCountInVolume(value: number): void { this.api.countInVolume = value; }
    setMetronomeVolume(value: number): void { this.api.metronomeVolume = value; }
    setLoopPlayback(enabled: boolean): void { this.api.isLooping = enabled; }

    setTransposeAllTracks(semitones: number): void {
        if (!this.api.score) return;
        this.api.changeTrackTranspositionPitch(this.api.tracks, semitones);
    }

    setLayoutMode(mode: LayoutModeKey): void {
        if (mode === 'page') {
            this.api.settings.display.layoutMode = this.module.LayoutMode.Page;
            this.api.settings.player.scrollMode = this.module.ScrollMode.Off;
        } else {
            this.api.settings.display.layoutMode = this.module.LayoutMode.Horizontal;
            this.api.settings.player.scrollMode = this.module.ScrollMode.Continuous;
        }
        this.scheduleApply();
    }

    setStaveProfile(profile: StaveProfileKey): void {
        const { StaveProfile } = this.module;
        this.api.settings.display.staveProfile =
            profile === 'score' ? StaveProfile.Score :
            profile === 'tab'   ? StaveProfile.Tab :
                                  StaveProfile.ScoreTab;
        this.scheduleApply();
    }

    setScale(scale: number): void {
        this.api.settings.display.scale = scale;
        this.scheduleApply();
    }

    setEnableHighlight(enabled: boolean): void {
        this.api.settings.player.enableElementHighlighting = enabled;
        this.scheduleApply();
    }

    /**
     * Push arbitrary settings changes and re-render. Merges via
     * `settings.fillFromJson`, then triggers `updateSettings()` + `render()`
     * on the next animation frame (batched).
     */
    updateSettings(patch?: object): void {
        if (patch) {
            this.api.settings.fillFromJson(patch as never);
        }
        this.scheduleApply();
    }

    applyColorMode(colorMode: ColorMode): void {
        if (this.colorMode === colorMode) return;
        this.colorMode = colorMode;
        applyTheme(this.module, this.api.settings, colorMode);
        this.scheduleApply();
    }

    resetSettings(): void {
        // Player mode and SoundFont belong to the playback controller, not to the visual defaults.
        const { playerMode, soundFont } = this.api.settings.player;
        applyAlphaTabSettings(this.module, this.api.settings, {
            colorMode: this.colorMode,
            preset: this.preset,
        });
        this.api.settings.player.playerMode = playerMode;
        this.api.settings.player.soundFont = soundFont;
        this.scheduleApply();
        this.setMasterVolume(1);
        this.setPlaybackSpeed(1);
        this.setCountInVolume(0);
        this.setMetronomeVolume(0);
        this.setLoopPlayback(false);
        this.api.playbackRange = null;
        this.setTransposeAllTracks(0);
        this.update({ loopRangeBars: null });
    }

    renderTracks(tracks: model.Track[]): void {
        this.api.renderTracks(tracks);
    }

    seekToTick(tick: number): void {
        this.api.tickPosition = tick;
    }

    seekToTime(ms: number): void {
        this.api.timePosition = ms;
    }

    seekToBar(bar: number): void {
        const ticks = this.snapshot.barStartTicks;
        if (ticks.length === 0) return;
        const clamped = Math.max(0, Math.min(bar, ticks.length - 1));
        this.seekToTick(ticks[clamped]);
    }

    seekToFraction(f: number): void {
        const ticks = this.snapshot.barStartTicks;
        if (ticks.length < 2) return;
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
    async loadSource(source: ScoreSource): Promise<void> {
        const token = ++this.loadToken;
        if (this.snapshot.isPlaying) this.api.stop();
        if (source.url) {
            const response = await fetch(source.url);
            if (!response.ok) {
                throw new Error(`[alphaTab-react] Failed to fetch ${source.url}: ${response.status}`);
            }
            const buffer = new Uint8Array(await response.arrayBuffer());
            if (token !== this.loadToken) return;
            const score = this.module.importer.ScoreLoader.loadScoreFromBytes(buffer, this.api.settings);
            this.playback.setSource(source);
            this.api.renderScore(score);
        } else if (source.tex) {
            this.playback.setSource(source);
            this.api.tex(source.tex);
        }
    }

    /** Retries the preferred playback source after a backing-track failure. */
    retryPlayback(): void {
        this.playback.retry();
    }

    getApi(): AlphaTabApi { return this.api; }
    destroy(): void {
        if (this.rafHandle) cancelAnimationFrame(this.rafHandle);
        this.playback.destroy();
        this.api.destroy();
    }

    private update(partial: Partial<AlphaTabState>): void {
        this.snapshot = { ...this.snapshot, ...partial };
        for (const sub of this.subscribers) sub();
    }

    private scheduleApply(): void {
        if (this.pendingRender) return;
        this.pendingRender = true;
        this.rafHandle = requestAnimationFrame(() => {
            this.pendingRender = false;
            this.rafHandle = 0;
            this.api.updateSettings();
            if (this.api.score) this.api.render();
        });
    }

    private wireEvents(): void {
        const { synth } = this.module;

        this.api.scoreLoaded.on((score) => {
            const tables = this.deriveBarTables(score);
            this.update({
                currentScore: score,
                tracks: [...score.tracks],
                ...tables,
                currentBar: 0,
                loopRangeBars: null,
            });
        });
        this.api.renderStarted.on(() => {
            this.update({ isRendering: true });
        });
        this.api.postRenderFinished.on(() => {
            this.update({ isRendering: false, renderedTracks: [...this.api.tracks] });
        });
        this.api.playerStateChanged.on((e) => {
            this.update({ isPlaying: e.state === synth.PlayerState.Playing });
        });
        this.api.playerFinished.on(() => {
            this.update({ isPlaying: false, currentTime: 0, currentBar: 0 });
        });
        this.api.playerPositionChanged.on((e) => {
            const currentBar = this.findBarForTick(e.currentTick);
            this.update({
                currentTime: e.currentTime,
                endTime: e.endTime,
                currentBar,
            });
        });
        // alphaTab's built-in user interaction (drag-select on the score) sets
        // this. Convert ticks back to bar indices so the scrubber overlay and
        // flyout hint can reflect the user's actual selection.
        this.api.playbackRangeChanged.on((e) => {
            if (!e.playbackRange) {
                this.update({ loopRangeBars: null });
                return;
            }
            const from = this.findBarForTick(e.playbackRange.startTick);
            const to = this.findBarForTick(e.playbackRange.endTick);
            this.update({ loopRangeBars: { from, to } });
        });
        this.api.soundFontLoad.on((e) => {
            const progress = e.total > 0 ? e.loaded / e.total : 0;
            this.update({ soundFontLoadProgress: progress });
        });
        this.api.soundFontLoaded.on(() => {
            this.update({ isSoundFontLoaded: true, soundFontLoadProgress: 1 });
        });
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

    private findBarForTick(tick: number): number {
        const ticks = this.snapshot.barStartTicks;
        if (ticks.length === 0) return 0;
        let lo = 0;
        let hi = ticks.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >>> 1;
            if (ticks[mid] <= tick) lo = mid;
            else hi = mid - 1;
        }
        return lo;
    }
}
