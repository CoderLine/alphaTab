/** @target web */
// Summarises the painted SVG of the corpus so that two commits can be compared for staff-line work:
// every element that is not a staff-line-thick rect as an order-independent multiset (hash), and the
// staff-line-thick rects as merged x-intervals per (partial, fill, y, height).
// Run: STAFF_LINE_SVG_OUT=<dir> npm run test-layout-flow -- StaffLineSvgEquivalence
// then compare two output directories with a script of your choice (one JSON per variant).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { BarStyle, BarSubElement } from '@coderline/alphatab/model/Bar';
import { Color } from '@coderline/alphatab/model/Color';
import type { Score } from '@coderline/alphatab/model/Score';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { LayoutCorpus, type LayoutVariant } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

interface CaseSummary {
    partials: number;
    other: string;
    otherCount: number;
    lines: Record<string, string>;
}

const lineSubElements = [
    BarSubElement.StandardNotationStaffLine,
    BarSubElement.GuitarTabsStaffLine,
    BarSubElement.SlashStaffLine,
    BarSubElement.NumberedStaffLine
];

/** Colour runs: bars 1,2 of every 4 share a colour, bar 3 has a style without staff-line entries. */
function colourBars(s: Score) {
    const red = Color.fromJson('#DD0000')!;
    for (const t of s.tracks) {
        for (const st of t.staves) {
            for (const bar of st.bars) {
                const m = bar.index % 4;
                if (m === 1 || m === 2) {
                    bar.style = new BarStyle();
                    for (const e of lineSubElements) {
                        bar.style.colors.set(e, red);
                    }
                } else if (m === 3) {
                    bar.style = new BarStyle();
                    bar.style.colors.set(BarSubElement.StandardNotationBarNumber, red);
                }
            }
        }
    }
}

const extraVariants: (LayoutVariant & { horizontal?: boolean })[] = [
    { name: 'horizontal', tracks: () => null, prepare: () => {}, horizontal: true },
    { name: 'coloured', tracks: () => null, prepare: colourBars }
];

function summarise(partials: string[], thickness: number): CaseSummary {
    const other: string[] = [];
    const intervals = new Map<string, [number, number][]>();
    partials.forEach((svg, p) => {
        for (const m of svg.matchAll(/<[^>]+>|[^<]+/g)) {
            const tok = m[0];
            if (tok.trim().length === 0) {
                continue;
            }
            if (tok.startsWith('<rect ')) {
                const r = /x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" fill="([^"]+)"/.exec(tok);
                if (r && Math.abs(Number.parseFloat(r[4]) - thickness) < 1e-9) {
                    const x = Number.parseFloat(r[1]);
                    const w = Number.parseFloat(r[3]);
                    const key = `${p}|${r[5]}|${r[2]}|${r[4]}`;
                    let list = intervals.get(key);
                    if (!list) {
                        list = [];
                        intervals.set(key, list);
                    }
                    list.push([x, x + w]);
                    continue;
                }
            }
            other.push(`${p}|${tok}`);
        }
    });
    other.sort();
    const lines: Record<string, string> = {};
    for (const [k, list] of intervals) {
        list.sort((a, b) => a[0] - b[0]);
        const merged: [number, number][] = [];
        for (const [a, b] of list) {
            const last = merged.length > 0 ? merged[merged.length - 1] : null;
            if (last && a <= last[1] + 1e-6) {
                last[1] = Math.max(last[1], b);
            } else {
                merged.push([a, b]);
            }
        }
        lines[k] = merged.map(([a, b]) => `${a.toFixed(4)}:${b.toFixed(4)}`).join(';');
    }
    return {
        partials: partials.length,
        other: crypto.createHash('sha1').update(other.join('\n')).digest('hex'),
        otherCount: other.length,
        lines
    };
}

function render(file: string, variant: LayoutVariant & { horizontal?: boolean }): CaseSummary {
    const settings = new Settings();
    if (variant.horizontal) {
        settings.display.layoutMode = LayoutMode.Horizontal;
    }
    const h = new LayoutHarness(settings);
    const partials: string[] = [];
    h.renderer.partialRenderFinished.on(e => partials.push(String(e.renderResult)));
    h.paint = false;
    const score = LayoutHarness.loadScore(file, h.settings);
    variant.prepare(score);
    h.render(score, variant.tracks(score), 1300);
    for (const id of h.partialIds) {
        h.renderer.renderResult(id);
    }
    return summarise(partials, h.settings.display.resources.engravingSettings.staffLineThickness);
}

describe('StaffLineSvgEquivalence', () => {
    const root = process.cwd();
    const out = process.env.STAFF_LINE_SVG_OUT ?? path.join(LayoutCorpus.outDir(root), 'staff-line-svg');
    fs.mkdirSync(out, { recursive: true });
    const files = LayoutCorpus.files(root).filter(
        f => !process.env.LAYOUT_FLOW_FILE || f.includes(process.env.LAYOUT_FLOW_FILE)
    );
    const variants = [...LayoutCorpus.variants, ...extraVariants].filter(
        v => !process.env.LAYOUT_FLOW_VARIANT || v.name === process.env.LAYOUT_FLOW_VARIANT
    );

    for (const variant of variants) {
        it(variant.name, () => {
            const result: Record<string, CaseSummary | string> = {};
            for (const file of files) {
                const rel = path.relative(root, file);
                try {
                    result[rel] = render(file, variant);
                } catch (e) {
                    result[rel] = `SKIP ${(e as Error).message}`;
                }
            }
            fs.writeFileSync(path.join(out, `${variant.name}.json`), JSON.stringify(result));
        });
    }
});
