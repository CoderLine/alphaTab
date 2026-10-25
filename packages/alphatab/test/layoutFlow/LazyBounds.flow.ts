/** @target web */
// What a lazy or compact bounds lookup could save, and what building one system on demand costs:
// census of the lookup, full and per-system rebuild cost, whether a rebuild after layout and paint
// reproduces the eager lookup, and the shares the API-free trims could remove.
// Run: npm run test-layout-flow -- LazyBounds   (LAYOUT_FLOW_RUNS=<n> changes the repetitions)
import fs from 'node:fs';
import path from 'node:path';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import type { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { AllocationSampler } from './AllocationSampler';
import { CpuSampler } from './CpuSampler';
import { HeapCensus } from './HeapCensus';
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

function firstDiff(a: unknown, b: unknown, at: string): string | null {
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return a === b ? null : `${at}: ${String(a)} vs ${String(b)}`;
    }
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    if (ka.length !== kb.length) {
        return `${at}: ${ka.length} vs ${kb.length} entries`;
    }
    for (const k of ka) {
        const d = firstDiff((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${at}.${k}`);
        if (d) {
            return d;
        }
    }
    return null;
}

function compare(a: BoundsLookup, b: BoundsLookup): string {
    const d = firstDiff(plain(a.toJson()), plain(b.toJson()), 'lookup');
    return d === null ? 'equal' : `differs at ${d}`;
}

const boundsTypes = new Set([
    'Bounds',
    'BeatBounds',
    'BarBounds',
    'MasterBarBounds',
    'StaffSystemBounds',
    'NoteBounds'
]);

function same(a: Bounds, b: Bounds) {
    return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

function isSmi(v: number) {
    return Number.isInteger(v) && Math.abs(v) < 2 ** 30;
}

function systemsOf(h: LayoutHarness): StaffSystem[] {
    return (h.renderer.layout as unknown as Record<string, StaffSystem[]>)['_systems'];
}

function rebuild(h: LayoutHarness, systems: StaffSystem[]): BoundsLookup {
    const lookup = new BoundsLookup();
    h.renderer.boundsLookup = lookup;
    for (const s of systems) {
        s.buildBoundingsLookup(0, 0);
    }
    lookup.finish(h.settings.display.scale);
    return lookup;
}

function census(lookup: BoundsLookup) {
    const c = {
        systems: lookup.staffSystems.length,
        masterBars: 0,
        bars: 0,
        beats: 0,
        notes: 0,
        beatIds: 0,
        beatIdsMulti: 0,
        barVisualEqualsReal: 0,
        beatVisualEqualsReal: 0,
        beatYhEqualsBar: 0,
        fractionalDoubles: 0,
        doubles: 0,
        beatsPerSystem: [] as number[]
    };
    const ids = new Map<number, number>();
    const count = (b: Bounds) => {
        for (const v of [b.x, b.y, b.w, b.h]) {
            c.doubles++;
            if (!isSmi(v)) {
                c.fractionalDoubles++;
            }
        }
    };
    for (const s of lookup.staffSystems) {
        count(s.visualBounds);
        count(s.realBounds);
        let beatsInSystem = 0;
        for (const mb of s.bars) {
            c.masterBars++;
            count(mb.visualBounds);
            count(mb.realBounds);
            count(mb.lineAlignedBounds);
            for (const bar of mb.bars) {
                c.bars++;
                count(bar.visualBounds);
                count(bar.realBounds);
                if (same(bar.visualBounds, bar.realBounds)) {
                    c.barVisualEqualsReal++;
                }
                for (const beat of bar.beats) {
                    c.beats++;
                    beatsInSystem++;
                    count(beat.visualBounds);
                    count(beat.realBounds);
                    if (same(beat.visualBounds, beat.realBounds)) {
                        c.beatVisualEqualsReal++;
                    }
                    if (
                        beat.realBounds.y === bar.realBounds.y &&
                        beat.realBounds.h === bar.realBounds.h &&
                        beat.visualBounds.y === bar.visualBounds.y &&
                        beat.visualBounds.h === bar.visualBounds.h
                    ) {
                        c.beatYhEqualsBar++;
                    }
                    ids.set(beat.beat.id, (ids.get(beat.beat.id) ?? 0) + 1);
                    if (beat.notes) {
                        c.notes += beat.notes.length;
                        for (const n of beat.notes) {
                            count(n.noteHeadBounds);
                        }
                    }
                }
            }
        }
        c.beatsPerSystem.push(beatsInSystem);
    }
    c.beatIds = ids.size;
    for (const v of ids.values()) {
        if (v > 1) {
            c.beatIdsMulti++;
        }
    }
    return c;
}

// Bytes of single objects, measured by allocating many of them.
function unitSizes() {
    const n = 200000;
    const keep: unknown[] = new Array(n);
    const frac = (i: number) => i * 0.37 + 0.1;
    const bounds = AllocationSampler.measure(() => {
        for (let i = 0; i < n; i++) {
            keep[i] = new Bounds(frac(i), frac(i + 1), frac(i + 2), frac(i + 3));
        }
    }, 256).totalBytes;
    const boundsSmi = AllocationSampler.measure(() => {
        for (let i = 0; i < n; i++) {
            keep[i] = new Bounds(i, i + 1, i + 2, i + 3);
        }
    }, 256).totalBytes;
    const singleArray = AllocationSampler.measure(() => {
        for (let i = 0; i < n; i++) {
            keep[i] = [keep];
        }
    }, 256).totalBytes;
    keep.length = 0;
    return { bounds: bounds / n, boundsSmi: boundsSmi / n, singleArray: singleArray / n };
}

describe('LazyBounds', () => {
    const root = process.cwd();
    const runs = Number(process.env.LAYOUT_FLOW_RUNS ?? 10);
    const lines: string[] = [];
    const units = unitSizes();
    lines.push(
        `unit sizes: Bounds (fractional) ${units.bounds.toFixed(0)} B, Bounds (small ints) ${units.boundsSmi.toFixed(0)} B, [x] ${units.singleArray.toFixed(0)} B`,
        ''
    );

    for (const ref of LayoutCorpus.referenceScores) {
        for (const noteBounds of [false, true]) {
            it(`${ref.name} noteBounds=${noteBounds}`, () => {
                const file = path.join(root, ref.file);
                const out: string[] = [`## ${ref.name} includeNoteBounds=${noteBounds}`];
                const settings = new Settings();
                settings.core.includeNoteBounds = noteBounds;
                const h = new LayoutHarness(settings);
                h.paint = false;
                const score = LayoutHarness.loadScore(file, h.settings);

                const renderAlloc = AllocationSampler.measure(() => h.render(score, null, 1300));
                const eager = h.renderer.boundsLookup!;
                const systems = systemsOf(h);
                const c = census(eager);
                const bps = c.beatsPerSystem;
                out.push(
                    `systems=${c.systems} masterBars=${c.masterBars} bars=${c.bars} beats=${c.beats} notes=${c.notes} beatIds=${c.beatIds} (ids with >1 bounds: ${c.beatIdsMulti})`,
                    `beats per system: median ${median(bps)}, max ${Math.max(...bps)}`
                );

                const rebuiltAfterLayout = compare(rebuild(h, systems), eager);
                h.renderer.boundsLookup = eager;

                const fullMs = timed(runs, () => rebuild(h, systems));
                const fullAlloc = AllocationSampler.measure(() => rebuild(h, systems));
                const fullCpu = CpuSampler.measure(() => {
                    for (let i = 0; i < 5; i++) {
                        rebuild(h, systems);
                    }
                });

                const perSystem: number[] = [];
                for (const s of systems) {
                    const t = timed(Math.max(3, runs >> 1), () => {
                        h.renderer.boundsLookup = new BoundsLookup();
                        s.buildBoundingsLookup(0, 0);
                    });
                    perSystem.push(t);
                }
                h.renderer.boundsLookup = eager;

                const resizeAlloc = AllocationSampler.measure(() => {
                    h.resize(1000);
                    h.resize(1300);
                });
                const resizeMs =
                    timed(runs, () => {
                        h.resize(1000);
                        h.resize(1300);
                    }) / 2;
                const resizeCpu = CpuSampler.measure(() => {
                    h.resize(1000);
                    h.resize(1300);
                });
                const resized = h.renderer.boundsLookup!;
                const rebuiltAfterResize = compare(rebuild(h, systemsOf(h)), resized);
                h.renderer.boundsLookup = resized;

                const painted = new LayoutHarness(settings);
                painted.render(LayoutHarness.loadScore(file, painted.settings), null, 1300);
                const paintedEager = painted.renderer.boundsLookup!;
                const rebuiltAfterPaint = compare(rebuild(painted, systemsOf(painted)), paintedEager);
                painted.resize(1000);
                painted.resize(1300);
                const paintedResized = compare(painted.renderer.boundsLookup!, paintedEager);

                const mb = AllocationSampler.mb;
                const cpuTop = (r: { self: { top(n: number): [string, number][] } }, n: number) =>
                    r.self.top(n).map(([site, ms]) => `  ${ms.toFixed(1).padStart(7)} ms  ${site}`);
                out.push(
                    `rebuild after layout vs eager: ${rebuiltAfterLayout}`,
                    `rebuild after resize vs resized: ${rebuiltAfterResize}`,
                    `rebuild after paint vs eager: ${rebuiltAfterPaint}`,
                    `painted, eager lookup after resize 1000 -> 1300 vs initial 1300: ${paintedResized}`,
                    `initial layout 1300 (no paint): ${mb(renderAlloc.totalBytes)}, of it stage 'bounds lookup' ${mb(renderAlloc.byStage.values.get('bounds lookup') ?? 0)}`,
                    `resize 1000+1300 (no paint): ${mb(resizeAlloc.totalBytes / 2)} per resize, of it 'bounds lookup' ${mb((resizeAlloc.byStage.values.get('bounds lookup') ?? 0) / 2)}; ${resizeMs.toFixed(1)} ms per resize, 'bounds lookup' CPU ${((resizeCpu.byStage.values.get('bounds lookup') ?? 0) / 2).toFixed(1)} of ${(resizeCpu.totalMs / 2).toFixed(1)} ms sampled`,
                    `full rebuild of all systems: ${fullMs.toFixed(2)} ms, ${mb(fullAlloc.totalBytes)} allocated`,
                    `one system on demand: median ${median(perSystem).toFixed(3)} ms, max ${Math.max(...perSystem).toFixed(3)} ms, ${mb(fullAlloc.totalBytes / c.systems)} avg alloc`,
                    'top sites of a full rebuild:',
                    ...fullAlloc.topSites.slice(0, 6).map(s => `  ${mb(s.bytes).padStart(9)}  ${s.site}`),
                    'CPU self of 5 full rebuilds:',
                    ...cpuTop(fullCpu, 6)
                );

                const barShare = c.barVisualEqualsReal * units.bounds;
                const beatShare = c.beatVisualEqualsReal * units.bounds;
                const arrays = (c.beatIds - c.beatIdsMulti) * units.singleArray;
                out.push(
                    'API-free trims (estimates from counts x unit sizes):',
                    `  bar visual === real: ${c.barVisualEqualsReal}/${c.bars} -> ${mb(barShare)}`,
                    `  beat visual === real: ${c.beatVisualEqualsReal}/${c.beats} -> ${mb(beatShare)}`,
                    `  beat y/h equal to bar y/h: ${c.beatYhEqualsBar}/${c.beats}`,
                    `  single-entry beat lookup arrays: ${c.beatIds - c.beatIdsMulti} -> ${mb(arrays)}`,
                    `  fractional doubles (boxed): ${c.fractionalDoubles}/${c.doubles}`
                );

                console.log(out.join('\n'));
                lines.push(...out, '');
            });
        }
    }

    for (const ref of LayoutCorpus.referenceScores) {
        for (const noteBounds of [false, true]) {
            it(`retained ${ref.name} noteBounds=${noteBounds}`, () => {
                const settings = new Settings();
                settings.core.includeNoteBounds = noteBounds;
                const h = new LayoutHarness(settings);
                h.paint = false;
                h.render(LayoutHarness.loadScore(path.join(root, ref.file), h.settings), null, 1300);
                const systems = systemsOf(h);
                const previous = h.renderer.boundsLookup!;
                const c = census(previous);
                const expectedBounds = c.systems * 2 + c.masterBars * 3 + c.bars * 2 + c.beats * 2 + c.notes;
                const before = HeapCensus.take();
                const kept = rebuild(h, systems);
                const after = HeapCensus.take();
                const diff = HeapCensus.diff(before, after);
                const own = diff.filter(e => boundsTypes.has(e.name));
                const owned = diff.filter(
                    e => e.name.startsWith('  ') && /Bounds/.test(e.name) && !/Glyph|Renderer/.test(e.name)
                );
                const total = [...own, ...owned].reduce((s, e) => s + e.selfBytes, 0);
                const boundsCount = own.find(e => e.name === 'Bounds')?.count ?? 0;
                const out = [
                    `## retained by one lookup: ${ref.name} includeNoteBounds=${noteBounds}: ${AllocationSampler.mb(total)}, ${own.reduce((s, e) => s + e.count, 0)} bounds objects (Bounds ${boundsCount}, expected ${expectedBounds}; ${previous !== kept ? 'two lookups alive' : 'same lookup'})`,
                    ...[...own, ...owned]
                        .slice(0, 16)
                        .map(
                            e =>
                                `  ${AllocationSampler.mb(e.selfBytes).padStart(9)} ${String(e.count).padStart(7)}  ${e.name.trim()}`
                        )
                ];
                console.log(out.join('\n'));
                lines.push(...out, '');
            });
        }
    }

    it('horizontal layout', () => {
        const ref = LayoutCorpus.referenceScores[2];
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        const h = new LayoutHarness(settings);
        h.paint = false;
        const score = LayoutHarness.loadScore(path.join(root, ref.file), h.settings);
        const alloc = AllocationSampler.measure(() => h.render(score, null, 1300));
        const c = census(h.renderer.boundsLookup!);
        const out = [
            `## ${ref.name} horizontal layout`,
            `partials=${h.partialIds.length} layout systems=${systemsOf(h).length} lookup staffSystems=${c.systems} beats=${c.beats} beatIds=${c.beatIds}`,
            `initial layout: ${AllocationSampler.mb(alloc.totalBytes)}, of it 'bounds lookup' ${AllocationSampler.mb(alloc.byStage.values.get('bounds lookup') ?? 0)}`
        ];
        console.log(out.join('\n'));
        lines.push(...out, '');
    });

    it('report', () => {
        const dir = LayoutCorpus.outDir(root);
        fs.writeFileSync(path.join(dir, 'lazy-bounds.txt'), lines.join('\n'));
        console.log(`report written to ${dir}`);
    });
});
