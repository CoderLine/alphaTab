/**
 * Pins how often the API generates MIDI and feeds it to the player across score loads,
 * track changes, setting updates and player mode changes.
 *
 * @target web
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import type { EventEmitter } from '@coderline/alphatab/EventEmitter';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import type { Score } from '@coderline/alphatab/model/Score';
import { PlayerMode } from '@coderline/alphatab/PlayerSettings';
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
 * @internal
 */
class MidiLoadTestUiFacade extends TestUiFacade {
    public deferredReady: boolean = false;
    public log: string[];

    public constructor(log: string[]) {
        super();
        this.log = log;
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

    async function createApi(playerMode: PlayerMode, deferredReady: boolean = false): Promise<Fixture> {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.player.playerMode = playerMode;
        settings.player.enableCursor = true;

        const log: string[] = [];
        const facade = new MidiLoadTestUiFacade(log);
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
});
