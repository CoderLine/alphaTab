/** @target web */
/// <reference types="vite/client" />
// What the measure stage builds and keeps: the retained object tree below the staff systems per
// class (counts, estimated self bytes, boxed numbers), which glyphs paint, which glyphs are laid
// out but dropped, text measurement and accidental-helper call counts.
// Run: npm run test-layout-flow -- GlyphCensus   (LAYOUT_FLOW_FILE=<name> limits the scores)
import fs from 'node:fs';
import path from 'node:path';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { Note } from '@coderline/alphatab/model/Note';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { GlyphGroup } from '@coderline/alphatab/rendering/glyphs/GlyphGroup';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { ScoreLayout } from '@coderline/alphatab/rendering/layout/ScoreLayout';
import { AccidentalHelper } from '@coderline/alphatab/rendering/utils/AccidentalHelper';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

/** Per-class tally of the retained tree. */
class ClassStats {
    public count = 0;
    public bytes = 0;
    public boxed = 0;
    public painted = 0;
    public laidOut = 0;
    public zeroSize = 0;
}

class Counter {
    public readonly map = new Map<string, number>();
    public add(k: string, v: number = 1) {
        this.map.set(k, (this.map.get(k) ?? 0) + v);
    }
    public top(n: number): [string, number][] {
        return Array.from(this.map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, n);
    }
    public get total() {
        let t = 0;
        for (const v of this.map.values()) {
            t += v;
        }
        return t;
    }
}

// V8 without pointer compression (node default): 24 B object header, 8 B per field, 16 B per
// HeapNumber, JSArray 32 B + FixedArray 16 B + 8 B per slot. Slack, double-representation fields
// holding integers and dictionary-mode objects are not visible from JS, so bytes are a lower bound.
const objectBytes = (fields: number) => 24 + 8 * fields;
const arrayBytes = (length: number) => 32 + (length > 0 ? 16 + 8 * length : 0);
const isBoxed = (v: number) => !Number.isInteger(v) || v > 0x7fffffff || v < -0x80000000 || Object.is(v, -0);

class Probe {
    public static active = false;
    public static readonly laidOut = new Set<object>();
    public static readonly inLayout = new Set<object>();
    public static readonly painted = new Set<object>();
    public static readonly layoutStack: string[] = [];
    public static readonly measureByCaller = new Counter();
    public static readonly measureStrings = new Counter();
    public static readonly calls = new Counter();
    public static readonly layoutCalls = new Counter();
    public static readonly distinct = new Map<string, Set<unknown>>();
    private static _installed = false;

    public static reset() {
        Probe.laidOut.clear();
        Probe.painted.clear();
        Probe.layoutStack.length = 0;
        Probe.measureByCaller.map.clear();
        Probe.measureStrings.map.clear();
        Probe.calls.map.clear();
        Probe.layoutCalls.map.clear();
        Probe.distinct.clear();
    }

    private static _count(name: string, key: unknown) {
        Probe.calls.add(name);
        let s = Probe.distinct.get(name);
        if (!s) {
            s = new Set();
            Probe.distinct.set(name, s);
        }
        s.add(key);
    }

    public static install(canvasProto: Record<string, unknown>) {
        if (Probe._installed) {
            return;
        }
        Probe._installed = true;
        const modules = import.meta.glob('../../src/rendering/**/*.ts', { eager: true }) as Record<
            string,
            Record<string, unknown>
        >;
        const seen = new Set<unknown>();
        for (const mod of Object.values(modules)) {
            for (const exported of Object.values(mod)) {
                if (typeof exported !== 'function' || seen.has(exported)) {
                    continue;
                }
                seen.add(exported);
                const proto = (exported as { prototype?: unknown }).prototype as Record<string, unknown> | undefined;
                if (!proto || !(proto instanceof Glyph || exported === Glyph)) {
                    continue;
                }
                Probe._wrap(proto, 'doLayout', true);
                Probe._wrap(proto, 'paint', false);
            }
        }

        const measure = canvasProto.measureText as (t: string) => unknown;
        canvasProto.measureText = function (this: object, text: string) {
            if (Probe.active) {
                const st = Probe.layoutStack;
                Probe.measureByCaller.add(st.length > 0 ? st[st.length - 1] : '(outside glyph doLayout)');
                Probe.measureStrings.add(text);
            }
            return measure.call(this, text);
        };

        const ah = AccidentalHelper.prototype as unknown as Record<string, (...a: unknown[]) => unknown>;
        for (const m of [
            'applyAccidental',
            'applyAccidentalForValue',
            'getNoteSteps',
            'getNoteStepsForValue',
            'getMaxSteps',
            'getMinSteps',
            'getMaxStepsNote',
            'getMinStepsNote'
        ]) {
            const orig = ah[m];
            ah[m] = function (this: object, ...args: unknown[]) {
                if (Probe.active) {
                    const a0 = args[0] as { id?: number } | number;
                    Probe._count(`AccidentalHelper.${m}`, typeof a0 === 'object' && a0 ? a0 : a0);
                }
                return orig.apply(this, args);
            };
        }
        const mu = ModelUtils as unknown as Record<string, (...a: unknown[]) => unknown>;
        for (const m of ['resolveSpelling', 'computeAccidentalForSpelling']) {
            const orig = mu[m];
            mu[m] = function (this: unknown, ...args: unknown[]) {
                if (Probe.active) {
                    Probe._count(`ModelUtils.${m}`, `${args[0]}|${args[1]}|${args[2]}`);
                }
                return orig.apply(this, args);
            };
        }
        const sh = AccidentalHelper as unknown as Record<string, (...a: unknown[]) => unknown>;
        {
            const orig = sh.computeStepsWithoutAccidentals;
            sh.computeStepsWithoutAccidentals = function (this: unknown, ...args: unknown[]) {
                if (Probe.active) {
                    Probe._count('AccidentalHelper.computeStepsWithoutAccidentals', args[1]);
                }
                return orig.apply(this, args);
            };
        }
        for (const g of ['displayValue', 'displayValueWithoutBend', 'realValue', 'realValueWithoutHarmonic']) {
            const desc = Object.getOwnPropertyDescriptor(Note.prototype, g);
            if (!desc?.get) {
                continue;
            }
            const get = desc.get;
            Object.defineProperty(Note.prototype, g, {
                configurable: true,
                get(this: Note) {
                    if (Probe.active) {
                        Probe._count(`Note.${g}`, this);
                        if (process.env.GETTER_CALLERS) {
                            const frames = (new Error().stack ?? '').split('\n').slice(2);
                            const f = frames.find(l => !l.includes('/model/Note.ts') && !l.includes('GlyphCensus'));
                            const m = f ? /at (\S+) .*\/([A-Za-z]+\.ts):(\d+)/.exec(f) : null;
                            Probe.calls.add(`  ${g} <- ${m ? `${m[1]} ${m[2]}` : f?.trim()}`);
                        }
                    }
                    return get.call(this);
                }
            });
        }
    }

    private static _wrap(proto: Record<string, unknown>, method: string, layout: boolean) {
        const desc = Object.getOwnPropertyDescriptor(proto, method);
        if (!desc || typeof desc.value !== 'function') {
            return;
        }
        const orig = desc.value as (...args: unknown[]) => unknown;
        proto[method] = function (this: object, ...args: unknown[]) {
            if (!Probe.active) {
                return orig.apply(this, args);
            }
            if (layout) {
                // super chains count once per receiver and call
                if (Probe.inLayout.has(this)) {
                    return orig.apply(this, args);
                }
                Probe.inLayout.add(this);
                Probe.laidOut.add(this);
                Probe.layoutCalls.add(this.constructor.name);
                Probe.layoutStack.push(this.constructor.name);
                try {
                    return orig.apply(this, args);
                } finally {
                    Probe.layoutStack.pop();
                    Probe.inLayout.delete(this);
                }
            }
            Probe.painted.add(this);
            return orig.apply(this, args);
        };
    }
}

interface Census {
    classes: Map<string, ClassStats>;
    arrays: Map<string, { count: number; length: number; empty: number; single: number; bytes: number }>;
    maps: Map<string, { count: number; size: number }>;
    groupChildClasses: Map<string, Set<string>>;
    glyphs: Set<object>;
    totalObjects: number;
    totalBytes: number;
    byRenderer: Counter;
    plainByOwner: Counter;
}

function isStop(v: object, stops: ((v: object) => boolean)[]): boolean {
    for (const s of stops) {
        if (s(v)) {
            return true;
        }
    }
    return false;
}

function walk(roots: object[], stops: ((v: object) => boolean)[]): Census {
    const c: Census = {
        classes: new Map(),
        arrays: new Map(),
        maps: new Map(),
        groupChildClasses: new Map(),
        glyphs: new Set(),
        totalObjects: 0,
        totalBytes: 0,
        byRenderer: new Counter(),
        plainByOwner: new Counter()
    };
    const seen = new Set<object>();
    const stack: [object, string][] = roots.map(r => [r, '(root)']);
    const cls = (name: string) => {
        let s = c.classes.get(name);
        if (!s) {
            s = new ClassStats();
            c.classes.set(name, s);
        }
        return s;
    };
    const push = (v: unknown, owner: string) => {
        if (v === null || typeof v !== 'object' || seen.has(v as object)) {
            return;
        }
        if (isStop(v as object, stops)) {
            return;
        }
        seen.add(v as object);
        stack.push([v as object, owner]);
    };
    for (const r of roots) {
        seen.add(r);
    }
    while (stack.length > 0) {
        const [o, owner] = stack.pop()!;
        c.totalObjects++;
        if (Array.isArray(o)) {
            let a = c.arrays.get(owner);
            if (!a) {
                a = { count: 0, length: 0, empty: 0, single: 0, bytes: 0 };
                c.arrays.set(owner, a);
            }
            a.count++;
            a.length += o.length;
            if (o.length === 0) {
                a.empty++;
            } else if (o.length === 1) {
                a.single++;
            }
            const b = arrayBytes(o.length);
            a.bytes += b;
            c.totalBytes += b;
            // number-only arrays use unboxed double or smi elements
            let boxed = 0;
            let allNumbers = true;
            for (const e of o) {
                if (typeof e === 'number') {
                    if (isBoxed(e)) {
                        boxed++;
                    }
                } else {
                    allNumbers = false;
                }
                push(e, `${owner}[]`);
            }
            if (!allNumbers) {
                c.totalBytes += boxed * 16;
                a.bytes += boxed * 16;
            }
            continue;
        }
        if (ArrayBuffer.isView(o)) {
            const b = (o as unknown as { byteLength: number }).byteLength + 64;
            cls(o.constructor.name).count++;
            cls(o.constructor.name).bytes += b;
            c.totalBytes += b;
            continue;
        }
        if (o instanceof Map || o instanceof Set) {
            let m = c.maps.get(owner);
            if (!m) {
                m = { count: 0, size: 0 };
                c.maps.set(owner, m);
            }
            m.count++;
            m.size += o.size;
            // OrderedHashMap: header plus buckets (size/2) plus 3 slots per entry, at least 4 entries
            const cap = Math.max(4, 1 << Math.ceil(Math.log2(Math.max(1, o.size))));
            const b = 24 + 16 + 8 * (3 + cap / 2 + cap * (o instanceof Map ? 3 : 2));
            cls(o instanceof Map ? 'Map' : 'Set').count++;
            cls(o instanceof Map ? 'Map' : 'Set').bytes += b;
            c.totalBytes += b;
            if (o instanceof Map) {
                for (const [k, v] of o) {
                    push(k, `${owner}<key>`);
                    push(v, `${owner}<value>`);
                }
            } else {
                for (const v of o) {
                    push(v, `${owner}<value>`);
                }
            }
            continue;
        }
        const name = o.constructor?.name || 'Object';
        if (name === 'BeamingHelper' || name === 'BarHelpers' || name === 'BeamingHelperDrawInfo') {
            const r = (o as Record<string, object | undefined>)['_renderer'];
            c.byRenderer.add(`${name} @ ${r ? r.constructor.name : '?'}`);
        }
        if (name === 'Object') {
            c.plainByOwner.add(`${owner} {${Object.keys(o).join(',')}}`);
        }
        const s = cls(name);
        const keys = Object.keys(o);
        s.count++;
        const b = objectBytes(keys.length);
        s.bytes += b;
        let boxed = 0;
        for (const k of keys) {
            const v = (o as Record<string, unknown>)[k];
            if (typeof v === 'number' && isBoxed(v)) {
                boxed++;
            }
        }
        s.boxed += boxed;
        s.bytes += boxed * 16;
        c.totalBytes += b + boxed * 16;
        if (o instanceof Glyph) {
            c.glyphs.add(o);
            if (o.width === 0 && o.height === 0) {
                s.zeroSize++;
            }
            const r = (o as Glyph).renderer;
            c.byRenderer.add(r ? r.constructor.name : '(no renderer)');
            if (o instanceof GlyphGroup && o.glyphs) {
                let set = c.groupChildClasses.get(name);
                if (!set) {
                    set = new Set();
                    c.groupChildClasses.set(name, set);
                }
                for (const g of o.glyphs) {
                    set.add(g.constructor.name);
                }
            }
        }
        for (const k of keys) {
            push((o as Record<string, unknown>)[k], `${name}.${k}`);
        }
    }
    return c;
}

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(2)} MB`;

describe('GlyphCensus', () => {
    const root = process.cwd();
    const lines: string[] = [];
    const refs = LayoutCorpus.referenceScores.filter(
        r => !process.env.LAYOUT_FLOW_FILE || r.file.includes(process.env.LAYOUT_FLOW_FILE)
    );
    const modelModules = import.meta.glob('../../src/model/**/*.ts', { eager: true }) as Record<
        string,
        Record<string, unknown>
    >;
    const modelClasses = new Set<unknown>();
    for (const mod of Object.values(modelModules)) {
        for (const e of Object.values(mod)) {
            if (typeof e === 'function' && (e as { prototype?: unknown }).prototype) {
                modelClasses.add(e);
            }
        }
    }
    const stops: ((v: object) => boolean)[] = [
        v => v instanceof ScoreRenderer,
        v => v instanceof ScoreLayout,
        v => v instanceof Settings,
        v => {
            const proto = Object.getPrototypeOf(v);
            const ctor = proto?.constructor;
            return !!ctor && modelClasses.has(ctor);
        },
        // canvas, resources, metrics and fonts reached through settings/renderer
        v => {
            const n = v.constructor?.name ?? '';
            return (
                n.endsWith('Canvas') ||
                n === 'RenderingResources' ||
                n === 'SmuflMetrics' ||
                n === 'EngravingSettings' ||
                n === 'EventEmitter' ||
                n === 'EventEmitterOfT'
            );
        }
    ];

    for (const ref of refs) {
        it(ref.name, () => {
            const out: string[] = [`## ${ref.name} (${ref.file})`];
            const file = path.join(root, ref.file);

            const warm = new LayoutHarness(new Settings());
            warm.paint = false;
            warm.render(LayoutHarness.loadScore(file, warm.settings), null, 1300);
            Probe.install(Object.getPrototypeOf(warm.renderer.canvas!) as Record<string, unknown>);

            const h = new LayoutHarness(new Settings());
            h.paint = false;
            const score = LayoutHarness.loadScore(file, h.settings);
            Probe.reset();
            Probe.active = true;
            h.render(score, null, 1300);
            Probe.active = false;
            const laidOut = new Set(Probe.laidOut);
            const calls = new Map(Probe.calls.map);
            const distinct = new Map(Probe.distinct);
            const measureByCaller = Probe.measureByCaller.top(30);
            const measureStrings = new Counter();
            for (const [k, v] of Probe.measureStrings.map) {
                measureStrings.add(k, v);
            }
            const layoutCalls = new Counter();
            for (const [k, v] of Probe.layoutCalls.map) {
                layoutCalls.add(k, v);
            }

            const systems = h.renderer.layout!.systems;
            const census = walk(systems as unknown as object[], stops);

            Probe.reset();
            Probe.active = true;
            for (const id of h.partialIds) {
                h.renderer.renderResult(id);
            }
            Probe.active = false;
            const painted = new Set(Probe.painted);
            const afterPaint = walk(systems as unknown as object[], stops);

            // model totals for the rendered bars
            let notes = 0;
            let beats = 0;
            let bars = 0;
            const barSet = new Set<object>();
            for (const s of systems) {
                for (const st of s.allStaves) {
                    for (const r of st.barRenderers) {
                        bars++;
                        if (barSet.has(r.bar)) {
                            continue;
                        }
                        barSet.add(r.bar);
                    }
                }
            }
            for (const b of barSet) {
                const bar = b as unknown as { voices: { beats: { notes: unknown[] }[] }[] };
                for (const v of bar.voices) {
                    for (const bt of v.beats) {
                        beats++;
                        notes += bt.notes.length;
                    }
                }
            }
            const glyphTotal = census.glyphs.size;
            out.push(
                `model: ${barSet.size} bars (${bars} bar renderers), ${beats} beats, ${notes} notes; ` +
                    `retained below systems: ${census.totalObjects} objects, ≥ ${mb(census.totalBytes)}; ` +
                    `glyphs ${glyphTotal} (${(glyphTotal / bars).toFixed(1)}/renderer, ${(glyphTotal / Math.max(1, beats)).toFixed(1)}/model beat)`
            );
            out.push(
                `glyphs by renderer: ${census.byRenderer
                    .top(16)
                    .map(([k, v]) => `${k} ${v}`)
                    .join(', ')}`
            );

            // per class
            for (const s of census.classes.values()) {
                s.laidOut = 0;
                s.painted = 0;
            }
            for (const g of census.glyphs) {
                const s = census.classes.get(g.constructor.name)!;
                if (laidOut.has(g)) {
                    s.laidOut++;
                }
                if (painted.has(g)) {
                    s.painted++;
                }
            }
            const rows = Array.from(census.classes.entries()).sort((a, b) => b[1].bytes - a[1].bytes);
            out.push('### retained objects below the staff systems by class (bytes: lower-bound estimate)');
            out.push(
                `    ${'class'.padEnd(36)} ${'count'.padStart(7)} ${'bytes'.padStart(10)} ${'boxed#'.padStart(7)} ${'laidOut'.padStart(7)} ${'painted'.padStart(7)} ${'0-size'.padStart(7)}`
            );
            for (const [name, s] of rows.slice(0, 60)) {
                const isGlyph = s.laidOut > 0 || s.painted > 0 || s.zeroSize > 0;
                out.push(
                    `    ${name.padEnd(36)} ${String(s.count).padStart(7)} ${mb(s.bytes).padStart(10)} ${String(s.boxed).padStart(7)} ` +
                        `${(isGlyph ? String(s.laidOut) : '').padStart(7)} ${(isGlyph ? String(s.painted) : '').padStart(7)} ${(isGlyph ? String(s.zeroSize) : '').padStart(7)}`
                );
            }
            let arrBytes = 0;
            let arrCount = 0;
            for (const a of census.arrays.values()) {
                arrBytes += a.bytes;
                arrCount += a.count;
            }
            out.push(`### arrays: ${arrCount}, ≥ ${mb(arrBytes)}; by owner field`);
            for (const [k, a] of Array.from(census.arrays.entries())
                .sort((x, y) => y[1].bytes - x[1].bytes)
                .slice(0, 40)) {
                out.push(
                    `    ${k.padEnd(60)} n=${String(a.count).padStart(6)} len=${String(a.length).padStart(7)} empty=${String(a.empty).padStart(6)} single=${String(a.single).padStart(6)} ${mb(a.bytes)}`
                );
            }
            out.push('### plain objects (literals) by owner field and shape');
            for (const [k, v] of census.plainByOwner.top(12)) {
                out.push(`    ${String(v).padStart(7)}  ${k}`);
            }
            out.push('### maps and sets by owner field');
            for (const [k, m] of Array.from(census.maps.entries())
                .sort((x, y) => y[1].count - x[1].count)
                .slice(0, 25)) {
                out.push(`    ${k.padEnd(60)} n=${String(m.count).padStart(6)} entries=${String(m.size).padStart(7)}`);
            }
            out.push('### child classes per glyph-group class (receiver classes at GlyphGroup.doLayout/paint/bbox)');
            const all = new Set<string>();
            for (const [k, set] of Array.from(census.groupChildClasses.entries()).sort(
                (a, b) => b[1].size - a[1].size
            )) {
                for (const x of set) {
                    all.add(x);
                }
                out.push(`    ${k.padEnd(36)} ${set.size}: ${Array.from(set).join(', ')}`);
            }
            out.push(`    distinct child classes over all groups: ${all.size}`);

            // glyphs laid out during the initial layout that are not in the final tree
            const dropped = new Counter();
            for (const g of laidOut) {
                if (!census.glyphs.has(g)) {
                    dropped.add(g.constructor.name);
                }
            }
            out.push('### doLayout calls per glyph class during initial layout (calls / glyphs laid out)');
            const laidOutByClass = new Counter();
            for (const g of laidOut) {
                laidOutByClass.add(g.constructor.name);
            }
            for (const [k, v] of layoutCalls.top(25)) {
                out.push(
                    `    ${k.padEnd(36)} ${String(v).padStart(8)} / ${String(laidOutByClass.map.get(k) ?? 0).padStart(7)}`
                );
            }
            out.push(`### glyphs laid out but not retained: ${dropped.total} (of ${laidOut.size} laid out)`);
            for (const [k, v] of dropped.top(20)) {
                out.push(`    ${String(v).padStart(7)}  ${k}`);
            }
            const notPainted = new Counter();
            const notPaintedLeaf = new Counter();
            for (const g of census.glyphs) {
                if (!painted.has(g)) {
                    notPainted.add(g.constructor.name);
                    if (!(g instanceof GlyphGroup)) {
                        notPaintedLeaf.add(g.constructor.name);
                    }
                }
            }
            out.push(
                `### retained glyphs never painted: ${notPainted.total} of ${census.glyphs.size} (leaf, non-group: ${notPaintedLeaf.total})`
            );
            for (const [k, v] of notPainted.top(25)) {
                out.push(`    ${String(v).padStart(7)}  ${k}`);
            }
            const paintCreated = afterPaint.glyphs.size - census.glyphs.size;
            out.push(`### glyphs created during paint (lazy headers etc.): ${paintCreated}`);

            out.push(
                `### measureText during initial layout: ${measureStrings.total} calls, ${measureStrings.map.size} distinct strings`
            );
            for (const [k, v] of measureByCaller) {
                out.push(`    ${String(v).padStart(7)}  ${k}`);
            }
            out.push(
                `  top strings: ${measureStrings
                    .top(15)
                    .map(([k, v]) => `'${k}' ${v}`)
                    .join(', ')}`
            );
            out.push('### helper and getter calls during initial layout (calls / distinct receivers or keys)');
            for (const [k, v] of Array.from(calls.entries()).sort((a, b) => b[1] - a[1])) {
                out.push(
                    `    ${k.padEnd(52)} ${String(v).padStart(8)} / ${String(distinct.get(k)?.size ?? 0).padStart(7)}`
                );
            }

            console.log(out.slice(0, 3).join('\n'));
            lines.push(...out, '');
        });
    }

    it('report', () => {
        const target = path.join(LayoutCorpus.outDir(root), 'glyph-census.txt');
        fs.writeFileSync(target, lines.join('\n'));
        console.log(`report written to ${target}`);
    });
});
