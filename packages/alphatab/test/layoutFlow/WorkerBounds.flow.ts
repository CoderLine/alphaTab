/** @target web */
// Cost of handing the bounds lookup from the worker to the main thread (toJson, structured clone as
// done by postMessage, fromJson + finish), compared with the layout it follows.
// Run: npm run test-layout-flow -- WorkerBounds   (LAYOUT_FLOW_RUNS=<n> changes the repetitions)
import fs from 'node:fs';
import path from 'node:path';
import type { Score } from '@coderline/alphatab/model/Score';
import { BarBounds } from '@coderline/alphatab/rendering/utils/BarBounds';
import { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { MasterBarBounds } from '@coderline/alphatab/rendering/utils/MasterBarBounds';
import { NoteBounds } from '@coderline/alphatab/rendering/utils/NoteBounds';
import { StaffSystemBounds } from '@coderline/alphatab/rendering/utils/StaffSystemBounds';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { AllocationSampler } from './AllocationSampler';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

function median(values: number[]) {
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

function timed(runs: number, action: () => void): number {
    for (let i = 0; i < 3; i++) {
        action();
    }
    const times: number[] = [];
    for (let i = 0; i < runs; i++) {
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

// Prototype of a flat numeric wire format: same content as toJson, depth-first, counts before children.
function pushBounds(out: number[], b: Bounds) {
    out.push(b.x, b.y, b.w, b.h);
}

function toWire(lookup: BoundsLookup): Float64Array {
    const out: number[] = [lookup.staffSystems.length];
    for (const system of lookup.staffSystems) {
        pushBounds(out, system.visualBounds);
        pushBounds(out, system.realBounds);
        out.push(system.bars.length);
        for (const mb of system.bars) {
            pushBounds(out, mb.lineAlignedBounds);
            pushBounds(out, mb.visualBounds);
            pushBounds(out, mb.realBounds);
            out.push(mb.index, mb.isFirstOfLine ? 1 : 0, mb.bars.length);
            for (const bar of mb.bars) {
                pushBounds(out, bar.visualBounds);
                pushBounds(out, bar.realBounds);
                out.push(bar.bar.staff.track.index, bar.bar.staff.index, bar.bar.index, bar.beats.length);
                for (const beat of bar.beats) {
                    pushBounds(out, beat.visualBounds);
                    pushBounds(out, beat.realBounds);
                    const m = beat.beat;
                    out.push(
                        beat.onNotesX,
                        m.voice.bar.staff.track.index,
                        m.voice.bar.staff.index,
                        m.voice.bar.index,
                        m.voice.index,
                        m.index,
                        beat.notes ? beat.notes.length : -1
                    );
                    if (beat.notes) {
                        for (const n of beat.notes) {
                            out.push(n.note.index);
                            pushBounds(out, n.noteHeadBounds);
                        }
                    }
                }
            }
        }
    }
    return new Float64Array(out);
}

function fromWire(data: Float64Array, score: Score): BoundsLookup {
    let i = 0;
    const bounds = () => {
        const b = new Bounds(data[i], data[i + 1], data[i + 2], data[i + 3]);
        i += 4;
        return b;
    };
    const lookup = new BoundsLookup();
    const systemCount = data[i++];
    for (let s = 0; s < systemCount; s++) {
        const sg = new StaffSystemBounds();
        sg.visualBounds = bounds();
        sg.realBounds = bounds();
        lookup.addStaffSystem(sg);
        const mbCount = data[i++];
        for (let m = 0; m < mbCount; m++) {
            const mb = new MasterBarBounds();
            mb.lineAlignedBounds = bounds();
            mb.visualBounds = bounds();
            mb.realBounds = bounds();
            mb.index = data[i++];
            mb.isFirstOfLine = data[i++] === 1;
            lookup.addMasterBar(mb);
            const barCount = data[i++];
            for (let b = 0; b < barCount; b++) {
                const bb = new BarBounds();
                bb.visualBounds = bounds();
                bb.realBounds = bounds();
                const barTrack = data[i++];
                const barStaff = data[i++];
                bb.bar = score.tracks[barTrack].staves[barStaff].bars[data[i++]];
                mb.addBar(bb);
                const beatCount = data[i++];
                for (let k = 0; k < beatCount; k++) {
                    const beat = new BeatBounds();
                    beat.visualBounds = bounds();
                    beat.realBounds = bounds();
                    beat.onNotesX = data[i++];
                    const track = data[i++];
                    const staff = data[i++];
                    const barIndex = data[i++];
                    const voice = data[i++];
                    const beatIndex = data[i++];
                    beat.beat = score.tracks[track].staves[staff].bars[barIndex].voices[voice].beats[beatIndex];
                    const noteCount = data[i++];
                    if (noteCount >= 0) {
                        beat.notes = [];
                        for (let n = 0; n < noteCount; n++) {
                            const nb = new NoteBounds();
                            nb.note = beat.beat.notes[data[i++]];
                            nb.noteHeadBounds = bounds();
                            beat.addNote(nb);
                        }
                    }
                    bb.addBeat(beat);
                }
            }
        }
    }
    return lookup;
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
        it(ref.name, () => {
            const file = path.join(root, ref.file);
            const out: string[] = [`## ${ref.name} (${ref.file})`];

            const h = new LayoutHarness(new Settings());
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

            const json = lookup.toJson();
            const toJsonMs = timed(runs, () => lookup.toJson());
            const cloneMs = timed(runs, () => structuredClone(json));
            const cloned = structuredClone(json);
            const fromJsonMs = timed(runs, () => BoundsLookup.fromJson(cloned, score)!.finish());

            const toJsonAlloc = AllocationSampler.measure(() => lookup.toJson());
            const cloneAlloc = AllocationSampler.measure(() => structuredClone(json));
            const fromJsonAlloc = AllocationSampler.measure(() => BoundsLookup.fromJson(cloned, score)!.finish());

            const wire = toWire(lookup);
            const viaJson = JSON.stringify(plain(BoundsLookup.fromJson(cloned, score)!.toJson()));
            const viaWire = JSON.stringify(plain(fromWire(structuredClone(wire), score).toJson()));
            if (viaJson !== viaWire) {
                throw new Error('wire format does not round-trip like toJson');
            }
            const toWireMs = timed(runs, () => toWire(lookup));
            const wireCloneMs = timed(runs, () => structuredClone(wire));
            const fromWireMs = timed(runs, () => fromWire(wire, score).finish());
            const toWireAlloc = AllocationSampler.measure(() => toWire(lookup));
            const fromWireAlloc = AllocationSampler.measure(() => fromWire(wire, score).finish());

            out.push(`resize (no paint, for scale): ${resizeMs.toFixed(1)} ms`);
            out.push(`flat wire prototype: ${wire.length} numbers (${(wire.byteLength / 1048576).toFixed(1)} MB)`);
            out.push(
                `  toWire (worker):          ${toWireMs.toFixed(1)} ms, ${AllocationSampler.mb(toWireAlloc.totalBytes)}`
            );
            out.push(`  structuredClone (both):   ${wireCloneMs.toFixed(2)} ms (transfer would be zero-copy)`);
            out.push(
                `  fromWire + finish (main): ${fromWireMs.toFixed(1)} ms, ${AllocationSampler.mb(fromWireAlloc.totalBytes)}`
            );
            out.push('nested Map format (current):');
            out.push(
                `toJson (worker):            ${toJsonMs.toFixed(1)} ms, ${AllocationSampler.mb(toJsonAlloc.totalBytes)}`
            );
            out.push(
                `structuredClone (both):     ${cloneMs.toFixed(1)} ms, ${AllocationSampler.mb(cloneAlloc.totalBytes)}`
            );
            out.push(
                `fromJson + finish (main):   ${fromJsonMs.toFixed(1)} ms, ${AllocationSampler.mb(fromJsonAlloc.totalBytes)}`
            );
            out.push('top sites toJson:');
            out.push(
                ...toJsonAlloc.topSites
                    .slice(0, 6)
                    .map(s => `  ${AllocationSampler.mb(s.bytes).padStart(9)}  ${s.site}`)
            );
            out.push('top sites fromJson:');
            out.push(
                ...fromJsonAlloc.topSites
                    .slice(0, 6)
                    .map(s => `  ${AllocationSampler.mb(s.bytes).padStart(9)}  ${s.site}`)
            );

            console.log(out.join('\n'));
            lines.push(...out, '');
        });
    }

    it('report', () => {
        const dir = LayoutCorpus.outDir(root);
        fs.writeFileSync(path.join(dir, 'worker-bounds.txt'), lines.join('\n'));
        console.log(`report written to ${dir}`);
    });
});
