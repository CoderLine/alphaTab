/** @target web */
// Cost of handing the bounds lookup from the worker to the main thread, compared with the layout it
// follows: the public Map format (toJson, structured clone, fromJson + finish) against the flat
// BoundsLookupWire format the browser worker uses (encode, copy or transfer, decode + finish).
// The structured clone is split into its sender (v8.serialize) and receiver (v8.deserialize) halves.
// Node's structuredClone with a transfer list detaches the buffer like a browser postMessage, but
// v8.deserialize of a copied typed array creates a view instead of copying, so the receiver half of
// a copy is lower than in a browser.
// Run: npm run test-layout-flow -- WorkerBounds   (LAYOUT_FLOW_RUNS=<n> changes the repetitions)
import fs from 'node:fs';
import path from 'node:path';
import v8 from 'node:v8';
import { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { BoundsLookupWire } from '@coderline/alphatab/rendering/utils/BoundsLookupWire';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { AllocationSampler } from './AllocationSampler';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

function median(values: number[]) {
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

function timed(runs: number, action: () => void, before?: () => void): number {
    for (let i = 0; i < 3; i++) {
        before?.();
        action();
    }
    const times: number[] = [];
    for (let i = 0; i < runs; i++) {
        before?.();
        const t = performance.now();
        action();
        times.push(performance.now() - t);
    }
    return median(times);
}

function countBounds(lookup: BoundsLookup) {
    let systems = 0;
    let masterBars = 0;
    let bars = 0;
    let beats = 0;
    let notes = 0;
    for (const s of lookup.staffSystems) {
        systems++;
        for (const mb of s.bars) {
            masterBars++;
            for (const b of mb.bars) {
                bars++;
                for (const beat of b.beats) {
                    beats++;
                    notes += beat.notes?.length ?? 0;
                }
            }
        }
    }
    const boundsObjects = systems * 2 + masterBars * 3 + bars * 2 + beats * 2 + notes;
    return { systems, masterBars, bars, beats, notes, boundsObjects };
}

function plain(value: unknown): unknown {
    if (value instanceof Map) {
        const o: Record<string, unknown> = {};
        for (const [k, v] of value) {
            o[k] = plain(v);
        }
        return o;
    }
    if (Array.isArray(value)) {
        return value.map(plain);
    }
    return value;
}

describe('WorkerBounds', () => {
    const root = process.cwd();
    const runs = Number(process.env.LAYOUT_FLOW_RUNS ?? 10);
    const lines: string[] = [];

    for (const ref of LayoutCorpus.referenceScores) {
        for (const includeNoteBounds of [false, true]) {
            it(`${ref.name}${includeNoteBounds ? ' +notes' : ''}`, () => {
                const file = path.join(root, ref.file);
                const out: string[] = [`## ${ref.name} (${ref.file}) includeNoteBounds=${includeNoteBounds}`];
                const row = (label: string, ms: number, bytes?: number) => {
                    const alloc = bytes === undefined ? '' : `, ${AllocationSampler.mb(bytes)}`;
                    out.push(`  ${label.padEnd(34)} ${`${ms.toFixed(2)} ms`.padStart(10)}${alloc}`);
                };

                const h = new LayoutHarness(new Settings());
                h.settings.core.includeNoteBounds = includeNoteBounds;
                h.paint = false;
                const score = LayoutHarness.loadScore(file, h.settings);
                h.render(score, null, 1300);
                const lookup = h.renderer.boundsLookup!;
                const c = countBounds(lookup);
                out.push(
                    `systems=${c.systems} masterBars=${c.masterBars} bars=${c.bars} beats=${c.beats} notes=${c.notes} bounds=${c.boundsObjects}`
                );

                const resizeMs =
                    timed(runs, () => {
                        h.resize(1000);
                        h.resize(1300);
                    }) / 2;
                out.push(`resize (no paint, for scale): ${resizeMs.toFixed(1)} ms`);

                const json = lookup.toJson();
                const jsonBytes = v8.serialize(json);
                const cloned = structuredClone(json);
                out.push(
                    `nested Map format (public toJson/fromJson): ${(jsonBytes.byteLength / 1048576).toFixed(1)} MB`
                );
                row(
                    'toJson (worker)',
                    timed(runs, () => lookup.toJson()),
                    AllocationSampler.measure(() => lookup.toJson()).totalBytes
                );
                row(
                    'structuredClone (both)',
                    timed(runs, () => structuredClone(json)),
                    AllocationSampler.measure(() => structuredClone(json)).totalBytes
                );
                row(
                    '  serialize half (worker)',
                    timed(runs, () => v8.serialize(json))
                );
                row(
                    '  deserialize half (main)',
                    timed(runs, () => v8.deserialize(jsonBytes))
                );
                row(
                    'fromJson + finish (main)',
                    timed(runs, () => BoundsLookup.fromJson(cloned, score)!.finish()),
                    AllocationSampler.measure(() => BoundsLookup.fromJson(cloned, score)!.finish()).totalBytes
                );

                const wire = BoundsLookupWire.encode(lookup);
                const viaJson = JSON.stringify(plain(BoundsLookup.fromJson(cloned, score)!.toJson()));
                const viaWire = JSON.stringify(plain(BoundsLookupWire.decode(structuredClone(wire), score).toJson()));
                if (viaJson !== viaWire) {
                    throw new Error('wire format does not round-trip like toJson');
                }
                out.push(
                    `BoundsLookupWire (worker path): ${wire.length} numbers (${(wire.byteLength / 1048576).toFixed(1)} MB)`
                );
                row(
                    'encode (worker)',
                    timed(runs, () => BoundsLookupWire.encode(lookup)),
                    AllocationSampler.measure(() => BoundsLookupWire.encode(lookup)).totalBytes
                );
                row(
                    'structuredClone, copied (both)',
                    timed(runs, () => structuredClone(wire))
                );
                let transferable = wire.slice();
                row(
                    'structuredClone, transferred',
                    timed(
                        runs,
                        () => structuredClone(transferable, { transfer: [transferable.buffer] }),
                        () => {
                            transferable = wire.slice();
                        }
                    )
                );
                row(
                    'decode + finish (main)',
                    timed(runs, () => BoundsLookupWire.decode(wire, score).finish()),
                    AllocationSampler.measure(() => BoundsLookupWire.decode(wire, score).finish()).totalBytes
                );

                console.log(out.join('\n'));
                lines.push(...out, '');
            });
        }
    }

    it('report', () => {
        const dir = LayoutCorpus.outDir(root);
        fs.writeFileSync(path.join(dir, 'worker-bounds.txt'), lines.join('\n'));
        console.log(`report written to ${dir}`);
    });
});
