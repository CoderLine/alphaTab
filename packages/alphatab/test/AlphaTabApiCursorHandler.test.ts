import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import type { ICursorHandler } from '@coderline/alphatab/CursorHandler';
import type { MidiTickLookupFindBeatResultCursorMode } from '@coderline/alphatab/midi/MidiTickLookup';
import type { Cursors } from '@coderline/alphatab/platform/Cursors';
import type { IContainer } from '@coderline/alphatab/platform/IContainer';
import { PlayerMode } from '@coderline/alphatab/PlayerSettings';
import type { BeatBounds } from '@coderline/alphatab/rendering/_barrel';
import { Settings } from '@coderline/alphatab/Settings';
import { TestUiFacade } from 'test/visualTests/TestUiFacade';
import { describe, expect, it } from 'vitest';

/**
 * @internal
 */
class RecordingCursorHandler implements ICursorHandler {
    private readonly _name: string;
    private readonly _log: string[];

    public constructor(name: string, log: string[]) {
        this._name = name;
        this._log = log;
    }

    public onAttach(_cursors: Cursors): void {
        this._log.push(`${this._name}.onAttach`);
    }

    public onDetach(_cursors: Cursors): void {
        this._log.push(`${this._name}.onDetach`);
    }

    public placeBarCursor(_barCursor: IContainer, _beatBounds: BeatBounds): void {}

    public placeBeatCursor(_beatCursor: IContainer, _beatBounds: BeatBounds, _startBeatX: number): void {}

    public transitionBeatCursor(
        _beatCursor: IContainer,
        _beatBounds: BeatBounds,
        _startBeatX: number,
        _nextBeatX: number,
        _duration: number,
        _cursorMode: MidiTickLookupFindBeatResultCursorMode
    ): void {}
}

describe('AlphaTabApiCursorHandlerTests', () => {
    function createApi(): AlphaTabApiBase<unknown> {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.player.playerMode = PlayerMode.EnabledSynthesizer;
        settings.player.enableCursor = true;

        const facade = new TestUiFacade();
        return new AlphaTabApiBase<unknown>(facade, settings);
    }

    it('replace-custom-cursor-handler', () => {
        const api = createApi();
        const log: string[] = [];
        const first = new RecordingCursorHandler('first', log);
        const second = new RecordingCursorHandler('second', log);

        api.customCursorHandler = first;
        expect(log).toEqual(['first.onAttach']);

        log.splice(0, log.length);
        api.customCursorHandler = second;
        expect(log).toEqual(['first.onDetach', 'second.onAttach']);

        log.splice(0, log.length);
        api.customCursorHandler = undefined;
        expect(log).toEqual(['second.onDetach']);

        api.destroy();
    });
});
