/**
 * Pins that a destroyed API object no longer keeps the loaded model alive and ignores late events
 * of the components it destroyed.
 *
 * @target web
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import type { EventEmitter, EventEmitterOfT } from '@coderline/alphatab/EventEmitter';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { PlayerMode } from '@coderline/alphatab/PlayerSettings';
import { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import { Settings } from '@coderline/alphatab/Settings';
import { AlphaSynth } from '@coderline/alphatab/synth/AlphaSynth';
import type { IAlphaSynth } from '@coderline/alphatab/synth/IAlphaSynth';
import { PlayerState } from '@coderline/alphatab/synth/PlayerState';
import { PlayerStateChangedEventArgs } from '@coderline/alphatab/synth/PlayerStateChangedEventArgs';
import { PositionChangedEventArgs } from '@coderline/alphatab/synth/PositionChangedEventArgs';
import { TestOutput } from 'test/audio/TestOutput';
import { TestUiFacade } from 'test/visualTests/TestUiFacade';
import { describe, expect, it } from 'vitest';

/**
 * @internal
 */
class DestroyTestUiFacade extends TestUiFacade {
    public player: AlphaSynth | null = null;

    public override createWorkerPlayer(): IAlphaSynth | null {
        const player = new AlphaSynth(new TestOutput(), 500);
        this.player = player;
        return player;
    }
}

describe('AlphaTabApiDestroyTests', () => {
    async function flush(): Promise<void> {
        for (let i = 0; i < 5; i++) {
            await new Promise<void>(resolve => setImmediate(resolve));
        }
    }

    async function createLoadedApi(
        log: string[]
    ): Promise<{ api: AlphaTabApiBase<unknown>; facade: DestroyTestUiFacade }> {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.player.playerMode = PlayerMode.EnabledSynthesizer;
        settings.player.enableCursor = true;
        const facade = new DestroyTestUiFacade();
        facade.rootContainer.width = 1300;
        const api = new AlphaTabApiBase<unknown>(facade, settings);
        await flush();

        const rendered = Promise.withResolvers<void>();
        const unsubscribe = api.postRenderFinished.on(() => rendered.resolve());
        api.renderScore(
            ScoreLoader.loadAlphaTex(
                '\\track "A" C4 D4 E4 F4 | G4 A4 B4 C5 \\track "B" C4 D4 E4 F4 | G4 A4 B4 C5',
                settings
            )
        );
        await rendered.promise;
        unsubscribe();
        await flush();

        api.error.on(e => log.push(`error:${e.message}`));
        api.renderStarted.on(() => log.push('renderStarted'));
        api.renderFinished.on(() => log.push('renderFinished'));
        api.postRenderFinished.on(() => log.push('postRenderFinished'));
        api.playerStateChanged.on(() => log.push('playerStateChanged'));
        api.playerPositionChanged.on(() => log.push('playerPositionChanged'));
        api.playerFinished.on(() => log.push('playerFinished'));
        log.length = 0;
        return { api, facade };
    }

    it('releases-model-references', async () => {
        const log: string[] = [];
        const { api } = await createLoadedApi(log);
        expect(api.score !== null).toBe(true);
        expect(api.tracks.length).toBe(1);
        expect(api.tickCache !== null).toBe(true);
        expect(api.boundsLookup !== null).toBe(true);
        expect(api.player !== null).toBe(true);

        api.destroy();

        expect(api.score).toBe(null);
        expect(api.tracks.length).toBe(0);
        expect(api.tickCache).toBe(null);
        expect(api.boundsLookup).toBe(null);
        expect(api.player).toBe(null);
        expect((api.renderer as ScoreRendererWrapper).instance).toBe(undefined);
    });

    it('ignores-late-component-events', async () => {
        const log: string[] = [];
        const { api, facade } = await createLoadedApi(log);
        const player = facade.player!;
        const renderer = (api.renderer as ScoreRendererWrapper).instance!;

        api.destroy();
        await flush();
        log.length = 0;

        (player.stateChanged as EventEmitterOfT<PlayerStateChangedEventArgs>).trigger(
            new PlayerStateChangedEventArgs(PlayerState.Playing, false)
        );
        (player.positionChanged as EventEmitterOfT<PositionChangedEventArgs>).trigger(
            new PositionChangedEventArgs(0, 1000, 0, 1000, false, 120, 120)
        );
        (player.finished as EventEmitter).trigger();
        (renderer.preRender as EventEmitterOfT<boolean>).trigger(false);
        (renderer.renderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(new RenderFinishedEventArgs());
        (renderer.postRenderFinished as EventEmitter).trigger();
        facade.rootContainer.width = 800;
        await new Promise<void>(resolve => setTimeout(resolve, 50));
        await flush();

        expect(log.join(',')).toBe('');
        expect(api.score).toBe(null);
    });
});
