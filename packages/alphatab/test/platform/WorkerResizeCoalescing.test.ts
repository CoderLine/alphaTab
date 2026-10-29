/**
 * Pins that the worker renderer keeps at most one resize in flight and renders the newest width
 * after it, however many resizes were requested meanwhile.
 *
 * @target web
 */
import type { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import type { Score } from '@coderline/alphatab/model/Score';
import { AlphaTabWebWorker } from '@coderline/alphatab/platform/worker/AlphaTabWebWorker';
import type {
    IAlphaTabRenderingWorker,
    IAlphaTabWorkerGlobalScope,
    IAlphaTabWorkerMessage
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import { AlphaTabWorkerScoreRenderer } from '@coderline/alphatab/platform/worker/AlphaTabWorkerScoreRenderer';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

type Listener = (e: MessageEvent<IAlphaTabWorkerMessage>) => void;

/**
 * A worker whose message delivery the test drives step by step in both directions.
 */
class ManualWorker implements IAlphaTabRenderingWorker {
    public readonly toWorker: IAlphaTabWorkerMessage[] = [];
    public readonly toMain: IAlphaTabWorkerMessage[] = [];
    private readonly _mainListeners: Listener[] = [];
    private readonly _workerListeners: Listener[] = [];

    public readonly scope: IAlphaTabWorkerGlobalScope<IAlphaTabWorkerMessage>;

    public constructor() {
        const self = this;
        this.scope = {
            postMessage(message: IAlphaTabWorkerMessage) {
                self.toMain.push(message);
            },
            addEventListener(_event: 'message', handler: Listener) {
                self._workerListeners.push(handler);
            },
            removeEventListener() {}
        };
        new AlphaTabWebWorker(this.scope);
    }

    public postMessage(message: IAlphaTabWorkerMessage): void {
        this.toWorker.push(message);
    }

    public addEventListener(_event: 'message', handler: Listener): void {
        this._mainListeners.push(handler);
    }

    public removeEventListener(): void {}

    public terminate(): void {}

    public pendingWorkerCommands(): string[] {
        return this.toWorker.map(m => m.cmd);
    }

    /** Lets the worker process the given number of queued messages (all when omitted). */
    public runWorker(count: number = Number.MAX_SAFE_INTEGER): void {
        while (count > 0 && this.toWorker.length > 0) {
            const data = this.toWorker.shift()!;
            for (const l of this._workerListeners) {
                l({ data } as MessageEvent<IAlphaTabWorkerMessage>);
            }
            count--;
        }
    }

    /** Delivers all messages the worker has posted so far to the main side. */
    public runMain(): void {
        while (this.toMain.length > 0) {
            const data = this.toMain.shift()!;
            for (const l of this._mainListeners) {
                l({ data } as MessageEvent<IAlphaTabWorkerMessage>);
            }
        }
    }

    public runUntilIdle(): void {
        while (this.toWorker.length > 0 || this.toMain.length > 0) {
            this.runWorker();
            this.runMain();
        }
    }
}

describe('WorkerResizeCoalescing', () => {
    const tex =
        '\\track "A" C4 D4 E4 F4 | G4 A4 B4 C5 | C4 D4 E4 F4 | G4 A4 B4 C5 | C4 D4 E4 F4 | G4 A4 B4 C5 | C4 D4 E4 F4 | G4 A4 B4 C5';

    function create(layoutMode: LayoutMode = LayoutMode.Page) {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.display.layoutMode = layoutMode;
        const score: Score = ScoreLoader.loadAlphaTex(tex, settings);
        const api = { settings, score } as unknown as AlphaTabApiBase<unknown>;
        const worker = new ManualWorker();
        const renderer = new AlphaTabWorkerScoreRenderer<unknown>(api, worker);

        const log: string[] = [];
        renderer.preRender.on(resize => log.push(`preRender:${resize}`));
        renderer.renderFinished.on(e => log.push(`renderFinished:${e.totalWidth}`));
        renderer.postRenderFinished.on(() => log.push('postRenderFinished'));

        renderer.width = 1300;
        renderer.renderScore(score, [0]);
        worker.runUntilIdle();
        expect(log.length).toBe(3);
        expect(log[0]).toBe('preRender:false');
        expect(log[2]).toBe('postRenderFinished');
        log.splice(0, log.length);
        return { renderer, worker, log };
    }

    function requestResize(renderer: AlphaTabWorkerScoreRenderer<unknown>, width: number) {
        renderer.width = width;
        renderer.resizeRender();
    }

    it('burst-renders-in-flight-and-latest-only', () => {
        const { renderer, worker, log } = create();

        requestResize(renderer, 1000);
        requestResize(renderer, 900);
        requestResize(renderer, 800);
        requestResize(renderer, 700);

        expect(worker.pendingWorkerCommands()).toEqual([
            'alphaTab.setWidth',
            'alphaTab.resizeRender',
            'alphaTab.setWidth',
            'alphaTab.setWidth',
            'alphaTab.setWidth'
        ]);

        worker.runUntilIdle();

        expect(log).toEqual([
            'preRender:true',
            'renderFinished:1000',
            'postRenderFinished',
            'preRender:true',
            'renderFinished:700',
            'postRenderFinished'
        ]);
        expect(renderer.width).toBe(700);
    });

    it('requests-during-follow-up-collapse-again', () => {
        const { renderer, worker, log } = create();

        requestResize(renderer, 1000);
        requestResize(renderer, 900);
        // the first resize completes, the follow-up for 900 gets posted
        worker.runWorker();
        worker.runMain();
        expect(worker.pendingWorkerCommands()).toEqual(['alphaTab.resizeRender']);

        requestResize(renderer, 800);
        requestResize(renderer, 600);
        expect(worker.pendingWorkerCommands()).toEqual([
            'alphaTab.resizeRender',
            'alphaTab.setWidth',
            'alphaTab.setWidth'
        ]);

        worker.runUntilIdle();

        expect(log).toEqual([
            'preRender:true',
            'renderFinished:1000',
            'postRenderFinished',
            'preRender:true',
            'renderFinished:900',
            'postRenderFinished',
            'preRender:true',
            'renderFinished:600',
            'postRenderFinished'
        ]);
    });

    it('single-resize-is-not-delayed', () => {
        const { renderer, worker, log } = create();

        requestResize(renderer, 1000);
        worker.runUntilIdle();
        requestResize(renderer, 800);
        expect(worker.pendingWorkerCommands()).toEqual(['alphaTab.setWidth', 'alphaTab.resizeRender']);
        worker.runUntilIdle();

        expect(log).toEqual([
            'preRender:true',
            'renderFinished:1000',
            'postRenderFinished',
            'preRender:true',
            'renderFinished:800',
            'postRenderFinished'
        ]);
    });

    it('resize-without-render-still-completes', () => {
        const { renderer, worker, log } = create(LayoutMode.Horizontal);

        requestResize(renderer, 1000);
        requestResize(renderer, 900);
        worker.runUntilIdle();
        expect(log.length).toBe(0);

        requestResize(renderer, 800);
        expect(worker.pendingWorkerCommands()).toEqual(['alphaTab.setWidth', 'alphaTab.resizeRender']);
        worker.runUntilIdle();
        expect(worker.toWorker.length).toBe(0);
    });
});
