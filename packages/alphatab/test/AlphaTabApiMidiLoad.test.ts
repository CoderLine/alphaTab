/**
 * Pins how often the API generates MIDI and feeds it to the player across score loads,
 * track changes, setting updates and player mode changes.
 *
 * @target web
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import type { EventEmitter, IEventEmitter, IEventEmitterOfT } from '@coderline/alphatab/EventEmitter';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { MidiEventType, type NoteOnEvent } from '@coderline/alphatab/midi/MidiEvent';
import type { MidiFile } from '@coderline/alphatab/midi/MidiFile';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import { PlayerMode } from '@coderline/alphatab/PlayerSettings';
import type { IScoreRenderer, RenderHints } from '@coderline/alphatab/rendering/IScoreRenderer';
import type { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { Settings } from '@coderline/alphatab/Settings';
import { AlphaSynth } from '@coderline/alphatab/synth/AlphaSynth';
import type { IAlphaSynth } from '@coderline/alphatab/synth/IAlphaSynth';
import { TestOutput } from 'test/audio/TestOutput';
import { TestPlatform } from 'test/TestPlatform';
import { TestUiFacade } from 'test/visualTests/TestUiFacade';
import { describe, expect, it } from 'vitest';

/**
 * An output which becomes ready asynchronously like a worker or audio-context backed output.
 * @internal
 */
class DeferredReadyTestOutput extends TestOutput {
    public override open(_bufferTimeInMilliseconds: number): void {
        setImmediate(() => (this.ready as EventEmitter).trigger());
    }
}

/**
 * Renders asynchronously like the worker renderer and keeps a serialized copy of every score
 * handed to it, which is what a rendering worker receives.
 * @internal
 */
class DeferredTestRenderer implements IScoreRenderer {
    private readonly _inner: ScoreRenderer;
    private readonly _settings: Settings;
    private readonly _log: string[];
    public readonly postedScores: Score[] = [];

    public constructor(settings: Settings, log: string[]) {
        this._inner = new ScoreRenderer(settings);
        this._settings = settings;
        this._log = log;
    }

    public get boundsLookup(): BoundsLookup | null {
        return this._inner.boundsLookup;
    }

    public get width(): number {
        return this._inner.width;
    }

    public set width(value: number) {
        this._inner.width = value;
    }

    public render(renderHints?: RenderHints): void {
        setImmediate(() => this._inner.render(renderHints));
    }

    public resizeRender(): void {
        setImmediate(() => this._inner.resizeRender());
    }

    public renderScore(score: Score | null, trackIndexes: number[] | null, renderHints?: RenderHints): void {
        this._log.push('renderPosted');
        if (score) {
            this.postedScores.push(JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), this._settings));
        }
        setImmediate(() => this._inner.renderScore(score, trackIndexes, renderHints));
    }

    public renderResult(resultId: string): void {
        this._inner.renderResult(resultId);
    }

    public updateSettings(settings: Settings): void {
        this._inner.updateSettings(settings);
    }

    public destroy(): void {
        this._inner.destroy();
    }

    public get preRender(): IEventEmitterOfT<boolean> {
        return this._inner.preRender;
    }

    public get renderFinished(): IEventEmitterOfT<RenderFinishedEventArgs> {
        return this._inner.renderFinished;
    }

    public get partialRenderFinished(): IEventEmitterOfT<RenderFinishedEventArgs> {
        return this._inner.partialRenderFinished;
    }

    public get partialLayoutFinished(): IEventEmitterOfT<RenderFinishedEventArgs> {
        return this._inner.partialLayoutFinished;
    }

    public get postRenderFinished(): IEventEmitter {
        return this._inner.postRenderFinished;
    }

    public get error(): IEventEmitterOfT<Error> {
        return this._inner.error;
    }
}

/**
 * @internal
 */
class MidiLoadTestUiFacade extends TestUiFacade {
    public deferredReady: boolean = false;
    public log: string[];
    public workerRenderer: DeferredTestRenderer | null = null;
    private _settings: Settings | null = null;

    public constructor(log: string[], useWorkers: boolean = false) {
        super();
        this.log = log;
        (this as { areWorkersSupported: boolean }).areWorkersSupported = useWorkers;
    }

    public override initialize(api: AlphaTabApiBase<unknown>, raw: unknown): void {
        super.initialize(api, raw);
        this._settings = api.settings;
    }

    public override createWorkerRenderer(): IScoreRenderer {
        this.workerRenderer = new DeferredTestRenderer(this._settings!, this.log);
        return this.workerRenderer;
    }

    public override createWorkerPlayer(): IAlphaSynth | null {
        this.log.push('createPlayer');
        return new AlphaSynth(this.deferredReady ? new DeferredReadyTestOutput() : new TestOutput(), 500);
    }
}

describe('AlphaTabApiMidiLoadTests', () => {
    interface Fixture {
        api: AlphaTabApiBase<unknown>;
        facade: MidiLoadTestUiFacade;
        log: string[];
    }

    function createScore(settings: Settings): Score {
        return ScoreLoader.loadAlphaTex(
            '\\track "A" C4 D4 E4 F4 | G4 A4 B4 C5 \\track "B" C4 D4 E4 F4 | G4 A4 B4 C5',
            settings
        );
    }

    async function flush(): Promise<void> {
        for (let i = 0; i < 5; i++) {
            await new Promise<void>(resolve => setImmediate(resolve));
        }
    }

    async function createApi(
        playerMode: PlayerMode,
        deferredReady: boolean = false,
        useWorkers: boolean = false
    ): Promise<Fixture> {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.useWorkers = useWorkers;
        settings.player.playerMode = playerMode;
        settings.player.enableCursor = true;

        const log: string[] = [];
        const facade = new MidiLoadTestUiFacade(log, useWorkers);
        facade.deferredReady = deferredReady;
        facade.rootContainer.width = 1300;
        const api = new AlphaTabApiBase<unknown>(facade, settings);
        api.error.on(e => log.push(`error:${e.message}`));
        api.scoreLoaded.on(() => log.push('scoreLoaded'));
        api.midiLoad.on(() => log.push('midiLoad'));
        api.midiLoaded.on(() => log.push('midiLoaded'));
        api.playerReady.on(() => log.push('playerReady'));
        api.postRenderFinished.on(() => log.push('postRenderFinished'));
        await flush();
        return { api, facade, log };
    }

    async function render(fixture: Fixture, action: () => void): Promise<string[]> {
        fixture.log.length = 0;
        const rendered = Promise.withResolvers<void>();
        const unsubscribe = fixture.api.postRenderFinished.on(() => rendered.resolve());
        try {
            action();
            await rendered.promise;
        } finally {
            unsubscribe();
        }
        await flush();
        return fixture.log.slice();
    }

    async function run(fixture: Fixture, action: () => void): Promise<string[]> {
        fixture.log.length = 0;
        action();
        await flush();
        return fixture.log.slice();
    }

    it('first-load-existing-player', async () => {
        const f = await createApi(PlayerMode.EnabledSynthesizer);
        const events = await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        expect(events).toEqual(['scoreLoaded', 'midiLoad', 'midiLoaded', 'postRenderFinished']);
        expect(f.api.tickCache !== null).toBe(true);
        f.api.destroy();
    });

    it('second-load-existing-player', async () => {
        const f = await createApi(PlayerMode.EnabledSynthesizer);
        await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        const firstCache = f.api.tickCache;
        const events = await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        expect(events).toEqual(['scoreLoaded', 'midiLoad', 'midiLoaded', 'postRenderFinished']);
        expect(f.api.tickCache !== null).toBe(true);
        expect(f.api.tickCache !== firstCache).toBe(true);
        f.api.destroy();
    });

    it('render-tracks-same-score', async () => {
        const f = await createApi(PlayerMode.EnabledSynthesizer);
        await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        const events = await render(f, () => f.api.renderTracks([f.api.score!.tracks[1]]));
        expect(events).toEqual(['postRenderFinished']);
        f.api.destroy();
    });

    it('update-settings-and-render', async () => {
        const f = await createApi(PlayerMode.EnabledSynthesizer);
        await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        const events = await render(f, () => {
            f.api.settings.display.scale = 1.5;
            f.api.updateSettings();
            f.api.render();
        });
        expect(events).toEqual(['postRenderFinished']);
        f.api.destroy();
    });

    it('first-load-automatic-creates-player', async () => {
        const f = await createApi(PlayerMode.EnabledAutomatic);
        const events = await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        expect(events).toEqual(['scoreLoaded', 'createPlayer', 'midiLoad', 'midiLoaded', 'postRenderFinished']);
        expect(f.api.tickCache !== null).toBe(true);
        f.api.destroy();
    });

    it('first-load-automatic-creates-player-deferred-ready', async () => {
        const f = await createApi(PlayerMode.EnabledAutomatic, true);
        const events = await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        expect(events.filter(e => e === 'midiLoad')).toEqual(['midiLoad']);
        expect(events.filter(e => e === 'midiLoaded')).toEqual(['midiLoaded']);
        expect(events.indexOf('createPlayer')).toBeLessThan(events.indexOf('midiLoad'));
        expect(events.indexOf('midiLoad')).toBeLessThan(events.indexOf('midiLoaded'));
        expect(f.api.tickCache !== null).toBe(true);

        const second = await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        expect(second).toEqual(['scoreLoaded', 'midiLoad', 'midiLoaded', 'postRenderFinished']);
        f.api.destroy();
    });

    it('load-before-player-ready', async () => {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.player.playerMode = PlayerMode.EnabledSynthesizer;
        const log: string[] = [];
        const facade = new MidiLoadTestUiFacade(log);
        facade.deferredReady = true;
        facade.rootContainer.width = 1300;
        const api = new AlphaTabApiBase<unknown>(facade, settings);
        api.midiLoad.on(() => log.push('midiLoad'));
        api.midiLoaded.on(() => log.push('midiLoaded'));
        // score is known before the deferred player becomes ready
        api.renderScore(createScore(settings));
        await flush();
        expect(api.tickCache !== null).toBe(true);
        expect(log.filter(e => e === 'createPlayer')).toEqual(['createPlayer']);
        expect(log.filter(e => e === 'midiLoaded').length).toBeGreaterThanOrEqual(1);
        api.destroy();
    });

    it('player-mode-changes', async () => {
        const f = await createApi(PlayerMode.EnabledSynthesizer);
        await render(f, () => f.api.renderScore(createScore(f.api.settings)));

        const disabled = await run(f, () => {
            f.api.settings.player.playerMode = PlayerMode.Disabled;
            f.api.updateSettings();
        });
        expect(disabled).toEqual([]);

        const enabled = await run(f, () => {
            f.api.settings.player.playerMode = PlayerMode.EnabledSynthesizer;
            f.api.updateSettings();
        });
        expect(enabled).toEqual(['createPlayer', 'midiLoad', 'midiLoaded']);

        const external = await run(f, () => {
            f.api.settings.player.playerMode = PlayerMode.EnabledExternalMedia;
            f.api.updateSettings();
        });
        expect(external).toEqual(['midiLoad', 'midiLoaded', 'playerReady']);

        const unchanged = await run(f, () => f.api.updateSettings());
        expect(unchanged).toEqual([]);
        f.api.destroy();
    });

    it('player-disabled', async () => {
        const f = await createApi(PlayerMode.Disabled);
        const events = await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        expect(events).toEqual(['scoreLoaded', 'midiLoad', 'postRenderFinished']);
        expect(f.api.tickCache !== null).toBe(true);

        const second = await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        expect(second).toEqual(['scoreLoaded', 'midiLoad', 'postRenderFinished']);
        f.api.destroy();
    });

    it('player-ready-flow', async () => {
        const f = await createApi(PlayerMode.EnabledAutomatic, true);
        await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        const soundFont = await TestPlatform.loadFile('test-data/audio/default.sf2');
        const events = await run(f, () => f.api.loadSoundFont(soundFont, false));
        expect(events).toEqual(['playerReady']);
        expect(f.api.isReadyForPlayback).toBe(true);
        f.api.destroy();
    });

    function noteKeys(midi: MidiFile): number[] {
        const keys: number[] = [];
        for (const e of midi.events) {
            if (e.type === MidiEventType.NoteOn) {
                keys.push((e as NoteOnEvent).noteKey);
            }
        }
        return keys;
    }

    it('worker-first-load-existing-player', async () => {
        const f = await createApi(PlayerMode.EnabledSynthesizer, false, true);
        expect(f.facade.workerRenderer !== null).toBe(true);
        const events = await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        expect(events).toEqual(['scoreLoaded', 'renderPosted', 'midiLoad', 'midiLoaded', 'postRenderFinished']);
        expect(f.api.tickCache !== null).toBe(true);
        f.api.destroy();
    });

    it('worker-second-load-existing-player', async () => {
        const f = await createApi(PlayerMode.EnabledSynthesizer, false, true);
        await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        const events = await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        expect(events).toEqual(['scoreLoaded', 'renderPosted', 'midiLoad', 'midiLoaded', 'postRenderFinished']);
        f.api.destroy();
    });

    it('worker-automatic-creates-player', async () => {
        const f = await createApi(PlayerMode.EnabledAutomatic, false, true);
        const events = await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        expect(events).toEqual([
            'scoreLoaded',
            'createPlayer',
            'midiLoad',
            'midiLoaded',
            'renderPosted',
            'postRenderFinished'
        ]);
        f.api.destroy();
    });

    it('worker-player-disabled', async () => {
        const f = await createApi(PlayerMode.Disabled, false, true);
        const events = await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        expect(events).toEqual(['scoreLoaded', 'renderPosted', 'midiLoad', 'postRenderFinished']);
        expect(f.api.tickCache !== null).toBe(true);
        f.api.destroy();
    });

    it('worker-render-tracks-same-score', async () => {
        const f = await createApi(PlayerMode.EnabledSynthesizer, false, true);
        await render(f, () => f.api.renderScore(createScore(f.api.settings)));
        const events = await render(f, () => f.api.renderTracks([f.api.score!.tracks[1]]));
        expect(events).toEqual(['renderPosted', 'postRenderFinished']);
        f.api.destroy();
    });

    it('worker-beat-timers-generate-midi-first', async () => {
        const f = await createApi(PlayerMode.EnabledSynthesizer, false, true);
        const score = ScoreLoader.loadAlphaTex(
            '\\tempo 120 . 3.3.4 { timer } 3.3.4*3 | 3.3.4 { timer } 3.3.4*3',
            f.api.settings
        );
        const events = await render(f, () => f.api.renderScore(score));
        expect(events).toEqual(['scoreLoaded', 'midiLoad', 'midiLoaded', 'renderPosted', 'postRenderFinished']);
        const posted = f.facade.workerRenderer!.postedScores;
        const bars = posted[posted.length - 1].tracks[0].staves[0].bars;
        expect(bars[0].voices[0].beats[0].timer).toBe(0);
        expect(bars[1].voices[0].beats[0].timer).toBe(2000);
        f.api.destroy();
    });

    async function expectScoreLoadedModificationApplied(useWorkers: boolean) {
        const f = await createApi(PlayerMode.EnabledSynthesizer, false, useWorkers);
        const score = ScoreLoader.loadAlphaTex('\\track "A" 3.3.4 r.4 r.2 | r.1', f.api.settings);
        const note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const originalKey = note.realValue;
        let midi: MidiFile | null = null;
        f.api.midiLoad.on(m => {
            midi = m;
        });
        f.api.scoreLoaded.on(s => {
            s.tracks[0].name = 'Modified';
            s.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret += 4;
        });
        await render(f, () => f.api.renderScore(score));

        const keys = noteKeys(midi!);
        expect(keys.indexOf(originalKey + 4)).toBeGreaterThanOrEqual(0);
        expect(keys.indexOf(originalKey)).toBe(-1);
        if (useWorkers) {
            const posted = f.facade.workerRenderer!.postedScores;
            const rendered = posted[posted.length - 1];
            expect(rendered.tracks[0].name).toBe('Modified');
            expect(rendered.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toBe(7);
        }
        f.api.destroy();
    }

    it('score-loaded-modification-rendered-and-played', async () => {
        await expectScoreLoadedModificationApplied(false);
    });

    it('worker-score-loaded-modification-rendered-and-played', async () => {
        await expectScoreLoadedModificationApplied(true);
    });
});
