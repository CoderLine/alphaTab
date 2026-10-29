/** @target web */
// Time from `renderScore` to the moment the score is handed to a worker renderer, and to the midi load,
// for an API with a worker-like renderer and an in-process player.
// Run: npm run test-layout-flow -- LoadOrder   (LAYOUT_FLOW_RUNS=<n> changes the repetitions)
import fs from 'node:fs';
import path from 'node:path';
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import {
    EventEmitter,
    EventEmitterOfT,
    type IEventEmitter,
    type IEventEmitterOfT
} from '@coderline/alphatab/EventEmitter';
import type { Score } from '@coderline/alphatab/model/Score';
import { PlayerMode } from '@coderline/alphatab/PlayerSettings';
import type { IScoreRenderer, RenderHints } from '@coderline/alphatab/rendering/IScoreRenderer';
import type { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import type { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { Settings } from '@coderline/alphatab/Settings';
import { AlphaSynth } from '@coderline/alphatab/synth/AlphaSynth';
import type { IAlphaSynth } from '@coderline/alphatab/synth/IAlphaSynth';
import { TestOutput } from 'test/audio/TestOutput';
import { TestUiFacade } from 'test/visualTests/TestUiFacade';
import { describe, it } from 'vitest';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

const root = process.cwd();
const runs = Number.parseInt(process.env.LAYOUT_FLOW_RUNS ?? '10', 10);

/**
 * Records when a score is handed over for rendering and never renders.
 * @internal
 */
class PostRecordingRenderer implements IScoreRenderer {
    public postedAt: number = -1;
    public readonly boundsLookup: BoundsLookup | null = null;
    public width: number = 0;

    public render(_renderHints?: RenderHints): void {}
    public resizeRender(): void {}
    public renderScore(_score: Score | null, _trackIndexes: number[] | null, _renderHints?: RenderHints): void {
        this.postedAt = performance.now();
    }
    public renderResult(_resultId: string): void {}
    public updateSettings(_settings: Settings): void {}
    public destroy(): void {}

    public readonly preRender: IEventEmitterOfT<boolean> = new EventEmitterOfT<boolean>();
    public readonly renderFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly partialRenderFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly partialLayoutFinished: IEventEmitterOfT<RenderFinishedEventArgs> =
        new EventEmitterOfT<RenderFinishedEventArgs>();
    public readonly postRenderFinished: IEventEmitter = new EventEmitter();
    public readonly error: IEventEmitterOfT<Error> = new EventEmitterOfT<Error>();
}

/**
 * @internal
 */
class LoadOrderUiFacade extends TestUiFacade {
    public readonly renderer = new PostRecordingRenderer();

    public constructor() {
        super();
        (this as { areWorkersSupported: boolean }).areWorkersSupported = true;
    }

    public override createWorkerRenderer(): IScoreRenderer {
        return this.renderer;
    }

    public override createWorkerPlayer(): IAlphaSynth | null {
        return new AlphaSynth(new TestOutput(false), 500);
    }
}

function median(values: number[]) {
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

describe('LoadOrder', () => {
    const out: string[] = [];

    it('post', async () => {
        out.push(`## LoadOrder (${new Date().toISOString()}, runs=${runs})`);
        out.push('');
        out.push('| score | player | to render post (ms) | to midiLoad (ms) | renderScore total (ms) |');
        out.push('|---|---|---|---|---|');
        const modes = [
            { name: 'synth', mode: PlayerMode.EnabledSynthesizer },
            { name: 'disabled', mode: PlayerMode.Disabled }
        ];
        for (const ref of LayoutCorpus.referenceScores) {
            for (const m of modes) {
                const toPost: number[] = [];
                const toMidi: number[] = [];
                const total: number[] = [];
                const settings = new Settings();
                settings.core.engine = 'svg';
                settings.core.useWorkers = true;
                settings.player.playerMode = m.mode;
                const facade = new LoadOrderUiFacade();
                facade.rootContainer.width = 1300;
                const api = new AlphaTabApiBase<unknown>(facade, settings);
                await new Promise<void>(resolve => setImmediate(resolve));
                let midiAt = -1;
                api.midiLoad.on(() => {
                    midiAt = performance.now();
                });
                for (let i = 0; i < runs + 2; i++) {
                    const score = LayoutHarness.loadScore(ref.file, settings);
                    const t = performance.now();
                    api.renderScore(score);
                    const end = performance.now();
                    if (i >= 2) {
                        toPost.push(facade.renderer.postedAt - t);
                        toMidi.push(midiAt - t);
                        total.push(end - t);
                    }
                }
                api.destroy();
                out.push(
                    `| ${ref.name} | ${m.name} | ${median(toPost).toFixed(2)} | ${median(toMidi).toFixed(2)} | ${median(total).toFixed(2)} |`
                );
            }
        }
        out.push('');
        console.log(out.join('\n'));
    });

    it('write', () => {
        const dir = path.join(root, 'temp/layout-flow');
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, 'load-order.txt');
        fs.appendFileSync(file, `${out.join('\n')}\n`);
        console.log(`written ${file}`);
    });
});
