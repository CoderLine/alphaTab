/** @target web */
// Where the layout spends its time: CPU profile per pipeline stage and per function for initial
// layout, resize and paint, without probes installed. Run: npm run test-layout-flow -- TraversalCpu
import fs from 'node:fs';
import path from 'node:path';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { type CpuReport, CpuSampler } from './CpuSampler';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';
import type { Tally } from './StageClassifier';

function table(t: Tally, n: number, total: number, runs: number): string[] {
    return t
        .top(n)
        .map(
            ([k, v]) =>
                `    ${(v / runs).toFixed(2).padStart(8)} ms  ${((v / total) * 100).toFixed(1).padStart(5)}%  ${k}`
        );
}

function cpuReport(title: string, r: CpuReport, runs: number, out: string[]) {
    out.push(`### ${title}: ${(r.totalMs / runs).toFixed(1)} ms per pass (sampled over ${runs} passes)`);
    out.push('  by stage:');
    out.push(...table(r.byStage, 12, r.totalMs, runs));
    out.push('  top self time:');
    out.push(...table(r.self, 35, r.totalMs, runs));
    out.push('  top inclusive time:');
    out.push(...table(r.inclusive, 30, r.totalMs, runs));
}

describe('TraversalCpu', () => {
    const root = process.cwd();
    const lines: string[] = [];
    const refs = LayoutCorpus.referenceScores.filter(
        r => !process.env.LAYOUT_FLOW_FILE || r.file.includes(process.env.LAYOUT_FLOW_FILE)
    );
    const runs = Number(process.env.LAYOUT_FLOW_RUNS ?? 8);

    for (const ref of refs) {
        it(ref.name, () => {
            const out: string[] = [`## ${ref.name} (${ref.file})`];
            const file = path.join(root, ref.file);
            const fresh = () => {
                const h = new LayoutHarness(new Settings());
                h.paint = false;
                return { h, score: LayoutHarness.loadScore(file, h.settings) };
            };

            // warm-up
            for (let i = 0; i < 3; i++) {
                const { h, score } = fresh();
                h.render(score, null, 1300);
                h.resize(1000);
            }

            // CPU: initial layout (score loading outside the profile)
            const passes = Array.from({ length: runs }, () => fresh());
            const initial = CpuSampler.measure(() => {
                for (const p of passes) {
                    p.h.render(p.score, null, 1300);
                }
            });
            cpuReport('initial layout 1300 (no paint)', initial, runs, out);

            const hr = passes[0].h;
            const resize = CpuSampler.measure(() => {
                for (let i = 0; i < runs * 2; i++) {
                    hr.resize(i % 2 === 0 ? 1000 : 1300);
                }
            });
            cpuReport('resize 1000 <-> 1300 (no paint)', resize, runs * 2, out);

            const ids = () => passes[1].h.partialIds;
            const paint = CpuSampler.measure(() => {
                for (let i = 0; i < Math.max(1, runs / 2); i++) {
                    for (const id of ids()) {
                        passes[1].h.renderer.renderResult(id);
                    }
                }
            });
            cpuReport('paint all partials (svg engine)', paint, Math.max(1, runs / 2), out);

            console.log(out.slice(0, 12).join('\n'));
            lines.push(...out, '');
        });
    }

    it('report', () => {
        const target = path.join(LayoutCorpus.outDir(root), 'traversal-cpu.txt');
        fs.writeFileSync(target, lines.join('\n'));
        console.log(`report written to ${target}`);
    });
});
