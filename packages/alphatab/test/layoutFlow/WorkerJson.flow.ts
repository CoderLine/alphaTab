/** @target web */
// Cost of the Map-based JSON hand-offs between the main thread and the rendering/synth workers
// (score, settings, midi, bounds), compared with plain-object and JSON-string encodings of the
// same data, plus a shape microbenchmark (nested Maps vs plain objects vs flat typed arrays).
// v8.serialize/deserialize split the structured clone into its sender and receiver halves.
// Run: npm run test-layout-flow -- WorkerJson   (LAYOUT_FLOW_RUNS=<n> changes the repetitions,
// WORKER_JSON_SCAN=1 scans all of test-data for the score with the most notes)
import fs from 'node:fs';
import path from 'node:path';
import v8 from 'node:v8';
import { ScoreSerializer } from '@coderline/alphatab/generated/model/ScoreSerializer';
import { PlainObjectWriter } from '@coderline/alphatab/io/PlainObjectWriter';
import { MessagePackObjectReader } from '@coderline/alphatab/io/MessagePackObjectReader';
import { SettingsSerializer } from '@coderline/alphatab/generated/SettingsSerializer';
import { AlphaSynthMidiFileHandler } from '@coderline/alphatab/midi/AlphaSynthMidiFileHandler';
import { MidiFile } from '@coderline/alphatab/midi/MidiFile';
import { MidiFileGenerator } from '@coderline/alphatab/midi/MidiFileGenerator';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { Score } from '@coderline/alphatab/model/Score';
import { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { BoundsLookupWire } from '@coderline/alphatab/rendering/utils/BoundsLookupWire';
import { WorkerScoreEncoding } from '@coderline/alphatab/platform/worker/WorkerScoreEncoding';
import { Settings } from '@coderline/alphatab/Settings';
import type { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { MapObjectReader } from '@coderline/alphatab/io/MapObjectReader';
import { MessagePackObjectWriter } from '@coderline/alphatab/io/MessagePackObjectWriter';
import { AlphaTabWebWorker } from '@coderline/alphatab/platform/worker/AlphaTabWebWorker';
import type {
    IAlphaTabRenderingWorker,
    IAlphaTabWorkerMessage
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import { AlphaTabWorkerScoreRenderer } from '@coderline/alphatab/platform/worker/AlphaTabWorkerScoreRenderer';
import vm from 'node:vm';
import { describe, it } from 'vitest';
import { AllocationSampler } from './AllocationSampler';
import { LayoutCorpus } from './LayoutCorpus';
import { LayoutHarness } from './LayoutHarness';

v8.setFlagsFromString('--expose-gc');
const gc = vm.runInNewContext('gc') as () => void;

/** Bytes kept alive per value produced by `create`, from the heap growth while holding `count` of them. */
function retainedPerValue(create: () => unknown, count: number = 16): number {
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

/** Deep equality of plain objects, Maps, arrays and primitives. */
function jsObjectEquals(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
        return false;
    }
    if (a instanceof Map) {
        if (!(b instanceof Map) || a.size !== b.size) {
            return false;
        }
        for (const k of a.keys()) {
            if (!b.has(k) || !jsObjectEquals(a.get(k), b.get(k))) {
                return false;
            }
        }
        return true;
    }
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!jsObjectEquals(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    const keys = Object.keys(ao);
    if (keys.length !== Object.keys(bo).length) {
        return false;
    }
    for (const k of keys) {
        if (!Object.prototype.hasOwnProperty.call(bo, k) || !jsObjectEquals(ao[k], bo[k])) {
            return false;
        }
    }
    return true;
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

/** The main-thread renderer connected to an in-process AlphaTabWebWorker; every message is structured-cloned. */
function inProcessWorker(settings: Settings) {
    let handler: ((e: MessageEvent<IAlphaTabWorkerMessage>) => void) | null = null;
    const worker = {
        posts: 0,
        postMessage(message: IAlphaTabWorkerMessage, transfer?: Transferable[]) {
            worker.posts++;
            handler!({ data: structuredClone(message, { transfer }) } as MessageEvent<IAlphaTabWorkerMessage>);
        },
        addEventListener: () => {},
        removeEventListener: () => {},
        terminate: () => {}
    };
    new AlphaTabWebWorker({
        postMessage: () => {},
        addEventListener: (_, h) => {
            handler = h;
        },
        removeEventListener: () => {}
    });
    const api = { settings } as unknown as AlphaTabApiBase<unknown>;
    const renderer = new AlphaTabWorkerScoreRenderer<unknown>(api, worker as unknown as IAlphaTabRenderingWorker);
    return { renderer, worker };
}

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

function plain(value: unknown): unknown {
    if (value instanceof Map) {
        const o: Record<string, unknown> = {};
        for (const [k, v] of value) {
            o[k] = plain(v);
        }
        return o;
    }
    if (Array.isArray(value)) {
        return value.map(plain);
    }
    return value;
}

function census(value: unknown) {
    const c = { maps: 0, arrays: 0, entries: 0 };
    const walk = (v: unknown) => {
        if (v instanceof Map) {
            c.maps++;
            c.entries += v.size;
            for (const x of v.values()) {
                walk(x);
            }
        } else if (Array.isArray(v)) {
            c.arrays++;
            for (const x of v) {
                walk(x);
            }
        }
    };
    walk(value);
    return c;
}

function countModel(score: Score) {
    let beats = 0;
    let notes = 0;
    for (const t of score.tracks) {
        for (const s of t.staves) {
            for (const b of s.bars) {
                for (const v of b.voices) {
                    beats += v.beats.length;
                    for (const beat of v.beats) {
                        notes += beat.notes.length;
                    }
                }
            }
        }
    }
    return { tracks: score.tracks.length, masterBars: score.masterBars.length, beats, notes };
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`;
const ms = (v: number) => `${v.toFixed(2)} ms`;

interface Row {
    step: string;
    thread: string;
    time: number;
    bytes: number;
}

class Table {
    public rows: Row[] = [];
    public constructor(private readonly _runs: number) {}

    public add(step: string, thread: string, action: () => void, measureAlloc: boolean = true) {
        const time = timed(this._runs, action);
        const bytes = measureAlloc ? AllocationSampler.measure(action).totalBytes : Number.NaN;
        this.rows.push({ step, thread, time, bytes });
    }

    public time(step: string): number {
        return this.rows.find(r => r.step === step)!.time;
    }

    public print(out: string[]) {
        for (const r of this.rows) {
            const alloc = Number.isNaN(r.bytes) ? '' : AllocationSampler.mb(r.bytes);
            out.push(`  ${r.step.padEnd(46)} ${r.thread.padEnd(7)} ${ms(r.time).padStart(10)}  ${alloc}`);
        }
    }
}

function cloneRows(t: Table, label: string, payload: unknown) {
    t.add(`${label} structuredClone (both)`, 'both', () => structuredClone(payload));
    const buf = v8.serialize(payload);
    t.add(`${label}   serialize half`, 'sender', () => v8.serialize(payload), false);
    t.add(`${label}   deserialize half`, 'recv', () => v8.deserialize(buf), false);
    return buf.byteLength;
}

function findLargestScore(root: string, out: string[]): string {
    const candidates: { file: string; notes: number; beats: number }[] = [];
    const walk = (dir: string) => {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, e.name);
            if (e.isDirectory()) {
                walk(p);
            } else if (/\.(gp[3-5x]?|xml|musicxml|mxl|cap[x]?)$/i.test(e.name)) {
                try {
                    const s = LayoutHarness.loadScore(p, new Settings());
                    const c = countModel(s);
                    candidates.push({ file: path.relative(root, p), notes: c.notes, beats: c.beats });
                } catch {
                    // not a loadable score
                }
            }
        }
    };
    walk(path.join(root, 'test-data'));
    candidates.sort((a, b) => b.notes - a.notes);
    out.push('## largest scores in test-data by note count');
    for (const c of candidates.slice(0, 8)) {
        out.push(`  ${String(c.notes).padStart(7)} notes ${String(c.beats).padStart(7)} beats  ${c.file}`);
    }
    out.push('');
    return candidates[0].file;
}

describe('WorkerJson', () => {
    const root = process.cwd();
    const runs = Number(process.env.LAYOUT_FLOW_RUNS ?? 9);
    const lines: string[] = [];

    const scores: { name: string; file: string }[] = [...LayoutCorpus.referenceScores];
    const largest = process.env.WORKER_JSON_LARGEST ?? 'test-data/guitarpro8/canon-audio-track.gp';

    it('scan', () => {
        if (process.env.WORKER_JSON_SCAN === '1') {
            const file = findLargestScore(root, lines);
            console.log(lines.join('\n'));
            console.log(`largest: ${file}`);
        }
    });

    it('settings', () => {
        const out: string[] = ['## settings (alphaTab.initialize / updateSettings, per resize and per updateSettings)'];
        const settings = new Settings();
        const toJs = () => {
            const o = JsonConverter.settingsToJsObject(settings)!;
            o.delete('player');
            return o;
        };
        const json = toJs();
        const c = census(json);
        const t = new Table(runs);
        t.add('settingsToJsObject (minus player)', 'main', toJs);
        const bytes = cloneRows(t, 'Map', json);
        const cloned = structuredClone(json);
        const target = new Settings();
        t.add('SettingsSerializer.fromJson (worker update)', 'worker', () =>
            SettingsSerializer.fromJson(target, cloned)
        );
        const toObj = () => {
            const w = new PlainObjectWriter();
            SettingsSerializer.write(settings, w);
            const o = w.result as Record<string, unknown>;
            delete o.player;
            return o;
        };
        t.add('SettingsSerializer.write to plain objects (minus player)', 'main', toObj);
        const obj = toObj();
        cloneRows(t, 'obj', obj);
        const objCloned = structuredClone(obj);
        t.add('SettingsSerializer.fromJson (obj)', 'worker', () => SettingsSerializer.fromJson(target, objCloned));
        t.add('JsonConverter.settingsToJson', 'main', () => JsonConverter.settingsToJson(settings));
        out.push(`  maps=${c.maps} arrays=${c.arrays} entries=${c.entries} wire=${kb(bytes)}`);
        t.print(out);
        console.log(out.join('\n'));
        lines.push(...out, '');
    });

    it('settings-resize-sync', () => {
        const out: string[] = [
            '## settings sync per resize in worker mode (default settings; main + clone + worker unless noted)'
        ];
        const settings = new Settings();
        const t = new Table(runs);
        const { renderer, worker } = inProcessWorker(settings);
        t.add('renderer.updateSettings (production path)', 'both', () => renderer.updateSettings(settings));

        const toPlain = () => {
            const w = new PlainObjectWriter();
            SettingsSerializer.write(settings, w);
            const o = w.result as Record<string, unknown>;
            delete o.player;
            return o;
        };
        const target = new Settings();
        const plainObject = toPlain();
        const plainCloned = structuredClone(plainObject);
        t.add('plain: write (minus player)', 'main', toPlain);
        t.add('plain: structuredClone', 'both', () => structuredClone(plainObject));
        t.add('plain: SettingsSerializer.read (strict)', 'worker', () =>
            SettingsSerializer.read(target, new MapObjectReader(plainCloned))
        );

        const toBytes = () => {
            const w = new MessagePackObjectWriter(4096);
            SettingsSerializer.write(settings, w);
            return w.toUint8Array();
        };
        const bytes = toBytes();
        t.add('msgpack: write (with player)', 'main', toBytes);
        t.add('msgpack: post with transfer', 'both', () => {
            const b = toBytes();
            structuredClone({ settings: b }, { transfer: [b.buffer] });
        });
        t.add('msgpack: SettingsSerializer.read (strict)', 'worker', () =>
            SettingsSerializer.read(target, new MessagePackObjectReader(bytes))
        );
        t.add('msgpack: write + transfer + read', 'both', () => {
            const b = toBytes();
            const m = structuredClone({ settings: b }, { transfer: [b.buffer] });
            SettingsSerializer.read(target, new MessagePackObjectReader(m.settings));
        });

        const cachedPlain = toPlain();
        t.add('only when changed, plain: write + deep compare', 'main', () => {
            if (!jsObjectEquals(cachedPlain, toPlain())) {
                throw new Error('unexpected difference');
            }
        });
        const cachedBytes = toBytes();
        t.add('only when changed, msgpack: write + byte compare', 'main', () => {
            if (!bytesEqual(cachedBytes, toBytes())) {
                throw new Error('unexpected difference');
            }
        });
        t.print(out);
        out.push(
            `  sizes: msgpack ${bytes.byteLength} bytes; posts ${worker.posts}; retained cache: plain object ${kb(retainedPerValue(toPlain))}, msgpack bytes ${kb(retainedPerValue(toBytes))}`
        );
        console.log(out.join('\n'));
        lines.push(...out, '');
    });

    for (const ref of [...scores, { name: 'largest', file: largest }]) {
        it(ref.name, () => {
            const file = path.join(root, ref.file);
            const settings = new Settings();
            const score = LayoutHarness.loadScore(file, settings);
            const m = countModel(score);
            const out: string[] = [
                `## ${ref.name} (${ref.file})`,
                `  tracks=${m.tracks} masterBars=${m.masterBars} beats=${m.beats} notes=${m.notes}`
            ];

            // score: main -> worker (alphaTab.renderScore, per api.render())
            const json = JsonConverter.scoreToJsObject(score)!;
            const c = census(json);
            const st = new Table(runs);
            st.add('scoreToJsObject (Map tree)', 'main', () => JsonConverter.scoreToJsObject(score));
            const mapBytes = cloneRows(st, 'Map', json);
            const cloned = structuredClone(json);
            st.add('ScoreSerializer.fromJson (Map)', 'worker', () => ScoreSerializer.fromJson(new Score(), cloned));
            st.add('jsObjectToScore = fromJson + finish (Map)', 'worker', () =>
                JsonConverter.jsObjectToScore(cloned, settings)
            );
            const plainJson = plain(json);
            st.add('  (plain() conversion Map -> object)', 'n/a', () => plain(json), false);
            const plainBytes = cloneRows(st, 'plain', plainJson);
            const plainCloned = structuredClone(plainJson);
            st.add('ScoreSerializer.fromJson (plain)', 'worker', () =>
                ScoreSerializer.fromJson(new Score(), plainCloned)
            );
            st.add('JSON.stringify(plain)', 'main', () => JSON.stringify(plainJson));
            const str = JSON.stringify(plainJson);
            const toPlain = () => {
                const w = new PlainObjectWriter();
                ScoreSerializer.write(score, w);
                return w.result;
            };
            st.add('ScoreSerializer.write to plain objects (object tree)', 'main', toPlain);
            const obj = toPlain();
            cloneRows(st, 'obj', obj);
            const objCloned = structuredClone(obj);
            st.add('ScoreSerializer.fromJson (obj)', 'worker', () => ScoreSerializer.fromJson(new Score(), objCloned));
            st.add('jsObjectToScore = fromJson + finish (obj)', 'worker', () =>
                JsonConverter.jsObjectToScore(objCloned, settings)
            );
            // the binary hand-off (WorkerScoreEncoding), transferred instead of cloned
            const binarySizes: string[] = [];
            const name = 'MessagePack';
            let capacity = 65536;
            const write = () => WorkerScoreEncoding.encode(score, capacity);
            st.add(`${name} write, growing buffer`, 'main', write);
            const data = write();
            capacity = data.byteLength;
            binarySizes.push(`${name.toLowerCase()}=${kb(data.byteLength)}`);
            st.add(`${name} write, capacity of the last score`, 'main', write);
            st.add(`${name} read (ScoreSerializer.read)`, 'worker', () =>
                ScoreSerializer.read(new Score(), new MessagePackObjectReader(data))
            );
            st.add(`${name} read + finish`, 'worker', () => WorkerScoreEncoding.decode(data, settings));
            st.add('JsonConverter.scoreToJson', 'main', () => JsonConverter.scoreToJson(score));
            st.add('string structuredClone (both)', 'both', () => structuredClone(str), false);
            st.add('JSON.parse', 'worker', () => JSON.parse(str));
            out.push(
                `  maps=${c.maps} arrays=${c.arrays} entries=${c.entries} wire(Map)=${kb(mapBytes)} wire(plain)=${kb(plainBytes)} json=${kb(str.length)} ${binarySizes.join(' ')}`
            );
            out.push('  score:');
            st.print(out);
            out.push(
                `  hand-off ${name.padEnd(11)} main (write) ${ms(st.time(`${name} write, capacity of the last score`)).padStart(10)}   worker (read + finish) ${ms(st.time(`${name} read + finish`)).padStart(10)}`
            );
            for (const [label, build, tree] of [
                ['Map', 'scoreToJsObject (Map tree)', 'Map'],
                ['obj', 'ScoreSerializer.write to plain objects (object tree)', 'obj']
            ]) {
                const main = st.time(build) + st.time(`${tree}   serialize half`);
                const worker =
                    st.time(`${tree}   deserialize half`) + st.time(`jsObjectToScore = fromJson + finish (${tree})`);
                out.push(
                    `  hand-off ${label.padEnd(4)} main (build + serialize) ${ms(main).padStart(10)}   worker (deserialize + fromJson + finish) ${ms(worker).padStart(10)}`
                );
            }

            // midi: main -> synth worker (alphaSynth.loadMidi, per score load)
            const midi = new MidiFile();
            const gen = new MidiFileGenerator(score, settings, new AlphaSynthMidiFileHandler(midi));
            const genMs = timed(Math.min(runs, 3), () => {
                const mf = new MidiFile();
                new MidiFileGenerator(score, settings, new AlphaSynthMidiFileHandler(mf)).generate();
            });
            gen.generate();
            const midiJson = JsonConverter.midiFileToJsObject(midi);
            const mc = census(midiJson);
            const mt = new Table(runs);
            mt.add('midiFileToJsObject', 'main', () => JsonConverter.midiFileToJsObject(midi));
            const midiBytes = cloneRows(mt, 'Map', midiJson);
            const midiCloned = structuredClone(midiJson);
            mt.add('jsObjectToMidiFile', 'synth', () => JsonConverter.jsObjectToMidiFile(midiCloned));
            out.push(
                `  midi: events maps=${mc.maps} arrays=${mc.arrays} entries=${mc.entries} wire=${kb(midiBytes)} (generation itself ${ms(genMs)})`
            );
            mt.print(out);

            // bounds: worker -> main (alphaTab.postRenderFinished, per render and resize)
            const h = new LayoutHarness(new Settings());
            h.paint = false;
            const renderScore = LayoutHarness.loadScore(file, h.settings);
            h.render(renderScore, null, 1300);
            const lookup = h.renderer.boundsLookup!;
            const bj = lookup.toJson();
            const bc = census(bj);
            const bt = new Table(runs);
            bt.add('BoundsLookup.toJson', 'worker', () => lookup.toJson());
            const bBytes = cloneRows(bt, 'Map', bj);
            const bCloned = structuredClone(bj);
            bt.add('BoundsLookup.fromJson + finish', 'main', () =>
                BoundsLookup.fromJson(bCloned, renderScore)!.finish()
            );
            const bPlain = plain(bj);
            const bPlainBytes = cloneRows(bt, 'plain', bPlain);
            // the browser worker path (alphaTab.postRenderFinishedWire), transferred instead of copied
            bt.add('BoundsLookupWire.encode', 'worker', () => BoundsLookupWire.encode(lookup));
            const bWire = BoundsLookupWire.encode(lookup);
            const bWireBytes = cloneRows(bt, 'wire', bWire);
            bt.add('BoundsLookupWire.decode + finish', 'main', () =>
                BoundsLookupWire.decode(bWire, renderScore).finish()
            );
            out.push(
                `  bounds: maps=${bc.maps} arrays=${bc.arrays} entries=${bc.entries} wire(Map)=${kb(bBytes)} wire(plain)=${kb(bPlainBytes)} wire(flat)=${kb(bWireBytes)}`
            );
            bt.print(out);

            // painted partials: worker -> main (alphaTab.partialRenderFinished, per visible partial)
            const painter = new LayoutHarness(new Settings());
            const pass = painter.render(LayoutHarness.loadScore(file, painter.settings), null, 1300);
            const svgs = [...pass.systems.map(s => s.svg), ...pass.otherPartials];
            const svgChars = svgs.reduce((a, s) => a + s.length, 0);
            const pt = new Table(runs);
            pt.add('structuredClone of all partial SVG strings', 'both', () => {
                for (const s of svgs) {
                    structuredClone(s);
                }
            });
            out.push(`  svg partials: ${svgs.length} results, ${kb(svgChars)} chars in total`);
            pt.print(out);

            console.log(out.join('\n'));
            lines.push(...out, '');
        });
    }

    it('shape microbenchmark', () => {
        const out: string[] = ['## shape microbenchmark: same records as Map / object / Float64Array'];
        const shapes = [
            { name: 'bounds-like (4 numbers)', fields: 4, count: 160_000 },
            { name: 'note-like (35 fields)', fields: 35, count: 20_000 }
        ];
        for (const shape of shapes) {
            const keys: string[] = [];
            for (let k = 0; k < shape.fields; k++) {
                keys.push(`field${k}`);
            }
            const buildMaps = () => {
                const arr: Map<string, unknown>[] = [];
                for (let i = 0; i < shape.count; i++) {
                    const m = new Map<string, unknown>();
                    for (let k = 0; k < shape.fields; k++) {
                        m.set(keys[k], i + k * 0.5);
                    }
                    arr.push(m);
                }
                return arr;
            };
            // object literal with a fixed shape, as a generated emitter would produce
            const ctor = new Function('i', `return {${keys.map((k, idx) => `${k}: i + ${idx * 0.5}`).join(',')}};`) as (
                i: number
            ) => object;
            const buildObjects = () => {
                const arr: object[] = [];
                for (let i = 0; i < shape.count; i++) {
                    arr.push(ctor(i));
                }
                return arr;
            };
            const buildFlat = () => {
                const f = new Float64Array(shape.count * shape.fields);
                for (let i = 0; i < shape.count; i++) {
                    for (let k = 0; k < shape.fields; k++) {
                        f[i * shape.fields + k] = i + k * 0.5;
                    }
                }
                return f;
            };
            const maps = buildMaps();
            const objects = buildObjects();
            const flat = buildFlat();
            const t = new Table(runs);
            t.add('build Maps', 'sender', buildMaps);
            const mb = cloneRows(t, 'Maps', maps);
            t.add('build objects', 'sender', buildObjects);
            const ob = cloneRows(t, 'objects', objects);
            t.add('build Float64Array', 'sender', buildFlat);
            const fb = cloneRows(t, 'Float64Array', flat);
            out.push(`  ${shape.name}: ${shape.count} records, wire Maps=${kb(mb)} objects=${kb(ob)} flat=${kb(fb)}`);
            t.print(out);
        }
        console.log(out.join('\n'));
        lines.push(...out, '');
    });

    it('report', () => {
        const dir = LayoutCorpus.outDir(root);
        fs.writeFileSync(path.join(dir, 'worker-json.txt'), lines.join('\n'));
        console.log(`report written to ${dir}`);
    });
});
