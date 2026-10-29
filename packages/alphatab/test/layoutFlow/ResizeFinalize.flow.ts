/** @target web */
// The resize path after measuring: allocation per stage and site for typical resize steps, call
// counts of the finalize/skyline/tie/effect-placement methods, bounds objects per resize and how many
// bars and systems keep their horizontal geometry between two widths (incremental resize potential).
// Run: npm run test-layout-flow -- ResizeFinalize   (LAYOUT_FLOW_FILE=<name> limits the scores)
// LAYOUT_FLOW_NO_INLINE=1 disables inlining so allocations are attributed to the allocating function.
import fs from 'node:fs';
import path from 'node:path';
import v8 from 'node:v8';
import { BeamingRules } from '@coderline/alphatab/model/MasterBar';
import { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { EffectBandContainer } from '@coderline/alphatab/rendering/EffectBandContainer';
import { EffectSystemPlacement } from '@coderline/alphatab/rendering/EffectSystemPlacement';
import { Skyline } from '@coderline/alphatab/rendering/skyline/Skyline';
import { SkylineScratch } from '@coderline/alphatab/rendering/skyline/SkylineScratch';
import { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';
import type { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { type AllocationReport, AllocationSampler } from './AllocationSampler';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

const noInline = !!process.env.LAYOUT_FLOW_NO_INLINE;
if (noInline) {
    v8.setFlagsFromString('--no-turbo-inlining');
    v8.setFlagsFromString('--no-maglev-inlining');
}

const mb = AllocationSampler.mb;

function report(title: string, r: AllocationReport, out: string[], sites: number) {
    out.push(`### ${title}: ≈ ${mb(r.totalBytes)}`);
    out.push('  by stage:');
    for (const [k, v] of r.byStage.top(20)) {
        out.push(`    ${mb(v).padStart(9)}  ${((v / r.totalBytes) * 100).toFixed(1).padStart(5)}%  ${k}`);
    }
    out.push('  top stage | site:');
    for (const [k, v] of r.byStageSite.top(sites)) {
        out.push(`    ${mb(v).padStart(9)}  ${((v / r.totalBytes) * 100).toFixed(1).padStart(5)}%  ${k}`);
    }
}

/** Object counts of a bounds lookup (each Bounds is a separate object with 4 boxed doubles). */
function boundsCounts(lookup: BoundsLookup): string {
    let systems = 0;
    let masterBars = 0;
    let bars = 0;
    let beats = 0;
    let notes = 0;
    let bounds = 0;
    for (const s of lookup.staffSystems) {
        systems++;
        bounds += 2;
        for (const mbb of s.bars) {
            masterBars++;
            bounds += 3;
            for (const b of mbb.bars) {
                bars++;
                bounds += 2;
                for (const beat of b.beats) {
                    beats++;
                    bounds += 2;
                    if (beat.notes) {
                        notes += beat.notes.length;
                        bounds += beat.notes.length;
                    }
                }
            }
        }
    }
    return `systems=${systems} masterBars=${masterBars} bars=${bars} beats=${beats} notes=${notes} Bounds=${bounds} (records+Bounds=${systems + masterBars + bars + beats + notes + bounds})`;
}

// ---- call counting -------------------------------------------------------------------------------

const counts = new Map<string, number>();
let counting = false;
function bump(label: string, n: number = 1) {
    if (counting) {
        counts.set(label, (counts.get(label) ?? 0) + n);
    }
}

const restore: (() => void)[] = [];
function install() {
    const wrap = (
        proto: object,
        method: string,
        label: string,
        extra?: (self: any, args: unknown[], r: unknown) => void
    ) => {
        const p = proto as Record<string, unknown>;
        const orig = p[method] as ((...args: unknown[]) => unknown) | undefined;
        if (typeof orig !== 'function') {
            counts.set(`MISSING ${label}`, 0);
            return;
        }
        restore.push(() => {
            p[method] = orig;
        });
        p[method] = function (this: unknown, ...args: unknown[]) {
            const r = orig.apply(this, args);
            bump(label);
            if (extra && counting) {
                extra(this, args, r);
            }
            return r;
        };
    };
    wrap(Skyline.prototype, 'union', 'Skyline.union');
    wrap(Skyline.prototype, 'unionShifted', 'Skyline.unionShifted');
    wrap(Skyline.prototype, 'unionShifted3', 'Skyline.unionShifted3');
    wrap(Skyline.prototype, 'copyFrom', 'Skyline.copyFrom');
    wrap(Skyline.prototype, 'insert', 'Skyline.insert');
    wrap(Skyline.prototype, 'reset', 'Skyline.reset');
    wrap(Skyline.prototype, 'placeAbove', 'Skyline.placeAbove');
    wrap(Skyline.prototype, 'placeBelow', 'Skyline.placeBelow');
    wrap(Skyline.prototype, 'maxHeightInRange', 'Skyline.maxHeightInRange');
    wrap(Skyline.prototype, '_splitAt', 'Skyline._splitAt');
    wrap(Skyline.prototype, '_spliceFromScratch', 'Skyline._spliceFromScratch');
    const ensure = SkylineScratch.ensureCapacity;
    restore.push(() => {
        (SkylineScratch as unknown as Record<string, unknown>).ensureCapacity = ensure;
    });
    (SkylineScratch as unknown as Record<string, unknown>).ensureCapacity = (b: number[], c: number, cap: number) => {
        const r = ensure(b, c, cap);
        bump('SkylineScratch.ensureCapacity');
        if (r !== b) {
            bump('SkylineScratch.ensureCapacity grown');
            bump('SkylineScratch.ensureCapacity grown slots', r.length);
        }
        return r;
    };
    wrap(EffectSystemPlacement.prototype, 'place', 'EffectSystemPlacement.place');
    wrap(EffectSystemPlacement.prototype, 'apply', 'EffectSystemPlacement.apply');
    wrap(EffectSystemPlacement.prototype, '_placeSide', 'EffectSystemPlacement._placeSide');
    wrap(RenderStaff.prototype, 'reset', 'RenderStaff.reset', self => {
        bump('RenderStaff.reset (non-empty barRenderers)', (self as RenderStaff).barRenderers.length > 0 ? 1 : 0);
    });
    wrap(RenderStaff.prototype, 'finalizeStaff', 'RenderStaff.finalizeStaff');
    wrap(RenderStaff.prototype, 'resetSharedLayoutData', 'RenderStaff.resetSharedLayoutData');
    wrap(StaffSystem.prototype, 'reset', 'StaffSystem.reset');
    wrap(StaffSystem.prototype, 'finalizeSystem', 'StaffSystem.finalizeSystem');
    wrap(StaffSystem.prototype, 'buildBoundingsLookup', 'StaffSystem.buildBoundingsLookup');
    wrap(StaffSystem.prototype, 'addMasterBarRenderers', 'StaffSystem.addMasterBarRenderers');
    wrap(StaffSystem.prototype, 'measureWidth', 'StaffSystem.measureWidth');
    wrap(StaffSystem.prototype, 'revertLastBar', 'StaffSystem.revertLastBar');
    wrap(BarRendererBase.prototype, 'scaleToWidth', 'BarRenderer.scaleToWidth');
    wrap(BarRendererBase.prototype, 'applyLayoutingInfo', 'BarRenderer.applyLayoutingInfo');
    wrap(BarRendererBase.prototype, 'reLayout', 'BarRenderer.reLayout');
    wrap(BarRendererBase.prototype, 'afterReverted', 'BarRenderer.afterReverted');
    wrap(BarRendererBase.prototype, 'buildBoundingsLookup', 'BarRenderer.buildBoundingsLookup');
    wrap(BarRendererBase.prototype, 'finalizeOwnedTies', 'BarRenderer.finalizeOwnedTies');
    wrap(BarRendererBase.prototype, '_emitTies', 'BarRenderer._emitTies', (_s, args) => {
        bump('TieGlyph.doLayout (via _emitTies)', (args[0] as unknown[]).length);
    });
    wrap(BarRendererBase.prototype, 'registerMultiSystemSlurs', 'BarRenderer.registerMultiSystemSlurs', (_s, args) => {
        const a = args[0] as unknown[] | null;
        bump('ContinuationTieGlyph created', a ? a.length : 0);
    });
    wrap(EffectBand.prototype, 'alignGlyphs', 'EffectBand.alignGlyphs');
    wrap(EffectBand.prototype, 'collectPlacementRanges', 'EffectBand.collectPlacementRanges');
    wrap(EffectBand.prototype, 'finalizeBand', 'EffectBand.finalizeBand');
    wrap(EffectBandContainer.prototype, 'alignGlyphs', 'EffectBandContainer.alignGlyphs');
    wrap(EffectBandContainer.prototype, 'populateSkyline', 'EffectBandContainer.populateSkyline');
    wrap(EffectBandContainer.prototype, 'finalizeChainSpans', 'EffectBandContainer.finalizeChainSpans');
    wrap(BeamingRules.prototype, 'findRule', 'BeamingRules.findRule');
}

function countsOf(action: () => void): string[] {
    install();
    counts.clear();
    counting = true;
    try {
        action();
    } finally {
        counting = false;
        for (const r of restore.splice(0, restore.length)) {
            r();
        }
    }
    return Array.from(counts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([k, v]) => `    ${k.padEnd(48)} ${String(v).padStart(9)}`);
}

// ---- geometry stability ----------------------------------------------------------------------------

interface BarGeo {
    range: string;
    x: number;
    w: number;
}

interface SystemGeo {
    range: string;
    width: number;
    height: number;
    widths: string;
}

function snapshot(h: LayoutHarness): { bars: Map<BarRendererBase, BarGeo>; systems: Map<string, SystemGeo> } {
    const bars = new Map<BarRendererBase, BarGeo>();
    const systems = new Map<string, SystemGeo>();
    for (const s of h.renderer.layout!.systems) {
        const range = `${s.firstBarIndex}-${s.lastBarIndex}`;
        const widths: string[] = [];
        for (const staff of s.allStaves) {
            for (const r of staff.barRenderers) {
                bars.set(r, { range, x: r.x, w: r.width });
                widths.push(`${r.x}/${r.width}`);
            }
        }
        systems.set(range, { range, width: s.width, height: s.height, widths: widths.join(',') });
    }
    return { bars, systems };
}

function stability(h: LayoutHarness, from: number, to: number): string {
    const ranges = () => h.renderer.layout!.systems.map(s => `${s.firstBarIndex}-${s.lastBarIndex}`);
    h.resize(from);
    const a = snapshot(h);
    const ra = ranges();
    h.resize(to);
    const b = snapshot(h);
    const rb = ranges();
    let sameIndex = 0;
    for (let i = 0; i < rb.length; i++) {
        if (ra[i] === rb[i]) {
            sameIndex++;
        }
    }
    let sameRange = 0;
    let sameW = 0;
    let sameXW = 0;
    for (const [r, g] of b.bars) {
        const o = a.bars.get(r);
        if (!o) {
            continue;
        }
        if (o.range === g.range) {
            sameRange++;
        }
        if (o.w === g.w) {
            sameW++;
        }
        if (o.w === g.w && o.x === g.x && o.range === g.range) {
            sameXW++;
        }
    }
    let sysSameRange = 0;
    let sysSameGeo = 0;
    let sysSameGeoHeight = 0;
    for (const [k, s] of b.systems) {
        const o = a.systems.get(k);
        if (!o) {
            continue;
        }
        sysSameRange++;
        if (o.widths === s.widths && o.width === s.width) {
            sysSameGeo++;
            if (o.height === s.height) {
                sysSameGeoHeight++;
            }
        }
    }
    return (
        `    ${String(from).padStart(4)} -> ${String(to).padEnd(4)} bars=${b.bars.size} sameSystemRange=${sameRange} ` +
        `sameWidth=${sameW} sameX+W+range=${sameXW} | systems=${b.systems.size} sameRange=${sysSameRange} sameRangeAtSameIndex=${sameIndex} ` +
        `sameHorizontalGeometry=${sysSameGeo} (+same height=${sysSameGeoHeight})`
    );
}

describe('ResizeFinalize', () => {
    const root = process.cwd();
    const lines: string[] = [];
    const refs = LayoutCorpus.referenceScores.filter(
        r => !process.env.LAYOUT_FLOW_FILE || r.file.includes(process.env.LAYOUT_FLOW_FILE)
    );

    for (const ref of refs) {
        it(ref.name, () => {
            const out: string[] = [`## ${ref.name} (${ref.file})${noInline ? ' [no inlining]' : ''}`];
            const file = path.join(root, ref.file);

            const h = new LayoutHarness(new Settings());
            h.paint = false;
            const score = LayoutHarness.loadScore(file, h.settings);
            h.render(score, null, 1300);
            for (let i = 0; i < 3; i++) {
                h.resize(1000);
                h.resize(1300);
                h.resize(1290);
                h.resize(1300);
            }

            const big = AllocationSampler.measure(() => h.resize(1000), 1024);
            report('resize 1300 -> 1000 (no paint)', big, out, 45);
            const back = AllocationSampler.measure(() => h.resize(1300), 1024);
            report('resize 1000 -> 1300 (no paint)', back, out, 45);
            const small = AllocationSampler.measure(() => h.resize(1290), 1024);
            report('resize 1300 -> 1290 (no paint, drag step)', small, out, 25);
            h.resize(1300);
            const same = AllocationSampler.measure(() => h.resize(1300), 1024);
            report('resize 1300 -> 1300 (same width, forced)', same, out, 15);

            out.push('### bounds objects per resize (1300)');
            out.push(
                h.boundsWire
                    ? `    worker bounds (wire writer): ${h.boundsWire.encode()!.length} numbers`
                    : `    ${boundsCounts(h.renderer.boundsLookup!)}`
            );

            if (!noInline) {
                out.push('### geometry kept between widths (renderers are reused across resizes)');
                for (const [f, t] of [
                    [1300, 1299],
                    [1300, 1290],
                    [1300, 1250],
                    [1300, 1200],
                    [1300, 1000],
                    [1000, 990],
                    [800, 790],
                    [600, 590]
                ]) {
                    out.push(stability(h, f, t));
                }

                h.resize(1000);
                out.push('### calls during resize 1000 -> 1300');
                out.push(...countsOf(() => h.resize(1300)));
                const h2 = new LayoutHarness(new Settings());
                h2.paint = false;
                const score2 = LayoutHarness.loadScore(file, h2.settings);
                out.push('### calls during initial render 1300 (selected)');
                out.push(
                    ...countsOf(() => h2.render(score2, null, 1300)).filter(
                        l => l.includes('findRule') || l.includes('TieGlyph') || l.includes('RenderStaff.reset')
                    )
                );
            }

            console.log(out.join('\n'));
            lines.push(...out, '');
        });
    }

    it('report', () => {
        const target = path.join(
            LayoutCorpus.outDir(root),
            noInline ? 'resize-finalize-noinline.txt' : 'resize-finalize.txt'
        );
        fs.writeFileSync(target, lines.join('\n'));
        console.log(`report written to ${target}`);
    });
});
