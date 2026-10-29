/** @target web */
// The measure stage (renderer doLayout) in detail: allocation and CPU self time per site and per
// source file for the initial layout, without probes installed.
// Run: LAYOUT_FLOW_RUNS=8 npm run test-layout-flow -- MeasureProfile   (LAYOUT_FLOW_FILE=<name>)
import fs from 'node:fs';
import path from 'node:path';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { AllocationSampler } from './AllocationSampler';
import { CpuSampler } from './CpuSampler';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';
import { StageClassifier, Tally } from './StageClassifier';

const measureStage = StageClassifier.stages[0];

/** `stage | site` entries of one stage, re-keyed by site and by the site's source file. */
function ofStage(t: Tally): { bySite: Tally; byFile: Tally } {
    const bySite = new Tally();
    const byFile = new Tally();
    for (const [k, v] of t.top(1_000_000)) {
        const sep = k.indexOf(' | ');
        if (k.substring(0, sep) !== measureStage) {
            continue;
        }
        const site = k.substring(sep + 3);
        bySite.add(site, v);
        // builtins are keyed `fn <- caller site`: attribute them to the caller's file
        const caller = site.includes(' <- ') ? site.substring(site.indexOf(' <- ') + 4) : site;
        const file = caller.substring(caller.lastIndexOf(' ') + 1).replace(/:\d+$/, '');
        byFile.add(file, v);
    }
    return { bySite, byFile };
}

describe('MeasureProfile', () => {
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
            for (let i = 0; i < 3; i++) {
                const { h, score } = fresh();
                h.render(score, null, 1300);
            }

            const a = fresh();
            const alloc = AllocationSampler.measure(() => a.h.render(a.score, null, 1300), 1024);
            const am = ofStage(alloc.byStageSite);
            const measureBytes = am.bySite.total;
            out.push(
                `### allocation, initial layout: total ${AllocationSampler.mb(alloc.totalBytes)}, measure ${AllocationSampler.mb(measureBytes)}`
            );
            out.push('  measure by source file:');
            for (const [k, v] of am.byFile.top(40)) {
                out.push(
                    `    ${AllocationSampler.mb(v).padStart(9)}  ${((v / measureBytes) * 100).toFixed(1).padStart(5)}%  ${k}`
                );
            }
            out.push('  measure by site:');
            for (const [k, v] of am.bySite.top(70)) {
                out.push(
                    `    ${AllocationSampler.mb(v).padStart(9)}  ${((v / measureBytes) * 100).toFixed(1).padStart(5)}%  ${k}`
                );
            }

            const passes = Array.from({ length: runs }, () => fresh());
            const cpu = CpuSampler.measure(() => {
                for (const p of passes) {
                    p.h.render(p.score, null, 1300);
                }
            });
            const cm = ofStage(cpu.byStageSelf);
            const measureMs = cm.bySite.total;
            out.push(
                `### CPU, initial layout: ${(cpu.totalMs / runs).toFixed(1)} ms per pass, measure self ${(measureMs / runs).toFixed(1)} ms (${runs} passes)`
            );
            out.push('  stages:');
            for (const [k, v] of cpu.byStage.top(12)) {
                out.push(`    ${(v / runs).toFixed(2).padStart(8)} ms  ${k}`);
            }
            out.push('  measure self time by source file:');
            for (const [k, v] of cm.byFile.top(40)) {
                out.push(
                    `    ${(v / runs).toFixed(2).padStart(8)} ms  ${((v / measureMs) * 100).toFixed(1).padStart(5)}%  ${k}`
                );
            }
            out.push('  measure self time by site:');
            for (const [k, v] of cm.bySite.top(60)) {
                out.push(
                    `    ${(v / runs).toFixed(2).padStart(8)} ms  ${((v / measureMs) * 100).toFixed(1).padStart(5)}%  ${k}`
                );
            }
            out.push('  inclusive (all stages):');
            for (const [k, v] of cpu.inclusive.top(70)) {
                out.push(`    ${(v / runs).toFixed(2).padStart(8)} ms  ${k}`);
            }
            console.log(out.slice(0, 3).join('\n'));
            lines.push(...out, '');
        });
    }

    it('report', () => {
        const target = path.join(LayoutCorpus.outDir(root), 'measure-profile.txt');
        fs.writeFileSync(target, lines.join('\n'));
        console.log(`report written to ${target}`);
    });
});
