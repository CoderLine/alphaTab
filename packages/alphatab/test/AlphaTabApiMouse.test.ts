import { AlphaTabApiBase, type PlaybackHighlightChangeEventArgs } from '@coderline/alphatab/AlphaTabApiBase';
import type { EventEmitterOfT } from '@coderline/alphatab/EventEmitter';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { IContainer } from '@coderline/alphatab/platform/IContainer';
import type { IMouseEventArgs } from '@coderline/alphatab/platform/IMouseEventArgs';
import { PlayerMode } from '@coderline/alphatab/PlayerSettings';
import { Settings } from '@coderline/alphatab/Settings';
import { TestUiFacade } from 'test/visualTests/TestUiFacade';
import { describe, expect, it } from 'vitest';

/**
 * @internal
 */
class TestMouseEventArgs implements IMouseEventArgs {
    private readonly _x: number;
    private readonly _y: number;

    public readonly isLeftMouseButton: boolean = true;

    public constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    public getX(_relativeTo: IContainer): number {
        return this._x;
    }

    public getY(_relativeTo: IContainer): number {
        return this._y;
    }

    public preventDefault(): void {}
}

describe('AlphaTabApiMouseTests', () => {
    async function createApi(configure?: (settings: Settings) => void): Promise<AlphaTabApiBase<unknown>> {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.player.playerMode = PlayerMode.EnabledSynthesizer;
        settings.player.enableCursor = true;
        settings.player.enablePlaybackRangeSelection = true;
        configure?.(settings);

        const score = ScoreLoader.loadAlphaTex('C4 D4 E4 F4 | G4 A4 B4 C5', settings);

        const facade = new TestUiFacade();
        facade.rootContainer.width = 1300;
        const api = new AlphaTabApiBase<unknown>(facade, settings);
        const rendered = Promise.withResolvers<boolean>();
        api.postRenderFinished.on(() => rendered.resolve(true));
        api.error.on(e => rendered.reject(e));
        api.renderScore(score, [0]);
        await rendered.promise;
        return api;
    }

    async function rerender(api: AlphaTabApiBase<unknown>): Promise<void> {
        const rendered = Promise.withResolvers<boolean>();
        const unsubscribeRender = api.postRenderFinished.on(() => rendered.resolve(true));
        const unsubscribeError = api.error.on(e => rendered.reject(e));
        try {
            api.render();
            await rendered.promise;
        } finally {
            unsubscribeRender();
            unsubscribeError();
        }
    }

    function beats(api: AlphaTabApiBase<unknown>): Beat[] {
        return api.score!.tracks[0].staves[0].bars[0].voices[0].beats;
    }

    function argsAtBeat(api: AlphaTabApiBase<unknown>, beat: Beat): TestMouseEventArgs {
        const bounds = api.boundsLookup!.findBeat(beat)!.realBounds;
        return new TestMouseEventArgs(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
    }

    function mouseDown(api: AlphaTabApiBase<unknown>, args: IMouseEventArgs) {
        (api.canvasElement.mouseDown as EventEmitterOfT<IMouseEventArgs>).trigger(args);
    }

    function mouseMove(api: AlphaTabApiBase<unknown>, args: IMouseEventArgs) {
        (api.canvasElement.mouseMove as EventEmitterOfT<IMouseEventArgs>).trigger(args);
    }

    function mouseUp(api: AlphaTabApiBase<unknown>, args: IMouseEventArgs) {
        (api.canvasElement.mouseUp as EventEmitterOfT<IMouseEventArgs>).trigger(args);
    }

    function trackHighlights(api: AlphaTabApiBase<unknown>): PlaybackHighlightChangeEventArgs[] {
        const highlights: PlaybackHighlightChangeEventArgs[] = [];
        api.playbackRangeHighlightChanged.on(e => {
            highlights.push(e);
        });
        return highlights;
    }

    it('render-during-press-on-single-beat', async () => {
        const api = await createApi();
        mouseDown(api, argsAtBeat(api, beats(api)[1]));

        const highlights = trackHighlights(api);
        await rerender(api);

        expect(highlights.length).toBe(1);
        expect(highlights[0].startBeat).toBeUndefined();

        api.destroy();
    });

    it('render-after-click-without-range-reset', async () => {
        const api = await createApi(s => {
            s.player.resetPlaybackRangeOnClick = false;
        });
        const args = argsAtBeat(api, beats(api)[1]);
        mouseDown(api, args);
        mouseUp(api, args);

        await rerender(api);

        api.destroy();
    });

    it('render-during-press-across-beats-uses-new-layout', async () => {
        const api = await createApi();
        const start = beats(api)[0];
        const end = beats(api)[2];
        mouseDown(api, argsAtBeat(api, start));
        const highlights = trackHighlights(api);
        mouseMove(api, argsAtBeat(api, end));

        expect(highlights.length).toBe(1);
        const oldStartBounds = highlights[0].startBeatBounds!;
        const oldEndBounds = highlights[0].endBeatBounds!;

        await rerender(api);

        expect(highlights.length).toBe(2);
        const refreshed = highlights[1];
        expect(refreshed.startBeat).toBe(start);
        expect(refreshed.endBeat).toBe(end);
        expect(refreshed.startBeatBounds).toBe(api.boundsLookup!.findBeat(start));
        expect(refreshed.endBeatBounds).toBe(api.boundsLookup!.findBeat(end));
        expect(refreshed.startBeatBounds).not.toBe(oldStartBounds);
        expect(refreshed.endBeatBounds).not.toBe(oldEndBounds);

        api.destroy();
    });

    it('api-highlight-survives-render-without-range-selection', async () => {
        const api = await createApi(s => {
            s.player.enablePlaybackRangeSelection = false;
        });
        const start = beats(api)[0];
        const end = beats(api)[3];
        api.highlightPlaybackRange(start, end);

        const highlights = trackHighlights(api);
        await rerender(api);

        expect(highlights.length).toBe(1);
        expect(highlights[0].startBeat).toBe(start);
        expect(highlights[0].endBeat).toBe(end);
        expect(highlights[0].startBeatBounds).toBe(api.boundsLookup!.findBeat(start));

        api.destroy();
    });

    it('release-outside-beats-ends-press', async () => {
        const api = await createApi();
        mouseDown(api, argsAtBeat(api, beats(api)[0]));
        mouseUp(api, new TestMouseEventArgs(-100, -100));

        const highlights = trackHighlights(api);
        mouseMove(api, argsAtBeat(api, beats(api)[2]));

        expect(highlights.length).toBe(0);

        api.destroy();
    });
});
