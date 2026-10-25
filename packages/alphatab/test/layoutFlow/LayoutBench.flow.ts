/** @target web */
// Timings, per-stage call counts and allocations of initial layout and resize on the reference scores.
// Run: npm run test-layout-flow -- LayoutBench   (LAYOUT_FLOW_RUNS=<n> changes the repetitions)
import fs from 'node:fs';
import path from 'node:path';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { AllocationSampler } from './AllocationSampler';
import { CallProbe } from './CallProbe';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

function percentile(sorted: number[], p: number) {
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

function timings(values: number[]) {
    const sorted = values.slice().sort((a, b) => a - b);
    return `p50=${percentile(sorted, 0.5).toFixed(1)} ms p95=${percentile(sorted, 0.95).toFixed(1)} ms`;
}

describe('LayoutBench', () => {
    const root = process.cwd();
    const runs = Number(process.env.LAYOUT_FLOW_RUNS ?? 20);
    const lines: string[] = [];
    const json: Record<string, unknown> = {};

    for (const ref of LayoutCorpus.referenceScores) {
        it(ref.name, () => {
            const file = path.join(root, ref.file);
            const newHarness = () => {
                const h = new LayoutHarness(new Settings());
                h.paint = false;
                return h;
            };
            const load = (h: LayoutHarness) => LayoutHarness.loadScore(file, h.settings);
            const entry: Record<string, unknown> = {};
            const out: string[] = [`## ${ref.name} (${ref.file})`];

            // initial layout: fresh renderer per run, score loading excluded
            const initial: number[] = [];
            for (let i = 0; i < Math.max(3, Math.floor(runs / 2)) + 2; i++) {
                const h = newHarness();
                const score = load(h);
                const t = performance.now();
                h.render(score, null, 1300);
                if (i >= 2) {
                    initial.push(performance.now() - t);
                }
            }

            // resize: alternate between two widths on one renderer
            const h = newHarness();
            h.render(load(h), null, 1300);
            const widths = [1000, 1300];
            for (let i = 0; i < 5; i++) {
                h.resize(widths[i % 2]);
            }
            const resize: number[] = [];
            for (let i = 0; i < runs; i++) {
                const t = performance.now();
                h.resize(widths[i % 2]);
                resize.push(performance.now() - t);
            }
            const layout = h.renderer.layout!;
            const bars = h.renderer.score!.masterBars.length;
            const renderers = layout.systems.reduce((n, s) => n + s.allStaves.length * s.masterBarsRenderers.length, 0);
            out.push(`masterBars=${bars} systems@1300=${layout.systems.length} barRenderers=${renderers}`);
            out.push(`initial layout (no paint): ${timings(initial)}`);
            out.push(`resize 1000<->1300 (no paint): ${timings(resize)}`);
            entry.masterBars = bars;
            entry.systems = layout.systems.length;
            entry.barRenderers = renderers;
            entry.initialMs = initial;
            entry.resizeMs = resize;

            // stage breakdown and call counts of one pass each
            const hp = newHarness();
            const score = load(hp);
            CallProbe.start();
            hp.render(score, null, 1300);
            const initialProbe = CallProbe.stop();
            out.push('initial layout stages:');
            out.push(...CallProbe.format(initialProbe).map(l => `  ${l}`));
            hp.resize(1000);
            CallProbe.start();
            hp.resize(1300);
            const resizeProbe = CallProbe.stop();
            out.push('resize stages (1000 -> 1300):');
            out.push(...CallProbe.format(resizeProbe).map(l => `  ${l}`));
            const probeJson = (stats: typeof initialProbe) =>
                stats.map(s => ({
                    name: s.name,
                    calls: s.calls,
                    receivers: s.receivers,
                    maxPerReceiver: s.maxPerReceiver,
                    repeatedReceivers: s.repeatedReceivers,
                    ms: s.totalMs
                }));
            entry.initialStages = probeJson(initialProbe);
            entry.resizeStages = probeJson(resizeProbe);

            // allocations
            const ha = newHarness();
            const allocScore = load(ha);
            const initialAlloc = AllocationSampler.measure(() => ha.render(allocScore, null, 1300));
            ha.resize(1000);
            const resizeAlloc = AllocationSampler.measure(() => ha.resize(1300));
            out.push(
                `allocated: initial layout ≈ ${AllocationSampler.mb(initialAlloc.totalBytes)}, resize ≈ ${AllocationSampler.mb(resizeAlloc.totalBytes)}`
            );
            out.push('top allocation sites (resize):');
            out.push(...resizeAlloc.topSites.map(s => `  ${AllocationSampler.mb(s.bytes).padStart(9)}  ${s.site}`));
            out.push('top allocation sites (initial layout):');
            out.push(...initialAlloc.topSites.map(s => `  ${AllocationSampler.mb(s.bytes).padStart(9)}  ${s.site}`));
            entry.initialAllocBytes = initialAlloc.totalBytes;
            entry.resizeAllocBytes = resizeAlloc.totalBytes;
            entry.resizeAllocSites = resizeAlloc.topSites;
            entry.initialAllocSites = initialAlloc.topSites;

            console.log(out.join('\n'));
            lines.push(...out, '');
            json[ref.name] = entry;
        });
    }

    it('report', () => {
        const dir = LayoutCorpus.outDir(root);
        fs.writeFileSync(path.join(dir, 'layout-bench.txt'), lines.join('\n'));
        fs.writeFileSync(path.join(dir, 'layout-bench.json'), JSON.stringify(json, null, 2));
        console.log(`report written to ${dir}`);
    });
});
