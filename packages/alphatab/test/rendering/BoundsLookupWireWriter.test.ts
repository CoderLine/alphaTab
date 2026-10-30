/** @target web */
import fs from 'node:fs';
import path from 'node:path';
import { SettingsSerializer } from '@coderline/alphatab/generated/SettingsSerializer';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { Logger } from '@coderline/alphatab/Logger';
import { LogLevel } from '@coderline/alphatab/LogLevel';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import { AlphaTabWebWorker } from '@coderline/alphatab/platform/worker/AlphaTabWebWorker';
import type {
    IAlphaTabWorkerGlobalScope,
    IAlphaTabWorkerMessage
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { BoundsLookupWire } from '@coderline/alphatab/rendering/utils/BoundsLookupWire';
import { BoundsLookupWireWriter } from '@coderline/alphatab/rendering/utils/BoundsLookupWireWriter';
import { Settings } from '@coderline/alphatab/Settings';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LayoutCorpus } from '../layoutFlow/LayoutCorpus';

// The web worker writes the bounds directly in wire format; that must equal the encoded lookup a
// renderer builds without a worker, after every kind of render.
describe('BoundsLookupWireWriter', () => {
    let previousLogLevel = LogLevel.Info;
    beforeAll(() => {
        previousLogLevel = Logger.logLevel;
        Logger.logLevel = LogLevel.None;
    });
    afterAll(() => {
        Logger.logLevel = previousLogLevel;
    });

    const configurations = [
        { layoutMode: LayoutMode.Page, includeNoteBounds: false, scale: 1 },
        { layoutMode: LayoutMode.Page, includeNoteBounds: true, scale: 1 },
        { layoutMode: LayoutMode.Page, includeNoteBounds: false, scale: 1.25 },
        { layoutMode: LayoutMode.Page, includeNoteBounds: true, scale: 1.25 },
        { layoutMode: LayoutMode.Horizontal, includeNoteBounds: false, scale: 1 },
        { layoutMode: LayoutMode.Horizontal, includeNoteBounds: true, scale: 1.25 }
    ];

    function createSettings(layoutMode: LayoutMode, includeNoteBounds: boolean, scale: number): Settings {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = true;
        settings.core.includeNoteBounds = includeNoteBounds;
        settings.core.logLevel = LogLevel.None;
        settings.display.scale = scale;
        settings.display.layoutMode = layoutMode;
        return settings;
    }

    function expectSameData(label: string, actual: Float64Array | null, expected: Float64Array | null) {
        if (expected === null || actual === null) {
            expect(actual === null, label).toBe(expected === null);
            return;
        }
        expect(actual.length, label).toBe(expected.length);
        for (let i = 0; i < expected.length; i++) {
            if (!Object.is(actual[i], expected[i])) {
                expect.fail(`${label}: value ${i} differs: ${actual[i]} vs ${expected[i]}`);
            }
        }
    }

    function check(file: string, layoutMode: LayoutMode, includeNoteBounds: boolean, scale: number): boolean {
        const settings = createSettings(layoutMode, includeNoteBounds, scale);
        let score: Score;
        try {
            score = ScoreLoader.loadScoreFromBytes(new Uint8Array(fs.readFileSync(file)), settings);
        } catch {
            return false;
        }
        const objects = new ScoreRenderer(settings);
        const wire = new ScoreRenderer(createSettings(layoutMode, includeNoteBounds, scale));
        const writer = new BoundsLookupWireWriter();
        wire.boundsWriter = writer;

        const label = path.relative(process.cwd(), file);
        expectSameData(`${label} before render`, writer.encode(), null);
        const tracks = score.tracks.map(t => t.index);
        const steps: [string, (r: ScoreRenderer) => void][] = [
            [
                'render',
                r => {
                    r.width = 1300;
                    r.renderScore(score, tracks);
                }
            ],
            [
                'resize',
                r => {
                    r.width = 900;
                    r.resizeRender();
                }
            ],
            [
                'partial update',
                r => r.renderScore(score, tracks, { firstChangedMasterBar: score.masterBars.length >> 1 })
            ]
        ];
        for (const [name, step] of steps) {
            step(objects);
            step(wire);
            expect(wire.boundsLookup, `${label} ${name}`).toBeNull();
            expectSameData(
                `${label} ${name}`,
                writer.encode(),
                objects.boundsLookup ? BoundsLookupWire.encode(objects.boundsLookup) : null
            );
        }
        return true;
    }

    for (const c of configurations) {
        it(`corpus-${LayoutMode[c.layoutMode]}-notes-${c.includeNoteBounds}-scale-${c.scale}`, () => {
            let checked = 0;
            for (const file of LayoutCorpus.files(process.cwd())) {
                if (check(file, c.layoutMode, c.includeNoteBounds, c.scale)) {
                    checked++;
                }
            }
            expect(checked).toBeGreaterThan(100);
        });
    }

    it('partial-update-keeps-systems', () => {
        const settings = createSettings(LayoutMode.Page, true, 1);
        const score = ScoreLoader.loadScoreFromBytes(
            new Uint8Array(fs.readFileSync(path.join(process.cwd(), LayoutCorpus.referenceScores[0].file))),
            settings
        );
        const renderer = new ScoreRenderer(settings);
        const writer = new BoundsLookupWireWriter();
        renderer.boundsWriter = writer;
        const tracks = score.tracks.map(t => t.index);
        renderer.width = 1300;
        renderer.renderScore(score, tracks);
        const full = writer.encode()!;

        const decoded = BoundsLookupWire.decode(full, score);
        const systems = decoded.staffSystems;
        expect(systems.length).toBeGreaterThan(3);
        const firstChanged = systems[2].bars[0].index;

        writer.begin(true);
        writer.clearFromMasterBar(firstChanged);
        writer.finish(1);
        const kept = writer.encode()!;
        const keptDecoded = BoundsLookupWire.decode(kept, score);
        expect(keptDecoded.staffSystems.length).toBe(2);
        expectSameData('kept systems', kept, full.subarray(0, kept.length));

        renderer.renderScore(score, tracks, { firstChangedMasterBar: firstChanged });
        expectSameData('after partial update', writer.encode(), full);
    });

    it('partial-update-falling-back-to-full-layout', () => {
        const settings = createSettings(LayoutMode.Horizontal, true, 1);
        const score = ScoreLoader.loadScoreFromBytes(
            new Uint8Array(fs.readFileSync(path.join(process.cwd(), LayoutCorpus.referenceScores[0].file))),
            settings
        );
        const renderer = new ScoreRenderer(settings);
        const writer = new BoundsLookupWireWriter();
        renderer.boundsWriter = writer;
        const tracks = score.tracks.map(t => t.index);
        renderer.width = 1300;
        renderer.renderScore(score, tracks);
        const full = writer.encode()!;
        expect(BoundsLookupWire.decode(full, score).staffSystems.length).toBe(1);

        renderer.renderScore(score, tracks, { firstChangedMasterBar: score.masterBars.length >> 1 });
        expectSameData('after partial update', writer.encode(), full);
    });

    it('web-worker-posts-wire', () => {
        const settings = createSettings(LayoutMode.Page, true, 1);
        const score = ScoreLoader.loadScoreFromBytes(
            new Uint8Array(fs.readFileSync(path.join(process.cwd(), LayoutCorpus.referenceScores[1].file))),
            settings
        );
        const tracks = score.tracks.map(t => t.index);

        const posted: IAlphaTabWorkerMessage[] = [];
        let handler: ((e: MessageEvent<IAlphaTabWorkerMessage>) => void) | null = null;
        const scope: IAlphaTabWorkerGlobalScope<IAlphaTabWorkerMessage> = {
            postMessage: m => posted.push(m),
            addEventListener: (_, h) => {
                handler = h;
            },
            removeEventListener: () => {}
        };
        new AlphaTabWebWorker(scope);
        const send = (data: unknown) => handler!({ data } as MessageEvent<IAlphaTabWorkerMessage>);
        const lastWire = (): Float64Array => {
            const message = posted.filter(m => m.cmd === 'alphaTab.postRenderFinishedWire').pop()!;
            posted.length = 0;
            return (message as unknown as { boundsLookup: Float64Array }).boundsLookup;
        };

        const objects = new ScoreRenderer(settings);
        send({ cmd: 'alphaTab.initialize', settings: SettingsSerializer.toJsObject(settings) });
        send({ cmd: 'alphaTab.setWidth', width: 1300 });
        send({
            cmd: 'alphaTab.renderScore',
            score: JsonConverter.scoreToJsObject(score),
            trackIndexes: tracks,
            fontSizes: new Map()
        });
        objects.width = 1300;
        objects.renderScore(score, tracks);
        expect(posted.some(m => m.cmd === 'alphaTab.postRenderFinished')).toBe(false);
        expectSameData('render', lastWire(), BoundsLookupWire.encode(objects.boundsLookup!));

        send({ cmd: 'alphaTab.setWidth', width: 800 });
        send({ cmd: 'alphaTab.resizeRender' });
        objects.width = 800;
        objects.resizeRender();
        expectSameData('resize', lastWire(), BoundsLookupWire.encode(objects.boundsLookup!));

        const renderHints = { firstChangedMasterBar: score.masterBars.length >> 1 };
        send({ cmd: 'alphaTab.render', renderHints });
        objects.render(renderHints);
        expectSameData('partial update', lastWire(), BoundsLookupWire.encode(objects.boundsLookup!));
    });
});
