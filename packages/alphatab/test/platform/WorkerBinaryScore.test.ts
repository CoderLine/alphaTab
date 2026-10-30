/** @target web */
import fs from 'node:fs';
import path from 'node:path';
import type { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { ScoreSerializer } from '@coderline/alphatab/generated/model/ScoreSerializer';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { MessagePackObjectReader } from '@coderline/alphatab/io/MessagePackObjectReader';
import { LogLevel } from '@coderline/alphatab/LogLevel';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { Score } from '@coderline/alphatab/model/Score';
import { AlphaTabWebWorker } from '@coderline/alphatab/platform/worker/AlphaTabWebWorker';
import type {
    IAlphaTabRenderingWorker,
    IAlphaTabWorkerGlobalScope,
    IAlphaTabWorkerMessage
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import { AlphaTabWorkerScoreRenderer } from '@coderline/alphatab/platform/worker/AlphaTabWorkerScoreRenderer';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { LayoutCorpus } from '../layoutFlow/LayoutCorpus';

/**
 * The score hand-off to the rendering worker as one transferred binary buffer.
 */
describe('WorkerBinaryScoreTests', () => {
    interface Posted {
        message: IAlphaTabWorkerMessage;
        transfer: unknown[] | undefined;
    }

    function postFromMainThread(settings: Settings, score: Score): Posted[] {
        const posted: Posted[] = [];
        const worker = {
            postMessage: (message: IAlphaTabWorkerMessage, transfer?: unknown[]) => posted.push({ message, transfer }),
            addEventListener: () => {},
            removeEventListener: () => {},
            terminate: () => {}
        };
        const api = { settings } as unknown as AlphaTabApiBase<unknown>;
        const renderer = new AlphaTabWorkerScoreRenderer(api, worker as unknown as IAlphaTabRenderingWorker);
        renderer.width = 1300;
        renderer.renderScore(
            score,
            score.tracks.map(t => t.index)
        );
        return posted;
    }

    function runWorker(messages: Posted[]): IAlphaTabWorkerMessage[] {
        const received: IAlphaTabWorkerMessage[] = [];
        let handler: ((e: MessageEvent<IAlphaTabWorkerMessage>) => void) | null = null;
        const scope: IAlphaTabWorkerGlobalScope<IAlphaTabWorkerMessage> = {
            postMessage: m => received.push(m),
            addEventListener: (_, h) => {
                handler = h;
            },
            removeEventListener: () => {}
        };
        new AlphaTabWebWorker(scope);
        for (const p of messages) {
            handler!({ data: structuredClone(p.message) } as MessageEvent<IAlphaTabWorkerMessage>);
        }
        return received;
    }

    it('rerender-fits-the-buffer', () => {
        const settings = new Settings();
        settings.core.logLevel = LogLevel.None;
        const score = ScoreLoader.loadScoreFromBytes(
            new Uint8Array(fs.readFileSync(path.join(process.cwd(), 'test-data/guitarpro5/canon.gp5'))),
            settings
        );
        const posted: Posted[] = [];
        const worker = {
            postMessage: (message: IAlphaTabWorkerMessage, transfer?: unknown[]) => posted.push({ message, transfer }),
            addEventListener: () => {},
            removeEventListener: () => {},
            terminate: () => {}
        };
        const api = { settings } as unknown as AlphaTabApiBase<unknown>;
        const renderer = new AlphaTabWorkerScoreRenderer(api, worker as unknown as IAlphaTabRenderingWorker);
        renderer.renderScore(score, [0]);
        renderer.renderScore(score, [0]);
        const scores = posted.filter(p => p.message.cmd === 'alphaTab.renderScore');
        const first = (scores[0].message as { score: Uint8Array }).score;
        const second = (scores[1].message as { score: Uint8Array }).score;
        expect(second.byteLength).toBe(first.byteLength);
        // the second score is written into a buffer sized from the first one, without growing it
        expect(second.buffer.byteLength).toBeLessThanOrEqual(Math.ceil(first.byteLength * 1.125));
    });

    it('score-is-transferred-as-msgpack', () => {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.logLevel = LogLevel.None;
        const score = ScoreLoader.loadScoreFromBytes(
            new Uint8Array(fs.readFileSync(path.join(process.cwd(), LayoutCorpus.referenceScores[0].file))),
            settings
        );

        const binary = postFromMainThread(settings, score);
        const message = binary.find(p => p.message.cmd === 'alphaTab.renderScore')!;
        const data = (message.message as { score: unknown }).score as Uint8Array;
        expect(data).toBeInstanceOf(Uint8Array);
        expect(message.transfer).toEqual([data.buffer]);

        const decoded = new Score();
        ScoreSerializer.read(decoded, new MessagePackObjectReader(data));
        decoded.finish(settings);
        expect(JsonConverter.scoreToJson(decoded)).toBe(JsonConverter.scoreToJson(score));

        // the worker renders the same as from the Map tree that C# and Kotlin send
        const fromBinary = runWorker(binary);
        const mapTree = binary.map(p =>
            p === message
                ? { message: { ...p.message, score: JsonConverter.scoreToJsObject(score) }, transfer: undefined }
                : p
        );
        const fromObjects = runWorker(mapTree);
        expect(fromBinary.some(m => m.cmd === 'alphaTab.error')).toBe(false);
        // result ids are random
        const finished = (messages: IAlphaTabWorkerMessage[]) =>
            JSON.stringify(
                messages.filter(m => m.cmd === 'alphaTab.renderFinished' || m.cmd === 'alphaTab.partialLayoutFinished'),
                (k, v) => (k === 'id' ? '' : v)
            );
        expect(finished(fromBinary).length).toBeGreaterThan(2);
        expect(finished(fromBinary)).toBe(finished(fromObjects));
        const bounds = (messages: IAlphaTabWorkerMessage[]) =>
            Array.from(
                (messages.find(m => m.cmd === 'alphaTab.postRenderFinishedWire') as { boundsLookup: Float64Array })
                    .boundsLookup
            );
        expect(bounds(fromBinary)).toEqual(bounds(fromObjects));
    });
});
