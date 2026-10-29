import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Score } from '@coderline/alphatab/model/Score';
import { AlphaTabWebWorker } from '@coderline/alphatab/platform/worker/AlphaTabWebWorker';
import type {
    IAlphaTabRenderingWorker,
    IAlphaTabWorkerGlobalScope,
    IAlphaTabWorkerMessage
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import { AlphaTabWorkerScoreRenderer } from '@coderline/alphatab/platform/worker/AlphaTabWorkerScoreRenderer';
import { Settings } from '@coderline/alphatab/Settings';
import { TestPlatform } from 'test/TestPlatform';
import { TestUiFacade } from 'test/visualTests/TestUiFacade';
import { describe, expect, it } from 'vitest';

/**
 * One side of an in-process worker connection. Messages are queued like with a real worker
 * and only handed to the listeners on {@link deliverAll}.
 * @internal
 */
class InProcessWorkerEnd implements IAlphaTabRenderingWorker, IAlphaTabWorkerGlobalScope<IAlphaTabWorkerMessage> {
    public other: InProcessWorkerEnd | null = null;
    public readonly inbox: IAlphaTabWorkerMessage[] = [];
    private readonly _listeners: ((ev: MessageEvent<IAlphaTabWorkerMessage>) => void)[] = [];

    public postMessage(message: IAlphaTabWorkerMessage): void {
        this.other!.inbox.push(message);
    }

    public addEventListener(_event: 'message', handler: (ev: MessageEvent<IAlphaTabWorkerMessage>) => void): void {
        this._listeners.push(handler);
    }

    public removeEventListener(_event: 'message', _handler: (ev: MessageEvent<IAlphaTabWorkerMessage>) => void): void {}

    public terminate(): void {}

    public deliverAll(): void {
        while (this.inbox.length > 0) {
            const message = this.inbox.splice(0, 1)[0];
            const ev = TestPlatform.createMessageEvent<IAlphaTabWorkerMessage>(message);
            for (const listener of this._listeners) {
                listener(ev);
            }
        }
    }
}

describe('WorkerScoreRendererTests', () => {
    function firstBeat(score: Score): Beat {
        return score.tracks[0].staves[0].bars[0].voices[0].beats[0];
    }

    function lastBeat(score: Score): Beat {
        const bars = score.tracks[0].staves[0].bars;
        const beats = bars[bars.length - 1].voices[0].beats;
        return beats[beats.length - 1];
    }

    it('render-in-flight-while-new-score-is-sent', () => {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = false;
        const api = new AlphaTabApiBase<unknown>(new TestUiFacade(), settings);

        const main = new InProcessWorkerEnd();
        const worker = new InProcessWorkerEnd();
        main.other = worker;
        worker.other = main;
        new AlphaTabWebWorker(worker);
        const renderer = new AlphaTabWorkerScoreRenderer<unknown>(api, main);

        const first = ScoreLoader.loadAlphaTex('C4 D4 E4 F4 | G4 A4 B4 C5 | C4 D4 E4 F4 | G4 A4 B4 C5', settings);
        const second = ScoreLoader.loadAlphaTex('C4.1', settings);

        const lastBeatFound: boolean[] = [];
        renderer.postRenderFinished.on(() => {
            lastBeatFound.push(renderer.boundsLookup!.findBeat(lastBeat(first)) !== null);
        });

        // the api holds the score before it sends it to its renderer
        renderer.width = 800;
        api.renderScore(first, [0]);
        renderer.renderScore(first, [0]);
        worker.deliverAll();
        main.deliverAll();

        // a render of the first score is still running in the worker when the second score is loaded
        renderer.render();
        api.renderScore(second, [0]);
        renderer.renderScore(second, [0]);
        worker.deliverAll();
        main.deliverAll();

        expect(lastBeatFound).toEqual([true, true, false]);
        expect(renderer.boundsLookup!.findBeat(firstBeat(second))).not.toBeNull();

        renderer.destroy();
        api.destroy();
    });
});
