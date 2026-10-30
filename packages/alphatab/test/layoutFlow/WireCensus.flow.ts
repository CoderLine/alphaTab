/** @target web */
// What the MessagePack score sent to the rendering worker consists of, per model class: key bytes, value bytes by
// type, and entries whose value equals the class default (a fresh instance). Compared with the file size, the
// structured-clone size of the object tree, the retained model size, and importing the original file bytes.
// Run: npm run test-layout-flow -- WireCensus   (LAYOUT_FLOW_RUNS=<n> changes the repetitions,
// WIRE_CENSUS_FILES=<comma separated test-data paths> replaces the file list)
import fs from 'node:fs';
import path from 'node:path';
import v8 from 'node:v8';
import vm from 'node:vm';
import { AlphaTexExporter } from '@coderline/alphatab/exporter/AlphaTexExporter';
import { ScoreSerializer } from '@coderline/alphatab/generated/model/ScoreSerializer';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import type { IObjectWriter } from '@coderline/alphatab/io/IObjectWriter';
import type { RecordFields } from '@coderline/alphatab/io/RecordFields';
import { MessagePackObjectWriter } from '@coderline/alphatab/io/MessagePackObjectWriter';
import { PlainObjectWriter } from '@coderline/alphatab/io/PlainObjectWriter';
import { Logger } from '@coderline/alphatab/Logger';
import { LogLevel } from '@coderline/alphatab/LogLevel';
import type { Score } from '@coderline/alphatab/model/Score';
import { WorkerScoreEncoding } from '@coderline/alphatab/platform/worker/WorkerScoreEncoding';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, it } from 'vitest';
import { AllocationSampler } from './AllocationSampler';

v8.setFlagsFromString('--expose-gc');
const gc = vm.runInNewContext('gc') as () => void;

function median(values: number[]) {
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

function timed(runs: number, action: () => void): number {
    for (let i = 0; i < 2; i++) {
        action();
    }
    const times: number[] = [];
    for (let i = 0; i < runs; i++) {
        const t = performance.now();
        action();
        times.push(performance.now() - t);
    }
    return median(times);
}

/** Heap bytes kept alive by one value produced by `create`. */
function retained(create: () => unknown, count: number = 3): number {
    const heapUsed = () => {
        for (let i = 0; i < 4; i++) {
            gc();
        }
        return process.memoryUsage().heapUsed;
    };
    const held: unknown[] = [];
    const before = heapUsed();
    for (let i = 0; i < count; i++) {
        held.push(create());
    }
    const after = heapUsed();
    if (held.length !== count) {
        throw new Error('unreachable');
    }
    return (after - before) / count;
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`;
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
const pct = (part: number, total: number) => `${((100 * part) / total).toFixed(1)}%`;

type ValueKind = 'number' | 'boolean' | 'string' | 'null/undefined' | 'other';

class ClassTally {
    public records = 0;
    public entries = 0;
    public headerBytes = 0;
    public keyBytes = 0;
    public valueBytes = new Map<ValueKind | 'array header', number>();
    public defaultEntries = 0;
    /** Key and value bytes of entries equal to the default. */
    public defaultBytes = 0;
    /** Per key: entries, entries equal to the default, bytes (key + primitive value). */
    public keys = new Map<string, { n: number; defaults: number; bytes: number }>();

    public addValue(kind: ValueKind | 'array header', bytes: number) {
        this.valueBytes.set(kind, (this.valueBytes.get(kind) ?? 0) + bytes);
    }

    public get total(): number {
        let t = this.headerBytes + this.keyBytes;
        for (const v of this.valueBytes.values()) {
            t += v;
        }
        return t;
    }
}

interface Frame {
    cls: string;
    isRecord: boolean;
    pendingKey: string | null;
    keyBytes: number;
}

/**
 * Forwards to a MessagePack writer and attributes every written byte to the model class whose serializer is
 * writing (set through {@link enter}/{@link leave} by the patched generated serializers).
 */
class CensusWriter implements IObjectWriter {
    public readonly inner = new MessagePackObjectWriter(1 << 20);
    public readonly tallies = new Map<string, ClassTally>();
    public defaults = new Map<string, Map<string, unknown>>();
    private _classes: string[] = ['(top)'];
    private _frames: Frame[] = [];
    private _nextIsClassRecord = false;

    private get _pos(): number {
        return (this.inner as unknown as { _position: number })._position;
    }

    private _tally(cls: string): ClassTally {
        let t = this.tallies.get(cls);
        if (!t) {
            t = new ClassTally();
            this.tallies.set(cls, t);
        }
        return t;
    }

    public enter(cls: string) {
        this._classes.push(cls);
        this._nextIsClassRecord = true;
    }

    public leave() {
        this._classes.pop();
    }

    private get _cls(): string {
        return this._classes[this._classes.length - 1];
    }

    private get _frame(): Frame | null {
        return this._frames.length === 0 ? null : this._frames[this._frames.length - 1];
    }

    private _primitive(kind: ValueKind, value: unknown, write: () => void) {
        const start = this._pos;
        write();
        const bytes = this._pos - start;
        const t = this._tally(this._cls);
        t.addValue(kind, bytes);
        const f = this._frame;
        if (f?.isRecord && f.pendingKey !== null) {
            const key = f.pendingKey;
            const stats = t.keys.get(key) ?? { n: 0, defaults: 0, bytes: 0 };
            stats.n++;
            stats.bytes += f.keyBytes + bytes;
            const d = this.defaults.get(f.cls);
            if (d?.has(key) && Object.is(d.get(key), value)) {
                t.defaultEntries++;
                t.defaultBytes += f.keyBytes + bytes;
                stats.defaults++;
            }
            t.keys.set(key, stats);
            f.pendingKey = null;
        }
    }

    private _container(isRecord: boolean, write: () => void) {
        const f = this._frame;
        const start = this._pos;
        write();
        const cls = isRecord && this._nextIsClassRecord ? this._cls : `${this._cls} (map/array)`;
        this._nextIsClassRecord = false;
        const t = this._tally(this._cls);
        if (isRecord) {
            t.headerBytes += this._pos - start;
            if (cls === this._cls) {
                t.records++;
            }
        } else {
            t.addValue('array header', this._pos - start);
        }
        if (f) {
            f.pendingKey = null;
        }
        this._frames.push({ cls: this._cls, isRecord: isRecord && cls === this._cls, pendingKey: null, keyBytes: 0 });
    }

    private _fields: RecordFields[] = [];
    public startObject(fields: RecordFields): void {
        this._fields.push(fields);
        this._container(true, () => this.inner.startObject(fields));
    }
    public endObject(): void {
        this._fields.pop();
        this._frames.pop();
        this.inner.endObject();
    }
    public startMap(): void {
        this._nextIsClassRecord = false;
        this._container(true, () => this.inner.startMap());
    }
    public endMap(): void {
        this._frames.pop();
        this.inner.endMap();
    }
    public startArray(length: number): void {
        const f = this._frame;
        if (f?.isRecord && f.pendingKey !== null && length === 0) {
            const d = this.defaults.get(f.cls)?.get(f.pendingKey);
            if (Array.isArray(d) && d.length === 0) {
                const t = this._tally(this._cls);
                t.defaultEntries++;
                t.defaultBytes += f.keyBytes + 1;
            }
        }
        this._container(false, () => this.inner.startArray(length));
    }
    public endArray(): void {
        this._frames.pop();
        this.inner.endArray();
    }
    public prop(name: string): void {
        this._key(name, () => this.inner.prop(name));
    }

    public field(id: number): void {
        this._key(this._fields[this._fields.length - 1].names[id], () => this.inner.field(id));
    }

    private _key(name: string, write: () => void) {
        const start = this._pos;
        write();
        const bytes = this._pos - start;
        const t = this._tally(this._cls);
        t.keyBytes += bytes;
        t.entries++;
        const f = this._frame;
        if (f) {
            f.pendingKey = name;
            f.keyBytes = bytes;
        }
    }
    public numberField(id: number, v: number): void {
        this.field(id);
        this.writeNumber(v);
    }

    public booleanField(id: number, v: boolean): void {
        this.field(id);
        this.writeBoolean(v);
    }

    public stringField(id: number, v: string): void {
        this.field(id);
        this.writeString(v);
    }

    public valueField(id: number, v: unknown): void {
        this.field(id);
        this.writeValue(v);
    }

    public arrayField(id: number, length: number): void {
        this.field(id);
        this.startArray(length);
    }

    public mapField(id: number): void {
        this.field(id);
        this.startMap();
    }

    public writeNumber(v: number): void {
        this._primitive('number', v, () => this.inner.writeNumber(v));
    }
    public writeBoolean(v: boolean): void {
        this._primitive('boolean', v, () => this.inner.writeBoolean(v));
    }
    public writeString(v: string): void {
        this._primitive('string', v, () => this.inner.writeString(v));
    }
    public writeNull(): void {
        this._primitive('null/undefined', null, () => this.inner.writeNull());
    }
    public writeUndefined(): void {
        this._primitive('null/undefined', undefined, () => this.inner.writeUndefined());
    }
    public writeValue(v: unknown): void {
        const kind: ValueKind =
            v === null || v === undefined
                ? 'null/undefined'
                : typeof v === 'number'
                  ? 'number'
                  : typeof v === 'boolean'
                    ? 'boolean'
                    : typeof v === 'string'
                      ? 'string'
                      : 'other';
        this._primitive(kind, v, () => this.inner.writeValue(v));
    }
}

/** Records the top-level primitive values and arrays of one record, by key. */
class RecordingWriter implements IObjectWriter {
    public readonly values = new Map<string, unknown>();
    private _depth = 0;
    private _key: string | null = null;
    private _set(v: unknown) {
        if (this._depth === 1 && this._key !== null) {
            this.values.set(this._key, v);
        }
        this._key = null;
    }
    private _fields: RecordFields[] = [];
    public startObject(fields: RecordFields): void {
        this._fields.push(fields);
        this._key = null;
        this._depth++;
    }
    public endObject(): void {
        this._fields.pop();
        this._depth--;
    }
    public startMap(): void {
        this._key = null;
        this._depth++;
    }
    public endMap(): void {
        this._depth--;
    }
    public startArray(length: number): void {
        if (this._depth === 1 && this._key !== null) {
            this.values.set(this._key, new Array(length));
        }
        this._key = null;
        this._depth++;
    }
    public endArray(): void {
        this._depth--;
    }
    public prop(name: string): void {
        this._key = name;
    }
    public field(id: number): void {
        this._key = this._fields[this._fields.length - 1].names[id];
    }
    public numberField(id: number, v: number): void {
        this.field(id);
        this.writeNumber(v);
    }

    public booleanField(id: number, v: boolean): void {
        this.field(id);
        this.writeBoolean(v);
    }

    public stringField(id: number, v: string): void {
        this.field(id);
        this.writeString(v);
    }

    public valueField(id: number, v: unknown): void {
        this.field(id);
        this.writeValue(v);
    }

    public arrayField(id: number, length: number): void {
        this.field(id);
        this.startArray(length);
    }

    public mapField(id: number): void {
        this.field(id);
        this.startMap();
    }

    public writeNumber(v: number): void {
        this._set(v);
    }
    public writeBoolean(v: boolean): void {
        this._set(v);
    }
    public writeString(v: string): void {
        this._set(v);
    }
    public writeNull(): void {
        this._set(null);
    }
    public writeUndefined(): void {
        this._set(undefined);
    }
    public writeValue(v: unknown): void {
        this._set(v);
    }
}

type SerializerClass = { write(obj: unknown, w: IObjectWriter): void };

/**
 * Wraps the write method of every generated model serializer so that a {@link CensusWriter} knows the class,
 * and collects the serialized defaults of each class with a public parameterless constructor.
 */
async function patchSerializers(root: string): Promise<{
    defaults: Map<string, Map<string, unknown>>;
    restore: () => void;
}> {
    const dir = path.join(root, 'src/generated/model');
    const defaults = new Map<string, Map<string, unknown>>();
    const restores: (() => void)[] = [];
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('Serializer.ts'))) {
        const name = file.replace(/\.ts$/, '');
        const cls = name.replace(/Serializer$/, '');
        const module = (await import(path.join(dir, file))) as Record<string, SerializerClass>;
        const serializer = module[name];
        const original = serializer.write;
        serializer.write = (obj: unknown, w: IObjectWriter) => {
            if (obj && w instanceof CensusWriter) {
                w.enter(cls);
                original(obj, w);
                w.leave();
            } else {
                original(obj, w);
            }
        };
        restores.push(() => {
            serializer.write = original;
        });
        const source = fs.readFileSync(path.join(dir, file), 'utf8');
        const m = new RegExp(`import (type )?\\{([^}]*\\b${cls}\\b[^}]*)\\} from "([^"]+)"`).exec(source);
        if (m && !m[1]) {
            const model = (await import(m[3])) as Record<string, new () => unknown>;
            const ctor = model[cls];
            if (typeof ctor === 'function') {
                const rec = new RecordingWriter();
                original(new ctor(), rec);
                defaults.set(cls, rec.values);
            }
        }
    }
    return {
        defaults,
        restore: () => {
            for (const r of restores) {
                r();
            }
        }
    };
}

const defaultFiles = [
    'test-data/guitarpro4/fade-to-black.gp4',
    'test-data/guitarpro5/canon.gp5',
    'test-data/audio/full-song.gp5',
    'test-data/guitarpro7/serenade.gp',
    'test-data/guitarpro8/canon-audio-track.gp',
    'test-data/musicxml-samples/Dichterliebe01.xml',
    'test-data/musicxml-samples/BeetAnGeSample.mxl',
    'test-data/exporter/notation-legend-formatted.atex'
];

describe('WireCensus', () => {
    const root = process.cwd();
    const runs = Number(process.env.LAYOUT_FLOW_RUNS ?? 9);
    const files = process.env.WIRE_CENSUS_FILES?.split(',') ?? defaultFiles;
    const out: string[] = [];

    it('census', async () => {
        Logger.logLevel = LogLevel.None;
        const { defaults, restore } = await patchSerializers(root);
        try {
            const sources: { name: string; bytes: Uint8Array }[] = files.map(f => ({
                name: f,
                bytes: new Uint8Array(fs.readFileSync(path.join(root, f)))
            }));
            // the dense score as alphaTex, a large alphaTex input
            const dense = ScoreLoader.loadScoreFromBytes(sources[0].bytes, new Settings());
            sources.push({
                name: `${files[0]} exported as alphaTex`,
                bytes: new TextEncoder().encode(new AlphaTexExporter().exportToString(dense))
            });

            const summary: string[] = [
                '## summary per file (sizes; times are medians in Node, allocation from the sampling profiler)',
                '  file | file size | msgpack | object tree clone | model retained | import ms / MB | msgpack write ms | msgpack read+finish ms / MB | default entries share | key share'
            ];
            const total = new Map<string, ClassTally>();
            for (const source of sources) {
                const settings = new Settings();
                const load = () => ScoreLoader.loadScoreFromBytes(source.bytes, settings);
                const score: Score = load();
                const w = new CensusWriter();
                w.defaults = defaults;
                ScoreSerializer.write(score, w);
                const data = w.inner.toUint8Array();
                const tree = new PlainObjectWriter();
                ScoreSerializer.write(score, tree);
                const cloneBytes = v8.serialize(tree.result).byteLength;
                const modelBytes = retained(load);

                const importMs = timed(Math.min(runs, 5), load);
                const importAlloc = AllocationSampler.measure(load).totalBytes;
                const writeMs = timed(runs, () => WorkerScoreEncoding.encode(score, data.byteLength + 16));
                // the census covers the score record, the hand-off adds the format in front of it
                const encoded = WorkerScoreEncoding.encode(score, data.byteLength + 16);
                const decode = () => WorkerScoreEncoding.decode(encoded, settings);
                const readMs = timed(runs, decode);
                const readAlloc = AllocationSampler.measure(decode).totalBytes;

                let keys = 0;
                let defaultBytes = 0;
                let all = 0;
                for (const [cls, t] of w.tallies) {
                    keys += t.keyBytes;
                    defaultBytes += t.defaultBytes;
                    all += t.total;
                    const agg = total.get(cls) ?? new ClassTally();
                    agg.records += t.records;
                    agg.entries += t.entries;
                    agg.headerBytes += t.headerBytes;
                    agg.keyBytes += t.keyBytes;
                    agg.defaultEntries += t.defaultEntries;
                    agg.defaultBytes += t.defaultBytes;
                    for (const [k, v] of t.valueBytes) {
                        agg.addValue(k, v);
                    }
                    total.set(cls, agg);
                }
                if (all !== data.byteLength) {
                    throw new Error(`census covers ${all} of ${data.byteLength} bytes`);
                }
                summary.push(
                    `  ${source.name} | ${kb(source.bytes.byteLength)} | ${kb(data.byteLength)} | ${kb(cloneBytes)} | ${mb(modelBytes)} | ${importMs.toFixed(1)} / ${AllocationSampler.mb(importAlloc)} | ${writeMs.toFixed(1)} | ${readMs.toFixed(1)} / ${AllocationSampler.mb(readAlloc)} | ${pct(defaultBytes, all)} | ${pct(keys, all)}`
                );

                if (source === sources[0] || source === sources[1]) {
                    out.push(`## ${source.name}: bytes per class (msgpack ${kb(data.byteLength)})`);
                    out.push(
                        '  class | records | entries | share | keys | numbers | booleans | strings | null/undef | arrays | headers | default entries (bytes)'
                    );
                    const rows = Array.from(w.tallies.entries()).sort((a, b) => b[1].total - a[1].total);
                    for (const [cls, t] of rows) {
                        const v = (k: ValueKind | 'array header') => kb(t.valueBytes.get(k) ?? 0);
                        out.push(
                            `  ${cls} | ${t.records} | ${t.entries} | ${pct(t.total, all)} | ${kb(t.keyBytes)} | ${v('number')} | ${v('boolean')} | ${v('string')} | ${v('null/undefined')} | ${v('array header')} | ${kb(t.headerBytes)} | ${t.defaultEntries} (${kb(t.defaultBytes)}, ${pct(t.defaultBytes, t.total)})`
                        );
                    }
                    for (const cls of ['Note', 'Beat']) {
                        const t = w.tallies.get(cls);
                        if (!t) {
                            continue;
                        }
                        out.push(`  ${cls} keys by bytes (entries, equal to default, bytes):`);
                        const keyRows = Array.from(t.keys.entries()).sort((a, b) => b[1].bytes - a[1].bytes);
                        out.push(
                            `    ${keyRows
                                .slice(0, 40)
                                .map(([k, s]) => `${k} ${s.n}/${s.defaults}/${kb(s.bytes)}`)
                                .join(', ')}`
                        );
                    }
                    out.push('');
                }
            }
            out.unshift(...summary, '');
        } finally {
            restore();
        }
        console.log(out.join('\n'));
        fs.mkdirSync(path.join(root, 'temp/layout-flow'), { recursive: true });
        fs.writeFileSync(path.join(root, 'temp/layout-flow/wire-census.txt'), out.join('\n'));
    });
});
