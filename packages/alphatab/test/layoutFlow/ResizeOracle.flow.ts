/** @target web */
// Resize to width W must produce the same systems as a fresh render at width W.
// Run: npm run test-layout-flow -- ResizeOracle
// Filters: LAYOUT_FLOW_FILE, LAYOUT_FLOW_VARIANT. LAYOUT_FLOW_DUMP=1 writes the first differing svg pair per case.
import fs from 'node:fs';
import path from 'node:path';
import { Settings } from '@coderline/alphatab/Settings';
import type { Score } from '@coderline/alphatab/model/Score';
import type { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { describe, it } from 'vitest';
import { BoundsDump } from './BoundsDump';
import { LayoutCorpus, type LayoutVariant } from './LayoutCorpus';
import { type CapturedPass, LayoutHarness } from './LayoutHarness';

class OracleResult {
    public cases: number = 0;
    public breakDiffs: number = 0;
    public geometryDiffs: number = 0;
    public paintDiffs: number = 0;
    public boundsDiffs: number = 0;
    public knownBoundsDiffs: number = 0;
    public skipped: number = 0;
    public report: string[] = [];
    public known: string[] = [];

    public add(o: OracleResult) {
        this.cases += o.cases;
        this.breakDiffs += o.breakDiffs;
        this.geometryDiffs += o.geometryDiffs;
        this.paintDiffs += o.paintDiffs;
        this.boundsDiffs += o.boundsDiffs;
        this.knownBoundsDiffs += o.knownBoundsDiffs;
        this.known.push(...o.known);
        this.skipped += o.skipped;
        this.report.push(...o.report);
    }

    public toString() {
        const ok = this.cases - this.breakDiffs - this.geometryDiffs - this.paintDiffs - this.boundsDiffs;
        return (
            `cases=${this.cases} equal=${ok} breakDiffs=${this.breakDiffs} ` +
            `geometryDiffs=${this.geometryDiffs} paintOnlyDiffs=${this.paintDiffs} ` +
            `boundsOnlyDiffs=${this.boundsDiffs} knownBoundsDiffs=${this.knownBoundsDiffs} skipped=${this.skipped}`
        );
    }
}

/** Summation order differs between the paths, so widths are compared with a tolerance. */
function near(a: number, b: number) {
    return Math.abs(a - b) < 1e-6;
}

function beats(bar: number, counts: number[], firstBeat: number = 0): string[] {
    const keys: string[] = [];
    for (let i = 0; i < counts.length; i++) {
        for (let e = i === 0 ? firstBeat : 0; e < counts[i]; e++) {
            keys.push(`t0s0b${bar + i}v0e${e}`);
        }
    }
    return keys;
}

/**
 * N38: the visual width of these beats grows with every resize. Cases whose bounds differ only in
 * these widths are listed as known baseline differences instead of being counted.
 */
const knownBeatWidthDifferences = new Map<string, Set<string>>([
    ['effects-and-annotations/tremolo-bar.gp', new Set<string>(beats(3, [3, 6, 6], 1))],
    ['general/colors.gp', new Set<string>(['t0s0b0v0e0'])],
    [
        'notation-legend/notation-legend.gp',
        new Set<string>(['t0s0b101v0e0', ...beats(102, [3, 6, 6, 4, 4], 1), 't0s0b121v0e0'])
    ]
]);

function knownBeatWidths(file: string): Set<string> | null {
    for (const [suffix, keys] of knownBeatWidthDifferences) {
        if (file.replace(/\\/g, '/').endsWith(suffix)) {
            return keys;
        }
    }
    return null;
}

interface OraclePass {
    pass: CapturedPass;
    bounds: BoundsDump;
    lookup: BoundsLookup | null;
    score: Score;
}

function compare(
    result: OracleResult,
    label: string,
    knownWidths: Set<string> | null,
    freshPass: OraclePass,
    resizedPass: OraclePass
) {
    const fresh = freshPass.pass;
    const resized = resizedPass.pass;
    result.cases++;
    const fb = LayoutHarness.breaksOf(fresh);
    const rb = LayoutHarness.breaksOf(resized);
    if (fb !== rb) {
        result.breakDiffs++;
        result.report.push(`${label}: BREAKS fresh=[${fb}] resized=[${rb}]`);
        return;
    }
    // y is not compared per system: it only accumulates the heights of the systems above
    let geometry = 0;
    let paint = 0;
    const fields = new Map<string, number>();
    let first = '';
    for (let i = 0; i < fresh.systems.length; i++) {
        const f = fresh.systems[i];
        const r = resized.systems[i];
        const differing: string[] = [];
        if (f.height !== r.height) {
            differing.push(`height ${f.height}/${r.height}`);
        }
        if (!near(f.width, r.width)) {
            differing.push(`width ${f.width.toFixed(2)}/${r.width.toFixed(2)}`);
        }
        let maxDelta = f.barWidths.length === r.barWidths.length ? 0 : Number.POSITIVE_INFINITY;
        for (let b = 0; b < f.barWidths.length && b < r.barWidths.length; b++) {
            maxDelta = Math.max(maxDelta, Math.abs(f.barWidths[b] - r.barWidths[b]));
        }
        if (!near(maxDelta, 0)) {
            differing.push(
                `barWidths maxDelta=${maxDelta.toPrecision(3)} [${f.barWidths.map(w => w.toFixed(2))}]/[${r.barWidths.map(w => w.toFixed(2))}]`
            );
        }
        if (differing.length > 0) {
            geometry++;
            for (const d of differing) {
                const k = d.split(' ')[0];
                fields.set(k, (fields.get(k) ?? 0) + 1);
            }
            if (!first) {
                first = `first at system ${i} (bars ${f.firstBar}-${f.lastBar}): ${differing.join(', ')}`;
            }
        } else if (!BoundsDump.nearlyEqual(f.svg, r.svg)) {
            // the svg engine prints unrounded coordinates: compare them at a precision far below a pixel
            paint++;
            if (process.env.LAYOUT_FLOW_DUMP && paint === 1) {
                const base = path.join(LayoutCorpus.outDir(process.cwd()), 'dump', label.replace(/[^\w.-]+/g, '_'));
                fs.mkdirSync(path.dirname(base), { recursive: true });
                fs.writeFileSync(`${base}.system${i}.fresh.svg`, f.svg);
                fs.writeFileSync(`${base}.system${i}.resized.svg`, r.svg);
            }
        }
    }
    const bounds = geometry > 0 ? null : BoundsDump.firstDifference(freshPass.bounds, resizedPass.bounds);
    if (geometry > 0) {
        result.geometryDiffs++;
        const counts = Array.from(fields.entries())
            .map(([k, v]) => `${k}=${v}`)
            .join(' ');
        result.report.push(`${label}: GEOMETRY ${geometry}/${fresh.systems.length} systems [${counts}] ${first}`);
    } else if (paint > 0) {
        result.paintDiffs++;
        const boundsNote = bounds === null ? '' : `; BOUNDS ${bounds}`;
        result.report.push(`${label}: PAINT ${paint}/${fresh.systems.length} systems differ${boundsNote}`);
    } else if (bounds !== null) {
        const masked =
            knownWidths !== null &&
            BoundsDump.firstDifference(
                BoundsDump.of(freshPass.lookup, freshPass.score, knownWidths),
                BoundsDump.of(resizedPass.lookup, resizedPass.score, knownWidths)
            ) === null;
        if (masked) {
            result.knownBoundsDiffs++;
            result.known.push(`${label}: ${bounds}`);
        } else {
            result.boundsDiffs++;
            result.report.push(`${label}: BOUNDS ${bounds}`);
        }
    }
}

/** Variants that also register the note bounds. */
const noteBoundsVariants = ['all-tracks', 'hide-empty-staves'];

function createSettings(variant: LayoutVariant): Settings {
    const settings = new Settings();
    settings.core.includeNoteBounds = noteBoundsVariants.indexOf(variant.name) >= 0;
    return settings;
}

function capture(h: LayoutHarness, score: Score, pass: CapturedPass): OraclePass {
    const lookup = h.renderer.boundsLookup;
    return { pass, bounds: BoundsDump.of(lookup, score), lookup, score };
}

function freshRender(file: string, variant: LayoutVariant, width: number): OraclePass {
    const h = new LayoutHarness(createSettings(variant));
    const score = LayoutHarness.loadScore(file, h.settings);
    variant.prepare(score);
    return capture(h, score, h.render(score, variant.tracks(score), width));
}

/**
 * Small steps as while dragging a window edge (from the initial 1300): most systems keep their bars
 * between consecutive passes.
 */
const dragWidths = [1295, 1290, 1300, 900, 1290, 1280, 1000, 995, 990, 1005];

function checkFile(file: string, variant: LayoutVariant, widths: number[], name: string): OracleResult {
    const result = new OracleResult();
    const rel = path.relative(process.cwd(), file);
    let h: LayoutHarness;
    let score: Score;
    try {
        h = new LayoutHarness(createSettings(variant));
        score = LayoutHarness.loadScore(file, h.settings);
        variant.prepare(score);
        h.render(score, variant.tracks(score), 1300);
    } catch (e) {
        result.skipped++;
        result.report.push(`SKIP ${variant.name} ${rel}: ${(e as Error).message}`);
        return result;
    }
    const knownWidths = knownBeatWidths(file);
    for (let i = 0; i < widths.length; i++) {
        try {
            const resized = capture(h, score, h.resize(widths[i]));
            const fresh = freshRender(file, variant, widths[i]);
            compare(result, `${name} ${rel} step ${i} (w=${widths[i]})`, knownWidths, fresh, resized);
        } catch (e) {
            result.skipped++;
            result.report.push(`ERROR ${name} ${rel} step ${i} (w=${widths[i]}): ${(e as Error).message}`);
            return result;
        }
    }
    return result;
}

describe('ResizeOracle', () => {
    const root = process.cwd();
    const files = LayoutCorpus.files(root).filter(
        f => !process.env.LAYOUT_FLOW_FILE || f.includes(process.env.LAYOUT_FLOW_FILE)
    );
    const variants = LayoutCorpus.variants.filter(
        v => !process.env.LAYOUT_FLOW_VARIANT || v.name === process.env.LAYOUT_FLOW_VARIANT
    );
    const total = new OracleResult();
    const dragTotal = new OracleResult();
    const summary: string[] = [];

    for (const variant of variants) {
        it(variant.name, () => {
            const perVariant = new OracleResult();
            const drag = new OracleResult();
            for (const file of files) {
                perVariant.add(checkFile(file, variant, LayoutCorpus.resizeWidths, variant.name));
                drag.add(checkFile(file, variant, dragWidths, `${variant.name} (drag)`));
            }
            const line = `${variant.name}: ${perVariant.toString()}`;
            const dragLine = `${variant.name} (drag): ${drag.toString()}`;
            console.log(line);
            console.log(dragLine);
            summary.push(line);
            summary.push(dragLine);
            total.add(perVariant);
            dragTotal.add(drag);
        });
    }

    it('report', () => {
        summary.push(`total: ${total.toString()}`);
        console.log(summary[summary.length - 1]);
        summary.push(`drag-sequence: ${dragTotal.toString()}`);
        console.log(summary[summary.length - 1]);
        total.add(dragTotal);
        const out = path.join(LayoutCorpus.outDir(root), 'resize-oracle.txt');
        const known = ['', `known baseline bounds differences (${total.known.length}):`, ...total.known];
        fs.writeFileSync(out, [...summary, '', ...total.report, ...known].join('\n'));
        console.log(`report written to ${out}`);
    });
});
