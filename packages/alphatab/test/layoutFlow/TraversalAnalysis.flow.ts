/** @target web */
// How often the layout re-visits the same glyphs: visits per traversal method for initial layout,
// resize and paint (the probes add overhead, timings live in TraversalCpu).
// Run: npm run test-layout-flow -- TraversalAnalysis
import fs from 'node:fs';
import path from 'node:path';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { CallProbe } from './CallProbe';
import { GlyphVisitProbe } from './GlyphVisitProbe';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

describe('TraversalAnalysis', () => {
    const root = process.cwd();
    const lines: string[] = [];
    const refs = LayoutCorpus.referenceScores.filter(
        r => !process.env.LAYOUT_FLOW_FILE || r.file.includes(process.env.LAYOUT_FLOW_FILE)
    );

    for (const ref of refs) {
        it(ref.name, () => {
            const out: string[] = [`## ${ref.name} (${ref.file})`];
            const file = path.join(root, ref.file);
            const fresh = () => {
                const h = new LayoutHarness(new Settings());
                h.paint = false;
                return { h, score: LayoutHarness.loadScore(file, h.settings) };
            };

            // traversal counts of one pass each
            const { h, score } = fresh();
            GlyphVisitProbe.start();
            CallProbe.start();
            h.render(score, null, 1300);
            const initialVisits = GlyphVisitProbe.stop();
            const initialCalls = CallProbe.stop();
            h.resize(1000);
            GlyphVisitProbe.start();
            h.resize(1300);
            const resizeVisits = GlyphVisitProbe.stop();
            GlyphVisitProbe.start();
            for (const id of h.partialIds) {
                h.renderer.renderResult(id);
            }
            const paintVisits = GlyphVisitProbe.stop();
            out.push(`### glyph visits per traversal method (${GlyphVisitProbe.wrappedClasses} glyph classes probed)`);
            out.push('  initial layout:');
            out.push(...GlyphVisitProbe.format(initialVisits).map(l => `    ${l}`));
            out.push('  resize 1000 -> 1300:');
            out.push(...GlyphVisitProbe.format(resizeVisits).map(l => `    ${l}`));
            out.push('  paint all partials:');
            out.push(...GlyphVisitProbe.format(paintVisits).map(l => `    ${l}`));
            out.push('  layout stage calls (initial layout):');
            out.push(...CallProbe.format(initialCalls).map(l => `    ${l}`));

            console.log(out.slice(0, 12).join('\n'));
            lines.push(...out, '');
        });
    }

    it('report', () => {
        const target = path.join(LayoutCorpus.outDir(root), 'traversal-analysis.txt');
        fs.writeFileSync(target, lines.join('\n'));
        console.log(`report written to ${target}`);
    });
});
