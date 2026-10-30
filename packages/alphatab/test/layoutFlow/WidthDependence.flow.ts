/** @target web */
// Which numeric/boolean fields of the glyph layer depend on the system width: snapshots every own
// number/boolean field of each object reachable from the bar renderers (glyphs, effect bands, beam
// helpers, collision helpers) after a render at 1300 px and compares them by identity after resizes.
// Run: npm run test-layout-flow -- WidthDependence   (LAYOUT_FLOW_FILE=<name> limits the scores)
import fs from 'node:fs';
import path from 'node:path';
import { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

const descendInto = new Set(['EffectBandContainer', 'BarHelpers', 'BeamingHelper', 'BeamingHelperDrawInfo']);
const skipKeys = new Set(['renderer', '_renderer', 'container', '_container', 'staff', 'scoreRenderer']);

class Snapshot {
    public readonly fields = new Map<object, Map<string, number | boolean>>();
}

function take(renderers: BarRendererBase[]): Snapshot {
    const snap = new Snapshot();
    const visit = (o: object) => {
        if (snap.fields.has(o)) {
            return;
        }
        const own = new Map<string, number | boolean>();
        snap.fields.set(o, own);
        const rec = o as Record<string, unknown>;
        for (const k of Object.keys(rec)) {
            if (skipKeys.has(k)) {
                continue;
            }
            const v = rec[k];
            if (typeof v === 'number' || typeof v === 'boolean') {
                own.set(k, v);
            } else if (v && typeof v === 'object') {
                walkValue(v);
            }
        }
    };
    const walkValue = (v: unknown) => {
        if (!v || typeof v !== 'object') {
            return;
        }
        if (Array.isArray(v)) {
            for (const e of v) {
                walkValue(e);
            }
        } else if (v instanceof Map) {
            for (const e of v.values()) {
                walkValue(e);
            }
        } else if (v instanceof Glyph || v instanceof BarRendererBase || descendInto.has(v.constructor?.name ?? '')) {
            visit(v);
        }
    };
    for (const r of renderers) {
        visit(r);
    }
    return snap;
}

interface FieldStat {
    total: number;
    changed: number;
}

describe('WidthDependence', () => {
    const root = path.resolve(__dirname, '../..');
    const refs = LayoutCorpus.referenceScores.filter(
        r => !process.env.LAYOUT_FLOW_FILE || r.file.includes(process.env.LAYOUT_FLOW_FILE)
    );
    const lines: string[] = [];

    for (const ref of refs) {
        it(ref.name, () => {
            const out: string[] = [`## ${ref.name} (${ref.file})`];
            const h = new LayoutHarness(new Settings());
            h.paint = false;
            h.render(LayoutHarness.loadScore(path.join(root, ref.file), h.settings), null, 1300);
            const all = (h.renderer.layout! as unknown as Record<string, { renderers: BarRendererBase[] }[]>)[
                '_allMasterBarRenderers'
            ];
            const renderers: BarRendererBase[] = [];
            for (const m of all) {
                renderers.push(...m.renderers);
            }
            const base = take(renderers);

            const byField = new Map<string, FieldStat>();
            const objectsChanged = new Map<string, Set<object>>();
            const objectsTotal = new Map<string, number>();
            for (const [o] of base.fields) {
                const n = o.constructor.name;
                objectsTotal.set(n, (objectsTotal.get(n) ?? 0) + 1);
            }
            let created = 0;
            const createdByClass = new Map<string, number>();
            for (const width of [1000, 800, 1300]) {
                h.resize(width);
                const now = take(renderers);
                for (const [o, fields] of now.fields) {
                    const before = base.fields.get(o);
                    const n = o.constructor.name;
                    if (!before) {
                        created++;
                        createdByClass.set(n, (createdByClass.get(n) ?? 0) + 1);
                        continue;
                    }
                    for (const [k, v] of fields) {
                        const key = `${n}.${k}`;
                        let s = byField.get(key);
                        if (!s) {
                            s = { total: 0, changed: 0 };
                            byField.set(key, s);
                        }
                        s.total++;
                        const b = before.get(k);
                        if (b !== v && !(Number.isNaN(b) && Number.isNaN(v))) {
                            s.changed++;
                            let set = objectsChanged.get(n);
                            if (!set) {
                                set = new Set();
                                objectsChanged.set(n, set);
                            }
                            set.add(o);
                        }
                    }
                }
            }

            let fieldTotal = 0;
            let fieldChanged = 0;
            let objectsWithChange = 0;
            for (const s of byField.values()) {
                fieldTotal += s.total;
                fieldChanged += s.changed;
            }
            for (const set of objectsChanged.values()) {
                objectsWithChange += set.size;
            }
            out.push(
                `objects ${base.fields.size}, with a width-dependent field ${objectsWithChange}; ` +
                    `field samples ${fieldTotal} (3 resizes), changed ${fieldChanged}; objects created by resizes: ${created}`
            );
            out.push('### objects created by the resizes, by class');
            for (const [n, c] of Array.from(createdByClass.entries()).sort((a, b) => b[1] - a[1])) {
                out.push(`    ${String(c).padStart(7)}  ${n}`);
            }
            out.push('### objects with at least one width-dependent field (changed / existing objects of the class)');
            for (const [n, set] of Array.from(objectsChanged.entries()).sort((a, b) => b[1].size - a[1].size)) {
                out.push(
                    `    ${n.padEnd(36)} ${String(set.size).padStart(7)} / ${String(objectsTotal.get(n) ?? 0).padStart(7)}`
                );
            }
            out.push('### width-dependent fields (samples changed / samples)');
            for (const [k, s] of Array.from(byField.entries())
                .filter(e => e[1].changed > 0)
                .sort((a, b) => b[1].changed - a[1].changed)) {
                out.push(`    ${k.padEnd(56)} ${String(s.changed).padStart(7)} / ${String(s.total).padStart(7)}`);
            }
            console.log(out[1]);
            lines.push(...out, '');
        });
    }

    it('report', () => {
        const target = path.join(LayoutCorpus.outDir(root), 'width-dependence.txt');
        fs.writeFileSync(target, lines.join('\n'));
        console.log(`report written to ${target}`);
    });
});
