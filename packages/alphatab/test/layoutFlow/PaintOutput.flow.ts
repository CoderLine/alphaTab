/** @target web */
// biome-ignore-all lint/style/useTemplate: mirrors the string concatenation of SvgCanvas
// What the SVG paint produces and what building it costs: output size and element census per
// reference score (DOM parse/retain estimates), canvas call counts, the copy volume an immutable
// string buffer causes (C#/Kotlin `buffer += …`), and paint allocations of alternative buffer
// strategies. Run: npm run test-layout-flow -- PaintOutput   (LAYOUT_FLOW_FILE=<name> limits the scores)
import fs from 'node:fs';
import path from 'node:path';
import { CssFontSvgCanvas } from '@coderline/alphatab/platform/svg/CssFontSvgCanvas';
import { SvgCanvas } from '@coderline/alphatab/platform/svg/SvgCanvas';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { AllocationSampler } from './AllocationSampler';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

const kb = (b: number) => `${(b / 1024).toFixed(0)} KB`;
const mb = (b: number) => `${(b / 1024 / 1024).toFixed(2)} MB`;

function count(s: string, re: RegExp): number {
    let n = 0;
    re.lastIndex = 0;
    while (re.exec(s) !== null) {
        n++;
    }
    return n;
}

function bytesOf(s: string, re: RegExp): number {
    let n = 0;
    re.lastIndex = 0;
    let m: RegExpExecArray | null = re.exec(s);
    while (m !== null) {
        n += m[0].length;
        m = re.exec(s);
    }
    return n;
}

/** Characters saved when every decimal number is written with at most `digits` fraction digits. */
function roundingSavings(s: string, digits: number): number {
    const re = /-?\d+\.\d+/g;
    let saved = 0;
    let m: RegExpExecArray | null = re.exec(s);
    while (m !== null) {
        const v = Number(m[0]);
        const f = 10 ** digits;
        const r = String(Math.round(v * f) / f);
        saved += m[0].length - r.length;
        m = re.exec(s);
    }
    return saved;
}

function census(svgs: string[], out: string[]) {
    const all = svgs.join('');
    const sizes = svgs.map(s => s.length).sort((a, b) => a - b);
    const els = (s: string) => count(s, /<(rect|path|text|g)[\s>]/g);
    const elCounts = svgs.map(els).sort((a, b) => a - b);
    out.push(
        `partials=${svgs.length} svg bytes total=${kb(all.length)} per partial median=${kb(sizes[sizes.length >> 1])} max=${kb(sizes[sizes.length - 1])}`
    );
    out.push(
        `elements total=${els(all)} per partial median=${elCounts[elCounts.length >> 1]} max=${elCounts[elCounts.length - 1]}`
    );
    const rows: [string, RegExp][] = [
        ['<rect', /<rect [^>]*>\n?/g],
        ['<path', /<path [^>]*>/g],
        ['<text> (fillText)', /<text x=[^>]*>[^<]*<\/text>/g],
        [
            'music symbol <g class="at"><text>',
            /<g transform="translate\([^)]*\)" class="at" ><text[^>]*>[^<]*<\/text><\/g>/g
        ],
        ['beat group <g class="b…">', /<g class="b\d+">/g],
        ['</g>', /<\/g>/g]
    ];
    out.push('| element | count | bytes | share | bytes/elem |');
    out.push('|---|---|---|---|---|');
    for (const [name, re] of rows) {
        const c = count(all, re);
        const b = bytesOf(all, re);
        out.push(
            `| ${name} | ${c} | ${kb(b)} | ${((b / all.length) * 100).toFixed(1)}% | ${(b / Math.max(1, c)).toFixed(0)} |`
        );
    }
    const numBytes = bytesOf(all, /-?\d+(\.\d+)?/g);
    const decimals = count(all, /-?\d+\.\d+/g);
    const longDecimals = count(all, /-?\d+\.\d{4,}/g);
    out.push(
        `numbers: ${kb(numBytes)} (${((numBytes / all.length) * 100).toFixed(1)}%), decimals=${decimals}, with ≥4 fraction digits=${longDecimals}`
    );
    for (const d of [3, 2, 1]) {
        const s = roundingSavings(all, d);
        out.push(`  rounding to ${d} fraction digits saves ${kb(s)} (${((s / all.length) * 100).toFixed(1)}%)`);
    }
    const redundancies: [string, RegExp][] = [
        ['rect fill="#000000"', /<rect [^>]*fill="#000000"/g],
        ['rect " />\\n tail (vs "/>")', /" \/>\n/g],
        ['music text style="stroke:none"', / style="stroke:none"/g],
        ['music g ` class="at" ` + <text…></text></g> wrapper', / class="at" ><text/g],
        ["fillText style='stroke: none; font:…'", /style='stroke: none; font:[^']*'/g],
        ['path style="stroke: none"', / style="stroke: none"\/>/g],
        ['empty beat group <g class="b…"></g>', /<g class="b\d+"><\/g>/g]
    ];
    out.push('| pattern | count | bytes | share |');
    out.push('|---|---|---|---|');
    for (const [name, re] of redundancies) {
        const c = count(all, re);
        const b = bytesOf(all, re);
        out.push(`| ${name} | ${c} | ${kb(b)} | ${((b / all.length) * 100).toFixed(1)}% |`);
    }
}

const counted = new Map<string, number>();
function installCanvasCounters(): () => void {
    const restores: (() => void)[] = [];
    for (const proto of [SvgCanvas.prototype, CssFontSvgCanvas.prototype] as any[]) {
        for (const name of Object.getOwnPropertyNames(proto)) {
            if (name === 'constructor') {
                continue;
            }
            const d = Object.getOwnPropertyDescriptor(proto, name)!;
            if (typeof d.value !== 'function') {
                continue;
            }
            const orig = d.value;
            proto[name] = function (this: any) {
                counted.set(name, (counted.get(name) ?? 0) + 1);
                // biome-ignore lint/complexity/noArguments: transparent probe wrapper
                return orig.apply(this, arguments);
            };
            restores.push(() => {
                proto[name] = orig;
            });
        }
    }
    const applyBar = ElementStyleHelper.applyBar;
    (ElementStyleHelper as any).applyBar = function (this: any) {
        counted.set('ElementStyleHelper.applyBar', (counted.get('ElementStyleHelper.applyBar') ?? 0) + 1);
        // biome-ignore lint/complexity/noArguments: transparent probe wrapper
        return applyBar.apply(this, arguments as any);
    };
    restores.push(() => {
        (ElementStyleHelper as any).applyBar = applyBar;
    });
    return () => {
        for (const r of restores) {
            r();
        }
    };
}

/**
 * Counts writes of the canvas state properties and the writes that change the value: what a
 * canvas with expensive setters (HTML5 `fillStyle`/`font`, alphaSkia text styles) pays.
 */
function installStateCounter(canvas: any) {
    const stats = new Map<string, { sets: number; changes: number }>();
    const names = ['color', 'font', 'textAlign', 'textBaseline', 'lineWidth'];
    for (const name of names) {
        let value = canvas[name];
        const st = { sets: 0, changes: 0 };
        stats.set(name, st);
        Object.defineProperty(canvas, name, {
            configurable: true,
            get: () => value,
            set: (v: any) => {
                st.sets++;
                const same = name === 'color' ? v.rgba === value.rgba : v === value;
                if (!same) {
                    st.changes++;
                }
                value = v;
            }
        });
    }
    return {
        stats,
        uninstall: () => {
            for (const name of names) {
                const v = canvas[name];
                delete canvas[name];
                canvas[name] = v;
            }
        }
    };
}

/**
 * Replaces the canvas `buffer` and `_currentPath` fields with accessors that count appends and
 * sum the resulting lengths: the characters an immutable string `+=` copies.
 */
function installCopyCounter(canvas: any) {
    const stats = { bufferSets: 0, bufferCopied: 0, pathSets: 0, pathCopied: 0 };
    let buffer: string = canvas.buffer;
    let p: string = canvas._currentPath;
    Object.defineProperty(canvas, 'buffer', {
        configurable: true,
        get: () => buffer,
        set: (v: string) => {
            stats.bufferSets++;
            stats.bufferCopied += v.length;
            buffer = v;
        }
    });
    Object.defineProperty(canvas, '_currentPath', {
        configurable: true,
        get: () => p,
        set: (v: string) => {
            stats.pathSets++;
            stats.pathCopied += v.length;
            p = v;
        }
    });
    return {
        stats,
        uninstall: () => {
            delete canvas.buffer;
            delete canvas._currentPath;
            canvas.buffer = buffer;
            canvas._currentPath = p;
        }
    };
}

/** Collects the appended pieces in an array that `endRender` joins. */
function installPartsBuffer(canvas: any) {
    let parts: string[] = [];
    const proto = Object.getPrototypeOf(canvas);
    const endRender = proto.endRender;
    Object.defineProperty(canvas, 'buffer', {
        configurable: true,
        get: () => '',
        set: (v: string) => {
            parts.push(v);
        }
    });
    canvas.beginRender = function (w: number, h: number) {
        parts = [];
        return proto.beginRender.call(this, w, h);
    };
    canvas.endRender = () => {
        parts.push('</svg>');
        const r = parts.join('');
        parts = [];
        return r;
    };
    return () => {
        delete canvas.buffer;
        delete canvas.beginRender;
        delete canvas.endRender;
        canvas.buffer = '';
        void endRender;
    };
}

/** `fillRect` writing its pieces straight into a parts array (numbers converted by `join`). */
function installPiecewiseRect(canvas: any) {
    const uninstallParts = installPartsBuffer(canvas);
    let parts: string[] = [];
    const proto = Object.getPrototypeOf(canvas);
    Object.defineProperty(canvas, 'buffer', {
        configurable: true,
        get: () => '',
        set: (v: string) => {
            parts.push(v);
        }
    });
    canvas.beginRender = function (w: number, h: number) {
        parts = [];
        return proto.beginRender.call(this, w, h);
    };
    canvas.endRender = () => {
        parts.push('</svg>');
        const r = parts.join('');
        parts = [];
        return r;
    };
    canvas.fillRect = function (this: any, x: number, y: number, w: number, h: number) {
        if (w > 0) {
            parts.push('<rect x="', x as any, '" y="', y as any, '" width="', w as any, '" height="', h as any);
            parts.push('" fill="', this.color.rgba, '" />\n');
        }
    };
    return () => {
        delete canvas.fillRect;
        uninstallParts();
    };
}

/**
 * Production string building with fewer concatenations: the colour/font dependent attribute
 * tails are memoised for the last state and every element is appended with one `+=`.
 * `blackRectFill: false` and `round` change the output and only quantify those options.
 */
function installCachedTails(canvas: any, blackRectFill: boolean, round: boolean) {
    const r = round ? (v: number) => Math.round(v * 100) / 100 : (v: number) => v;
    let rectColor: any = null;
    let rectTail = '';
    let textKey: any[] = [];
    let textTail = '';
    let symKey: any[] = [];
    let symTail = '';
    const escapeText = (SvgCanvas as any)._escapeText as (t: string) => string;
    canvas.fillRect = function (this: any, x: number, y: number, w: number, h: number) {
        if (w > 0) {
            const c = this.color;
            if (c !== rectColor) {
                rectColor = c;
                rectTail = !blackRectFill && c.rgba === '#000000' ? '" />\n' : '" fill="' + c.rgba + '" />\n';
            }
            this.buffer += '<rect x="' + r(x) + '" y="' + r(y) + '" width="' + r(w) + '" height="' + r(h) + rectTail;
        }
    };
    canvas.fillText = function (this: any, text: string, x: number, y: number) {
        if (text === '') {
            return;
        }
        const font = this.font;
        const css = font.toCssString(this.settings.display.scale);
        if (
            textKey[0] !== css ||
            textKey[1] !== this.textBaseline ||
            textKey[2] !== this.color ||
            textKey[3] !== this.textAlign
        ) {
            textKey = [css, this.textBaseline, this.color, this.textAlign];
            let t = '" style=\'stroke: none; font:' + css + '; ' + this.getSvgBaseLine() + "'";
            if (this.color.rgba !== '#000000') {
                t += ' fill="' + this.color.rgba + '"';
            }
            if (this.textAlign !== 0) {
                t += ' text-anchor="' + this.getSvgTextAlignment(this.textAlign) + '"';
            }
            textTail = t + '>';
        }
        this.buffer += '<text x="' + r(x) + '" y="' + r(y) + textTail + escapeText(text) + '</text>';
    };
    canvas._fillMusicFontSymbolText = function (
        this: any,
        x: number,
        y: number,
        relativeScale: number,
        symbols: string,
        centerAtPosition?: boolean
    ) {
        const scale = this.scale * relativeScale;
        if (symKey[0] !== scale || symKey[1] !== this.color || symKey[2] !== !!centerAtPosition) {
            symKey = [scale, this.color, !!centerAtPosition];
            let t = scale !== 1 ? ' style="font-size: ' + scale * 100 + '%; stroke:none"' : ' style="stroke:none"';
            if (this.color.rgba !== '#000000') {
                t += ' fill="' + this.color.rgba + '"';
            }
            if (centerAtPosition) {
                t += ' text-anchor="middle"';
            }
            symTail = t + '>';
        }
        this.buffer +=
            '<g transform="translate(' + r(x) + ' ' + r(y) + ')" class="at" ><text' + symTail + symbols + '</text></g>';
    };
    return () => {
        delete canvas.fillRect;
        delete canvas.fillText;
        delete canvas._fillMusicFontSymbolText;
    };
}

describe('PaintOutput', () => {
    const root = process.cwd();
    const lines: string[] = [];
    const refs = LayoutCorpus.referenceScores.filter(
        r => !process.env.LAYOUT_FLOW_FILE || r.file.includes(process.env.LAYOUT_FLOW_FILE)
    );

    for (const ref of refs) {
        it(ref.name, () => {
            const out: string[] = [`## ${ref.name} (${ref.file})`];
            const file = path.join(root, ref.file);
            const h = new LayoutHarness(new Settings());
            h.paint = false;
            const score = LayoutHarness.loadScore(file, h.settings);
            const pass = h.render(score, null, 1300);
            const ids = [...h.partialIds];
            let area = 0;
            let maxHeight = 0;
            for (const sys of pass.systems) {
                area += 1300 * sys.height;
                maxHeight = Math.max(maxHeight, sys.height);
            }
            const svgs = new Map<string, string>();
            h.renderer.partialRenderFinished.on(e => {
                svgs.set(e.id, String(e.renderResult));
            });
            const paintAll = () => {
                // the attribution glyph scrambles its path through Math.random
                const random = Math.random;
                let state = 0x2545f491;
                Math.random = () => {
                    state = (Math.imul(state, 1664525) + 1013904223) | 0;
                    return (state >>> 8) / 16777216;
                };
                try {
                    for (const id of ids) {
                        h.renderer.renderResult(id);
                    }
                } finally {
                    Math.random = random;
                }
            };
            paintAll();
            out.push(
                `system partial pixels (1300 wide, dpr 1): ${(area / 1e6).toFixed(1)} Mpx over ${pass.systems.length} systems, max height ${maxHeight}px → RGBA backing ${mb(area * 4)} at dpr 1, ${mb(area * 16)} at dpr 2`
            );
            out.push('### output census (scale 1, width 1300)');
            census([...svgs.values()], out);

            // canvas calls and immutable-buffer copy volume
            const restore = installCanvasCounters();
            const copy = installCopyCounter(h.renderer.canvas);
            const state = installStateCounter(h.renderer.canvas);
            counted.clear();
            try {
                paintAll();
            } finally {
                state.uninstall();
                copy.uninstall();
                restore();
            }
            out.push('### canvas calls per full paint');
            out.push(
                [...counted.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => `${k}=${v}`)
                    .join(', ')
            );
            out.push(
                `state writes (sets / value changes): ${[...state.stats.entries()].map(([k, v]) => `${k}=${v.sets}/${v.changes}`).join(', ')}`
            );
            let maxPartial = 0;
            for (const s of svgs.values()) {
                maxPartial = Math.max(maxPartial, s.length);
            }
            out.push(
                `buffer appends=${copy.stats.bufferSets}, chars copied by immutable += : ${mb(copy.stats.bufferCopied)} (${(copy.stats.bufferCopied / [...svgs.values()].reduce((a, s) => a + s.length, 0)).toFixed(0)}x output); path appends=${copy.stats.pathSets}, path chars copied ${mb(copy.stats.pathCopied)}`
            );

            // allocations of buffer strategies, the final flat string included
            const canvas = h.renderer.canvas as any;
            const variants: [string, () => () => void][] = [
                ['production (rope)', () => () => {}],
                ['parts array + join', () => installPartsBuffer(canvas)],
                ['parts array, piecewise fillRect', () => installPiecewiseRect(canvas)],
                ['cached tails, one += per element (same output)', () => installCachedTails(canvas, true, false)],
                ['cached tails + no black rect fill (output change)', () => installCachedTails(canvas, false, false)],
                ['cached tails + 2-digit rounding (output change)', () => installCachedTails(canvas, true, true)]
            ];
            // the memoised variant must reproduce the production output
            {
                const before = new Map(svgs);
                const uninstall = installCachedTails(canvas, true, false);
                try {
                    paintAll();
                } finally {
                    uninstall();
                }
                let equal = 0;
                for (const [id, s] of before) {
                    if (svgs.get(id) === s) {
                        equal++;
                    }
                }
                out.push(`cached-tails output identical: ${equal}/${before.size} partials`);
            }
            const flatten = () => {
                let sum = 0;
                for (const s of svgs.values()) {
                    // character access flattens a rope
                    sum += s.charCodeAt(s.length >> 1);
                }
                return sum;
            };
            const res = new Map<string, number[]>();
            const times = new Map<string, number[]>();
            for (let rep = 0; rep < 5; rep++) {
                for (const [name, install] of variants) {
                    const uninstall = install();
                    try {
                        paintAll();
                        flatten();
                        const r = AllocationSampler.measure(() => {
                            paintAll();
                            flatten();
                        }, 1024);
                        const t0 = performance.now();
                        paintAll();
                        flatten();
                        const t1 = performance.now();
                        if (rep > 0) {
                            res.set(name, [...(res.get(name) ?? []), r.totalBytes]);
                            times.set(name, [...(times.get(name) ?? []), t1 - t0]);
                        }
                    } finally {
                        uninstall();
                    }
                }
            }
            out.push('### paint allocation by buffer strategy (svg flattened, 4 samples each, interleaved)');
            out.push('| strategy | alloc MB | paint+flatten ms (hint) |');
            out.push('|---|---|---|');
            for (const [name] of variants) {
                out.push(
                    `| ${name} | ${res
                        .get(name)!
                        .map(b => (b / 1024 / 1024).toFixed(1))
                        .join(' / ')} | ${times
                        .get(name)!
                        .map(t => t.toFixed(0))
                        .join(' / ')} |`
                );
            }

            // scale 1.5 output size (zoomed display)
            const h2 = new LayoutHarness(new Settings());
            h2.settings.display.scale = 1.5;
            h2.paint = false;
            h2.render(LayoutHarness.loadScore(file, h2.settings), null, 1300);
            const svgs2: string[] = [];
            h2.renderer.partialRenderFinished.on(e => {
                svgs2.push(String(e.renderResult));
            });
            for (const id of h2.partialIds) {
                h2.renderer.renderResult(id);
            }
            out.push('### output census (scale 1.5, width 1300)');
            census(svgs2, out);

            console.log(out.join('\n'));
            lines.push(...out, '');
        });
    }

    it('report', () => {
        const target = path.join(LayoutCorpus.outDir(root), 'paint-output.txt');
        fs.writeFileSync(target, lines.join('\n'));
        console.log(`report written to ${target}`);
    });
});
