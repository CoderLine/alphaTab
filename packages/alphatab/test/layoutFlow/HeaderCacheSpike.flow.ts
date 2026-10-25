/** @target web */
// SPIKE: is the horizontal spacing of a bar header (clef/key/time/barline columns) a pure function of
// a small model-derived key? Renders the corpus fresh at several widths so bars land both at system
// starts and mid-system, records the header rods each renderer registered, and groups them by key.
// Run: npm run test-layout-flow -- HeaderCacheSpike
import fs from 'node:fs';
import path from 'node:path';
import type { Bar } from '@coderline/alphatab/model/Bar';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { AllocationSampler } from './AllocationSampler';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

class RodRecorder {
    public rods: string[] = [];
    public addHeaderRod(rank: number, pre: number, post: number) {
        this.rods.push(`${rank}:${pre.toFixed(4)}/${post.toFixed(4)}`);
    }
}

function rodsOf(r: BarRendererBase): string {
    const recorder = new RodRecorder();
    (r as any)._preBeatGlyphs.registerHeaderRod(recorder);
    return recorder.rods.join(' ');
}

/**
 * Everything layout reads from the header glyphs besides the rods: per glyph its width and its
 * bounding box relative to its own x (overflow and skyline input), in creation order.
 */
function profileOf(r: BarRendererBase): string {
    const parts: string[] = [];
    const glyphs = (r as any)._preBeatGlyphs.glyphs as any[] | null;
    for (const g of glyphs ?? []) {
        const f = (v: number) => v.toFixed(3);
        parts.push(
            `${g.constructor.name} w=${f(g.width)} l=${f(g.getBoundingBoxLeft() - g.x)} r=${f(g.getBoundingBoxRight() - g.x)} ` +
                `t=${f(g.getBoundingBoxTop())} b=${f(g.getBoundingBoxBottom())}`
        );
    }
    return parts.join(' | ');
}

function display(r: BarRendererBase, method: string): string {
    const fn = (r as any)[method];
    if (typeof fn !== 'function') {
        return '-';
    }
    const d = fn.call(r as LineBarRenderer);
    return `${d.isVisible ?? ''}.${d.staffPlacement ?? ''}.${d.systemDisplay ?? ''}`;
}

function timeOf(b: Bar | null): string {
    if (!b) {
        return 'none';
    }
    const mb = b.masterBar;
    return `${mb.timeSignatureNumerator}/${mb.timeSignatureDenominator}${mb.timeSignatureCommon ? 'c' : ''}${mb.isFreeTime ? 'f' : ''}`;
}

/** Everything the header could depend on, from the model, the lane and the variant only. */
function fullKey(r: BarRendererBase, fileId: string): string {
    const bar = r.bar;
    const prev = bar.previousBar;
    const isStart = r.index === 0;
    const isFirstSystem = r.staff!.system.index === 0;
    return [
        fileId,
        r.staff!.staffId,
        r.staff!.trackIndex,
        bar.staff.index,
        r.staff!.isCascadePrimary ? 'P' : 'S',
        isStart ? 'start' : 'mid',
        isFirstSystem ? 'sys0' : 'sysN',
        `clef=${bar.clef}.${bar.clefOttava}`,
        `prevClef=${prev ? `${prev.clef}.${prev.clefOttava}` : 'none'}`,
        `key=${bar.keySignature}.${bar.keySignatureType}`,
        `prevKey=${prev ? prev.keySignature : 'none'}`,
        `time=${timeOf(bar)}`,
        `prevTime=${timeOf(prev)}`,
        `blL=${bar.getActualBarLineLeft(isStart)}`,
        `prevBlR=${prev ? prev.getActualBarLineRight() : 'none'}`,
        `rest=${r.additionalMultiRestBars ? r.additionalMultiRestBars.length : 0}`,
        `d=${display(r, 'resolveClefDisplay')}|${display(r, 'resolveKeySignatureDisplay')}|${display(r, 'resolveTimeSignatureDisplay')}`
    ].join(' ');
}

/**
 * The key a production cache would use: lane, variant, and what is *shown* per column, derived from
 * the model with the same rules the renderers use.
 */
function compactKey(r: BarRendererBase): string {
    const bar = r.bar;
    const prev = bar.previousBar;
    const isStart = r.index === 0;
    const clefChanged = !prev || prev.clef !== bar.clef || prev.clefOttava !== bar.clefOttava;
    const keyChanged = !prev || prev.keySignature !== bar.keySignature;
    // same predicate as the renderers' time signature condition
    const timeChanged =
        !prev ||
        prev.masterBar.timeSignatureNumerator !== bar.masterBar.timeSignatureNumerator ||
        prev.masterBar.timeSignatureDenominator !== bar.masterBar.timeSignatureDenominator ||
        (bar.masterBar.isFreeTime && !prev.masterBar.isFreeTime);
    const showClef = isStart || clefChanged;
    return [
        r.staff!.staffId,
        r.staff!.modelStaff.standardNotationLineCount,
        r.staff!.modelStaff.stringTuning.tunings.length,
        r.staff!.isCascadePrimary ? 'P' : 'S',
        isStart ? 'start' : 'mid',
        r.staff!.system.index === 0 ? 'sys0' : 'sysN',
        showClef ? `clef=${bar.clef}.${bar.clefOttava}` : 'noclef',
        // accidentals of a key signature are placed by the clef even when the clef is not shown
        showClef || keyChanged
            ? `key=${bar.keySignature}/${prev && keyChanged ? prev.keySignature : 'x'}@${bar.clef}.${bar.clefOttava}`
            : 'nokey',
        timeChanged ? `time=${timeOf(bar)}` : 'notime',
        `blL=${bar.getActualBarLineLeft(isStart)}`,
        `prevBlR=${!isStart && prev ? prev.getActualBarLineRight() : 'x'}`,
        `d=${display(r, 'resolveClefDisplay')}|${display(r, 'resolveKeySignatureDisplay')}|${display(r, 'resolveTimeSignatureDisplay')}`
    ].join(' ');
}

class KeyStats {
    public readonly byKey = new Map<string, Map<string, string>>();
    public samples = 0;

    public add(key: string, rods: string, where: string) {
        this.samples++;
        let m = this.byKey.get(key);
        if (!m) {
            m = new Map<string, string>();
            this.byKey.set(key, m);
        }
        if (!m.has(rods)) {
            m.set(rods, where);
        }
    }

    public get conflicts(): [string, Map<string, string>][] {
        return Array.from(this.byKey.entries()).filter(([, v]) => v.size > 1);
    }
}

describe('HeaderCacheSpike', () => {
    it('header rods are a function of a model-derived key', () => {
        const root = process.cwd();
        const files = LayoutCorpus.files(root).filter(
            f => !process.env.LAYOUT_FLOW_FILE || f.includes(process.env.LAYOUT_FLOW_FILE)
        );
        const widths = [1300, 1000, 750, 500, 350];
        const full = new KeyStats();
        const compact = new KeyStats();
        const profiles = new KeyStats();
        const distinctProfiles = new Set<string>();
        const distinctRods = new Set<string>();
        let renderersSeen = 0;
        let starts = 0;
        let skipped = 0;
        for (const file of files) {
            const rel = path.relative(root, file);
            for (const w of widths) {
                const h = new LayoutHarness(new Settings());
                h.paint = false;
                try {
                    const score = LayoutHarness.loadScore(file, h.settings);
                    h.render(score, null, w);
                } catch {
                    skipped++;
                    break;
                }
                for (const system of h.renderer.layout!.systems) {
                    for (const staff of system.allStaves) {
                        for (const r of staff.barRenderers) {
                            const rods = rodsOf(r);
                            const where = `${rel} w=${w} sys=${system.index} bar=${r.bar.index} staff=${staff.staffId}`;
                            full.add(fullKey(r, rel), rods, where);
                            compact.add(compactKey(r), rods, where);
                            const profile = profileOf(r);
                            profiles.add(compactKey(r), profile, where);
                            distinctProfiles.add(`${r.staff!.staffId} ${profile}`);
                            distinctRods.add(`${r.staff!.staffId} ${rods}`);
                            renderersSeen++;
                            if (r.index === 0) {
                                starts++;
                            }
                        }
                    }
                }
            }
        }

        const out: string[] = [];
        out.push(`files=${files.length} skipped=${skipped} widths=${widths.join(',')}`);
        out.push(`renderer samples=${renderersSeen} (system starts=${starts})`);
        out.push(`full key (per file): keys=${full.byKey.size} conflicts=${full.conflicts.length}`);
        out.push(`compact key (corpus-wide): keys=${compact.byKey.size} conflicts=${compact.conflicts.length}`);
        out.push(`distinct rod lists per staff kind (corpus-wide): ${distinctRods.size}`);
        out.push(
            `header geometry profile by compact key: keys=${profiles.byKey.size} conflicts=${profiles.conflicts.length} distinct profiles=${distinctProfiles.size}`
        );
        for (const [label, stats] of [
            ['full', full],
            ['compact', compact],
            ['profile', profiles]
        ] as [string, KeyStats][]) {
            for (const [key, variants] of stats.conflicts.slice(0, 15)) {
                out.push(`CONFLICT ${label}: ${key}`);
                for (const [rods, where] of variants) {
                    out.push(`    ${rods}   @ ${where}`);
                }
            }
        }
        console.log(out.slice(0, 6).join('\n'));
        const report = path.join(LayoutCorpus.outDir(root), 'header-cache-spike.txt');
        fs.writeFileSync(report, out.join('\n'));
        console.log(`report written to ${report}`);
    });

    it('reuse and cost on the reference scores', () => {
        const root = process.cwd();
        const out: string[] = [];
        for (const ref of LayoutCorpus.referenceScores) {
            const h = new LayoutHarness(new Settings());
            h.paint = false;
            const score = LayoutHarness.loadScore(path.join(root, ref.file), h.settings);
            const t0 = performance.now();
            h.render(score, null, 1300);
            const renderMs = performance.now() - t0;
            const renderers: BarRendererBase[] = [];
            for (const system of h.renderer.layout!.systems) {
                for (const staff of system.allStaves) {
                    renderers.push(...staff.barRenderers);
                }
            }
            // both variants of every renderer as the planner could ask for them, keyed by the compact key
            const keys = new Set<string>();
            for (const r of renderers) {
                const index = r.index;
                for (const asStart of [true, false]) {
                    r.index = asStart ? 0 : Math.max(1, index);
                    keys.add(compactKey(r));
                }
                r.index = index;
            }
            // cost of creating the header glyphs of every renderer once more (the work a cache avoids)
            const t1 = performance.now();
            for (const r of renderers) {
                (r as any).recreatePreBeatGlyphs();
            }
            const headerMs = performance.now() - t1;
            let glyphs = 0;
            const countGlyphs = (g: any) => {
                glyphs++;
                if (g.glyphs) {
                    for (const c of g.glyphs) {
                        countGlyphs(c);
                    }
                }
            };
            for (const r of renderers) {
                countGlyphs((r as any)._preBeatGlyphs);
            }
            const alloc = AllocationSampler.measure(() => {
                for (const r of renderers) {
                    (r as any).recreatePreBeatGlyphs();
                }
            }, 512);

            out.push(
                `${ref.name}: renderers=${renderers.length} variant requests=${renderers.length * 2} distinct keys=${keys.size} ` +
                    `| initial layout ${renderMs.toFixed(1)} ms, one header-creation pass over all renderers ${headerMs.toFixed(1)} ms`
            );
            out.push(
                `   one header pass: ${glyphs} glyph objects (incl. groups), allocated ≈ ${AllocationSampler.mb(alloc.totalBytes)}; ` +
                    `top: ${alloc.topSites
                        .slice(0, 6)
                        .map(x => `${x.site} ${AllocationSampler.mb(x.bytes)}`)
                        .join('; ')}`
            );
        }
        console.log(out.join('\n'));
        fs.appendFileSync(path.join(LayoutCorpus.outDir(root), 'header-cache-spike.txt'), `\n${out.join('\n')}\n`);
    });
});
