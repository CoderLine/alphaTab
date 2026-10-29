import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import type { EventEmitterOfT } from '@coderline/alphatab/EventEmitter';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { IContainer } from '@coderline/alphatab/platform/IContainer';
import type { IMouseEventArgs } from '@coderline/alphatab/platform/IMouseEventArgs';
import { PlayerMode, ScrollMode } from '@coderline/alphatab/PlayerSettings';
import { Settings } from '@coderline/alphatab/Settings';
import { TestUiFacade } from 'test/visualTests/TestUiFacade';
import { describe, expect, it } from 'vitest';

/**
 * @internal
 */
class ScrollTestMouseEventArgs implements IMouseEventArgs {
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

describe('AlphaTabApiScrollModeTests', () => {
    async function createApi(): Promise<AlphaTabApiBase<unknown>> {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.player.playerMode = PlayerMode.EnabledSynthesizer;
        settings.player.enableCursor = true;
        settings.player.scrollMode = ScrollMode.Continuous;
        settings.display.barsPerRow = 1;

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

    async function clickBeat(api: AlphaTabApiBase<unknown>, beat: Beat): Promise<void> {
        const bounds = api.boundsLookup!.findBeat(beat)!.realBounds;
        const args = new ScrollTestMouseEventArgs(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
        (api.canvasElement.mouseDown as EventEmitterOfT<IMouseEventArgs>).trigger(args);
        (api.canvasElement.mouseUp as EventEmitterOfT<IMouseEventArgs>).trigger(args);

        // the cursor is placed in an invoke queued by the click
        const cursorPlaced = Promise.withResolvers<boolean>();
        api.uiFacade.beginInvoke(() => cursorPlaced.resolve(true));
        await cursorPlaced.promise;
    }

    function scrollToCursorFromTop(api: AlphaTabApiBase<unknown>): number {
        const scroll = api.uiFacade.getScrollContainer();
        scroll.scrollTop = 0;
        api.scrollToCursor();
        return scroll.scrollTop;
    }

    it('scroll-mode-off-at-runtime-page-layout', async () => {
        const api = await createApi();
        await clickBeat(api, api.score!.tracks[0].staves[0].bars[1].voices[0].beats[0]);

        expect(scrollToCursorFromTop(api)).toBeGreaterThan(0);

        api.settings.player.scrollMode = ScrollMode.Off;
        api.updateSettings();
        expect(scrollToCursorFromTop(api)).toBe(0);

        api.settings.player.scrollMode = ScrollMode.Continuous;
        api.updateSettings();
        expect(scrollToCursorFromTop(api)).toBeGreaterThan(0);

        api.destroy();
    });
});
