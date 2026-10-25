/** @target web */
// Where the layout allocates: per pipeline stage and per allocation site for initial layout,
// resize and paint, plus a census of what a finished layout keeps alive.
// Run: npm run test-layout-flow -- MemoryAnalysis   (LAYOUT_FLOW_FILE=<name> limits the scores)
import fs from 'node:fs';
import path from 'node:path';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { type AllocationReport, AllocationSampler } from './AllocationSampler';
import { HeapCensus } from './HeapCensus';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';
import type { Tally } from './StageClassifier';

const mb = AllocationSampler.mb;

function stageTable(r: AllocationReport): string[] {
    return r.byStage
        .top(20)
        .map(([k, v]) => `    ${mb(v).padStart(9)}  ${((v / r.totalBytes) * 100).toFixed(1).padStart(5)}%  ${k}`);
}

function siteTable(t: Tally, n: number, total: number): string[] {
    return t.top(n).map(([k, v]) => `    ${mb(v).padStart(9)}  ${((v / total) * 100).toFixed(1).padStart(5)}%  ${k}`);
}

function report(title: string, r: AllocationReport, out: string[]) {
    out.push(`### ${title}: ≈ ${mb(r.totalBytes)}`);
    out.push('  by stage:');
    out.push(...stageTable(r));
    out.push('  top sites:');
    out.push(...siteTable(r.bySite, 30, r.totalBytes));
    out.push('  top stage | site:');
    out.push(...siteTable(r.byStageSite, 30, r.totalBytes));
}

describe('MemoryAnalysis', () => {
    const root = process.cwd();
    const lines: string[] = [];
    const refs = LayoutCorpus.referenceScores.filter(
        r => !process.env.LAYOUT_FLOW_FILE || r.file.includes(process.env.LAYOUT_FLOW_FILE)
    );

    for (const ref of refs) {
        it(ref.name, () => {
            const out: string[] = [`## ${ref.name} (${ref.file})`];
            const file = path.join(root, ref.file);

            // warm up the JIT so the first sampled pass is representative
            for (let i = 0; i < 2; i++) {
                const w = new LayoutHarness(new Settings());
                w.paint = false;
                w.render(LayoutHarness.loadScore(file, w.settings), null, 1300);
                w.resize(1000);
            }

            const h = new LayoutHarness(new Settings());
            h.paint = false;
            const score = LayoutHarness.loadScore(file, h.settings);
            const initial = AllocationSampler.measure(() => h.render(score, null, 1300), 1024);
            report('initial layout 1300 (no paint)', initial, out);
            h.resize(1000);
            const resize = AllocationSampler.measure(() => h.resize(1300), 1024);
            report('resize 1000 -> 1300 (no paint)', resize, out);

            const hp = new LayoutHarness(new Settings());
            hp.paint = false;
            hp.render(LayoutHarness.loadScore(file, hp.settings), null, 1300);
            const ids = hp.renderer.layout!.systems.length;
            const paint = AllocationSampler.measure(() => {
                for (const id of hp.partialIds) {
                    hp.renderer.renderResult(id);
                }
            }, 1024);
            report(`paint all partials (svg engine, ${ids} systems)`, paint, out);

            // what a finished layout keeps alive (score loaded before the baseline); the snapshots of
            // the large scores exceed what can be parsed in one string, the small score is representative
            if (ref.name !== 'full-song') {
                console.log(out.slice(0, 14).join('\n'));
                lines.push(...out, '');
                return;
            }
            const census = new LayoutHarness(new Settings());
            census.paint = false;
            const censusScore = LayoutHarness.loadScore(file, census.settings);
            const before = HeapCensus.take();
            census.render(censusScore, null, 1300);
            const after = HeapCensus.take();
            const retained = HeapCensus.diff(before, after);
            const types = retained.filter(e => !e.name.startsWith('  '));
            const owners = retained.filter(e => e.name.startsWith('  '));
            const retainedBytes = types.reduce((s, e) => s + e.selfBytes, 0);
            const retainedCount = types.reduce((s, e) => s + e.count, 0);
            out.push(`### retained by the finished layout: ≈ ${mb(retainedBytes)} in ${retainedCount} objects`);
            for (const e of types.slice(0, 45)) {
                out.push(`    ${mb(e.selfBytes).padStart(9)}  ${String(e.count).padStart(8)}  ${e.name}`);
            }
            out.push('  arrays, boxed numbers, maps and sets by owner:');
            for (const e of owners.slice(0, 70)) {
                out.push(`    ${mb(e.selfBytes).padStart(9)}  ${String(e.count).padStart(8)}  ${e.name.trim()}`);
            }

            console.log(out.slice(0, 14).join('\n'));
            lines.push(...out, '');
        });
    }

    it('report', () => {
        const target = path.join(LayoutCorpus.outDir(root), 'memory-analysis.txt');
        fs.writeFileSync(target, lines.join('\n'));
        console.log(`report written to ${target}`);
    });
});
