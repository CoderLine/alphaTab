/** @target web */
// What painting staff lines costs: canvas calls, SVG bytes, paint allocations and paint time of the
// staff-line run painter against painting no staff lines, for the reference scores. Run: npm run test-layout-flow -- StaffLineCost   (LAYOUT_FLOW_FILE=<name> limits the scores)
import fs from 'node:fs';
import path from 'node:path';
import { CssFontSvgCanvas } from '@coderline/alphatab/platform/svg/CssFontSvgCanvas';
import { SvgCanvas } from '@coderline/alphatab/platform/svg/SvgCanvas';
import { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import type { Score } from '@coderline/alphatab/model/Score';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { AllocationSampler } from './AllocationSampler';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';
import { type StaffLineMode, StaffLineRuns } from './StaffLineRuns';

interface CallCounts {
    calls: number;
    fillRect: number;
    emptyFillRect: number;
    svgBytes: number;
}

const counted = new Map<string, number>();
let emptyFillRect = 0;

function installCanvasCounters(): () => void {
    const restores: (() => void)[] = [];
    for (const proto of [SvgCanvas.prototype, CssFontSvgCanvas.prototype] as any[]) {
        for (const name of Object.getOwnPropertyNames(proto)) {
            if (name === 'constructor' || name === 'beginRender' || name === 'endRender') {
                continue;
            }
            const d = Object.getOwnPropertyDescriptor(proto, name)!;
            if (typeof d.value !== 'function') {
                continue;
            }
            const orig = d.value;
            proto[name] =
                name === 'fillRect'
                    ? function (this: any, x: number, y: number, w: number, h: number) {
                          counted.set(name, (counted.get(name) ?? 0) + 1);
                          if (!(w > 0)) {
                              emptyFillRect++;
                          }
                          return orig.call(this, x, y, w, h);
                      }
                    : function (this: any) {
                          counted.set(name, (counted.get(name) ?? 0) + 1);
                          // biome-ignore lint/complexity/noArguments: transparent probe wrapper
                          return orig.apply(this, arguments);
                      };
            restores.push(() => {
                proto[name] = orig;
            });
        }
    }
    return () => {
        for (const r of restores) {
            r();
        }
    };
}

/**
 * Gap layouts that the per-bar painter in `TabBarRenderer.paintStaffLines` handles imperfectly:
 * a gap inside a wider one moves the line cursor back, and gaps crossing the bar edges are cut
 * by the neighbouring bar's lines.
 */
function gapDefects(systems: readonly any[]) {
    const d = { overlap: 0, contained: 0, pastEnd: 0, beforeStart: 0, unsorted: 0 };
    for (const sys of systems) {
        for (const s of sys.allStaves) {
            if (!s.isVisible) {
                continue;
            }
            for (const r of s.barRenderers as any[]) {
                if (!(r instanceof TabBarRenderer) || (r as any).additionalMultiRestBars) {
                    continue;
                }
                const tr = r as any;
                if (tr._gapBucketEnd === null) {
                    tr._buildGapCache();
                }
                if (tr._gapCount === 0) {
                    continue;
                }
                const base = tr.beatGlyphsStart;
                for (let line = 0; line < tr.drawnLineCount; line++) {
                    const from = line === 0 ? 0 : tr._gapBucketEnd[line - 1];
                    const to = tr._gapBucketEnd[line];
                    const gaps: [number, number][] = [];
                    for (let g = from; g < to; g++) {
                        const ref = tr._gapBeatRefs[g];
                        gaps.push([
                            base + ref.x + ref.onNotes.x + tr._gapRelXAndWidth[g * 2],
                            tr._gapRelXAndWidth[g * 2 + 1]
                        ]);
                    }
                    for (let g = 1; g < gaps.length; g++) {
                        if (gaps[g][0] < gaps[g - 1][0]) {
                            d.unsorted++;
                            break;
                        }
                    }
                    gaps.sort((a, b) => a[0] - b[0]);
                    let lineX = 0;
                    for (const [gx, gw] of gaps) {
                        if (gx < 0) {
                            d.beforeStart++;
                        }
                        if (gx + gw > r.width) {
                            d.pastEnd++;
                        }
                        if (gx < lineX) {
                            d.overlap++;
                            if (gx + gw < lineX) {
                                d.contained++;
                            }
                        }
                        lineX = gx + gw;
                    }
                }
            }
        }
    }
    return d;
}

interface Variant {
    name: string;
    tracks: number[] | null;
    prepare: (s: Score) => void;
}

const variants: Variant[] = [
    { name: 'all tracks', tracks: null, prepare: () => {} },
    { name: 'track 0', tracks: [0], prepare: () => {} },
    {
        name: 'track 0 score only',
        tracks: [0],
        prepare: s => {
            for (const st of s.tracks[0].staves) {
                st.showTablature = false;
                st.showStandardNotation = true;
            }
        }
    },
    {
        name: 'track 0 tab only',
        tracks: [0],
        prepare: s => {
            for (const st of s.tracks[0].staves) {
                st.showTablature = true;
                st.showStandardNotation = false;
            }
        }
    }
];

function median(xs: number[]): number {
    const s = [...xs].sort((a, b) => a - b);
    return s[s.length >> 1];
}

describe('StaffLineCost', () => {
    const root = process.cwd();
    const lines: string[] = [];
    const refs = LayoutCorpus.referenceScores.filter(
        r => !process.env.LAYOUT_FLOW_FILE || r.file.includes(process.env.LAYOUT_FLOW_FILE)
    );
    const modes = (process.env.STAFF_LINE_MODES ?? 'production,none').split(',') as StaffLineMode[];
    const rounds = Number(process.env.LAYOUT_FLOW_RUNS ?? 9);
    StaffLineRuns.install();

    const cases: { ref: (typeof refs)[number]; variant: Variant }[] = [];
    for (const ref of refs) {
        for (const variant of variants) {
            cases.push({ ref, variant });
        }
    }

    for (const { ref, variant } of cases) {
        it(`${ref.name} ${variant.name}`, () => {
            const out: string[] = [`## ${ref.name} ${variant.name} (${ref.file})`];
            const file = path.join(root, ref.file);
            const h = new LayoutHarness(new Settings());
            h.paint = false;
            const score = LayoutHarness.loadScore(file, h.settings);
            variant.prepare(score);
            h.render(score, variant.tracks, 1300);
            let svgBytes = 0;
            h.renderer.partialRenderFinished.on(e => {
                svgBytes += String(e.renderResult).length;
            });
            const ids = [...h.partialIds];
            const paintAll = () => {
                for (const id of ids) {
                    h.renderer.renderResult(id);
                }
            };

            // structure
            const systems = h.renderer.layout!.systems;
            let score5 = 0;
            let tab = 0;
            let other = 0;
            let lineBars = 0;
            let tabBars = 0;
            let tabGaps = 0;
            for (const sys of systems) {
                for (const s of sys.allStaves) {
                    if (!s.isVisible || s.barRenderers.length === 0) {
                        continue;
                    }
                    const r0 = s.barRenderers[0];
                    if (r0 instanceof TabBarRenderer) {
                        tab++;
                    } else if (r0 instanceof LineBarRenderer && r0.drawnLineCount > 0) {
                        score5++;
                    } else {
                        other++;
                    }
                    for (const r of s.barRenderers) {
                        if (r instanceof LineBarRenderer && r.drawnLineCount > 0) {
                            lineBars++;
                        }
                    }
                }
            }
            StaffLineRuns.mode = 'production';
            paintAll(); // builds the lazy tab gap caches
            for (const sys of systems) {
                for (const s of sys.allStaves) {
                    for (const r of s.barRenderers) {
                        if (r instanceof TabBarRenderer && s.isVisible) {
                            tabBars++;
                            tabGaps += (r as any)._gapCount;
                        }
                    }
                }
            }
            out.push(
                `systems=${systems.length} partials=${ids.length} visible staff rows: lined(non-tab)=${score5} tab=${tab} no-lines=${other}; bars with lines=${lineBars} (tab ${tabBars}, tab gaps ${tabGaps})`
            );
            const d = gapDefects(systems);
            out.push(
                `tab gap geometry (per bar, sorted): overlapping=${d.overlap} contained (line re-drawn through a wider gap)=${d.contained} past bar end=${d.pastEnd} before bar start=${d.beforeStart} unsorted lines=${d.unsorted}`
            );

            // canvas calls and SVG bytes per mode
            const counts = new Map<StaffLineMode, CallCounts>();
            const restore = installCanvasCounters();
            try {
                for (const m of modes) {
                    StaffLineRuns.mode = m;
                    StaffLineRuns.resetStats();
                    counted.clear();
                    emptyFillRect = 0;
                    svgBytes = 0;
                    paintAll();
                    let calls = 0;
                    for (const v of counted.values()) {
                        calls += v;
                    }
                    counts.set(m, { calls, fillRect: counted.get('fillRect') ?? 0, emptyFillRect, svgBytes });
                    if (m === 'production') {
                        out.push(
                            `staff passes ${StaffLineRuns.staffPasses}, runs ${StaffLineRuns.runs} over ${StaffLineRuns.runBars} bars (${(StaffLineRuns.runBars / Math.max(1, StaffLineRuns.runs)).toFixed(1)} bars/run)`
                        );
                    }
                }
            } finally {
                restore();
            }
            const none = counts.get('none')!;
            out.push(
                '| mode | canvas calls | fillRect | staff-line fillRect (vs none) | empty fillRect | SVG bytes | staff-line SVG bytes |'
            );
            out.push('|---|---|---|---|---|---|---|');
            for (const m of modes) {
                const c = counts.get(m)!;
                out.push(
                    `| ${m} | ${c.calls} | ${c.fillRect} | ${c.fillRect - none.fillRect} | ${c.emptyFillRect} | ${c.svgBytes} | ${c.svgBytes - none.svgBytes} |`
                );
            }

            // allocations (two samples per mode, interleaved)
            const alloc = new Map<StaffLineMode, number[]>();
            for (let rep = 0; rep < 3; rep++) {
                for (const m of modes) {
                    StaffLineRuns.mode = m;
                    paintAll();
                    const r = AllocationSampler.measure(paintAll, 1024);
                    if (rep > 0) {
                        const a = alloc.get(m) ?? [];
                        a.push(r.totalBytes);
                        alloc.set(m, a);
                    }
                }
            }

            // time (interleaved rounds, median)
            const times = new Map<StaffLineMode, number[]>();
            for (let rep = 0; rep < rounds + 2; rep++) {
                for (const m of modes) {
                    StaffLineRuns.mode = m;
                    const t0 = performance.now();
                    paintAll();
                    const t1 = performance.now();
                    if (rep >= 2) {
                        const a = times.get(m) ?? [];
                        a.push(t1 - t0);
                        times.set(m, a);
                    }
                }
            }
            out.push('| mode | paint alloc (MB, 2 samples) | paint ms (median) |');
            out.push('|---|---|---|');
            for (const m of modes) {
                const a = alloc.get(m)!;
                out.push(
                    `| ${m} | ${a.map(b => (b / 1024 / 1024).toFixed(1)).join(' / ')} | ${median(times.get(m)!).toFixed(1)} |`
                );
            }
            StaffLineRuns.mode = 'production';
            console.log(out.join('\n'));
            lines.push(...out, '');
        });
    }

    it('report', () => {
        const target = path.join(LayoutCorpus.outDir(root), 'staff-line-cost.txt');
        fs.writeFileSync(target, lines.join('\n'));
        console.log(`report written to ${target}`);
    });
});
