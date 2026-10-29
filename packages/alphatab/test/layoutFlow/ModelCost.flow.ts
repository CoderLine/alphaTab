/** @target web */
// Costs outside layout and paint: score import per format, the retained model, midi generation
// and tick lookup, the per-tick cursor lookup, sound font loading and the synthesizer per audio
// buffer, plus the midi hand-off to the synth worker.
// Run: npm run test-layout-flow -- ModelCost [-t <section>]   (sections: import, census, midi,
// cursor, soundfont, synth, midiwire; LAYOUT_FLOW_RUNS=<n> changes the repetitions)
import fs from 'node:fs';
import path from 'node:path';
import v8 from 'node:v8';
import { AlphaTexExporter } from '@coderline/alphatab/exporter/AlphaTexExporter';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { AlphaSynthMidiFileHandler } from '@coderline/alphatab/midi/AlphaSynthMidiFileHandler';
import {
    ControlChangeEvent,
    type MidiEvent,
    MidiEventType,
    NoteOffEvent,
    NoteOnEvent,
    PitchBendEvent
} from '@coderline/alphatab/midi/MidiEvent';
import { MidiFile, MidiTrack } from '@coderline/alphatab/midi/MidiFile';
import { MidiFileGenerator } from '@coderline/alphatab/midi/MidiFileGenerator';
import type { MidiTickLookupFindBeatResult } from '@coderline/alphatab/midi/MidiTickLookup';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import { Settings } from '@coderline/alphatab/Settings';
import { AlphaSynth } from '@coderline/alphatab/synth/AlphaSynth';
import { SynthConstants } from '@coderline/alphatab/synth/SynthConstants';
import { TestOutput } from 'test/audio/TestOutput';
import { describe, it } from 'vitest';
import { AllocationSampler } from './AllocationSampler';
import { CpuSampler } from './CpuSampler';
import { HeapCensus } from './HeapCensus';

const root = process.cwd();
const runs = Number.parseInt(process.env.LAYOUT_FLOW_RUNS ?? '9', 10);
const mb = AllocationSampler.mb;
const out: string[] = [];

function median(values: number[]) {
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

function timed(n: number, action: () => void): number {
    for (let i = 0; i < 2; i++) {
        action();
    }
    const times: number[] = [];
    for (let i = 0; i < n; i++) {
        const t = performance.now();
        action();
        times.push(performance.now() - t);
    }
    return median(times);
}

function countModel(score: Score) {
    let beats = 0;
    let notes = 0;
    let bars = 0;
    for (const t of score.tracks) {
        for (const s of t.staves) {
            bars += s.bars.length;
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
    return { tracks: score.tracks.length, masterBars: score.masterBars.length, bars, beats, notes };
}

function load(file: string): Uint8Array {
    return new Uint8Array(fs.readFileSync(path.join(root, file)));
}

function generateMidi(score: Score, settings: Settings) {
    const midi = new MidiFile();
    const gen = new MidiFileGenerator(score, settings, new AlphaSynthMidiFileHandler(midi));
    gen.generate();
    return { midi, gen };
}

function cpuTop(action: () => void, repeat: number, n: number, inclusive: boolean): string[] {
    const r = CpuSampler.measure(() => {
        for (let i = 0; i < repeat; i++) {
            action();
        }
    });
    const lines = [`  cpu self (total ${r.totalMs.toFixed(1)} ms over ${repeat} runs):`];
    for (const [k, v] of r.self.top(n)) {
        lines.push(`    ${((v / r.totalMs) * 100).toFixed(1).padStart(5)}%  ${k}`);
    }
    if (inclusive) {
        lines.push('  cpu inclusive:');
        for (const [k, v] of r.inclusive.top(n)) {
            lines.push(`    ${((v / r.totalMs) * 100).toFixed(1).padStart(5)}%  ${k}`);
        }
    }
    return lines;
}

function allocTop(action: () => void, n: number): string[] {
    const r = AllocationSampler.measure(action, 1024);
    const lines = [`  alloc ≈ ${mb(r.totalBytes)}; top sites:`];
    for (const [k, v] of r.bySite.top(n)) {
        lines.push(`    ${mb(v).padStart(9)}  ${k}`);
    }
    return lines;
}

function censusOf(make: () => unknown, n: number): { lines: string[]; bytes: number; count: number } {
    let keep: unknown = null;
    const before = HeapCensus.take();
    keep = make();
    const after = HeapCensus.take();
    const diff = HeapCensus.diff(before, after);
    let bytes = 0;
    let count = 0;
    for (const e of diff) {
        if (!e.name.startsWith('  ')) {
            bytes += e.selfBytes;
            count += e.count;
        }
    }
    const lines = diff
        .slice(0, n)
        .map(e => `    ${mb(e.selfBytes).padStart(9)} ${String(e.count).padStart(8)}  ${e.name}`);
    // keep alive until after the snapshot
    if (keep === undefined) {
        lines.push('');
    }
    return { lines, bytes, count };
}

const importFiles = [
    { name: 'gp4 fade-to-black (dense)', file: 'test-data/guitarpro4/fade-to-black.gp4' },
    { name: 'gp5 canon', file: 'test-data/guitarpro5/canon.gp5' },
    { name: 'gp5 full-song', file: 'test-data/conversion/full-song.gp5' },
    { name: 'gpx full-song', file: 'test-data/conversion/full-song.gpx' },
    { name: 'gp7 full-song', file: 'test-data/conversion/full-song.gp' },
    { name: 'gp8 canon-audio-track', file: 'test-data/guitarpro8/canon-audio-track.gp' },
    { name: 'gp syncpoints-testfile', file: 'test-data/audio/syncpoints-testfile.gp' },
    { name: 'musicxml SchbAvMaSample', file: 'test-data/musicxml-samples/SchbAvMaSample.xml' },
    { name: 'musicxml Dichterliebe01', file: 'test-data/musicxml-samples/Dichterliebe01.xml' },
    { name: 'mxl Dichterliebe01', file: 'test-data/musicxml-samples/Dichterliebe01.mxl' }
];

const texFiles = [
    { name: 'alphatex fade-to-black (exported)', file: 'test-data/guitarpro4/fade-to-black.gp4' },
    { name: 'alphatex canon (exported)', file: 'test-data/guitarpro5/canon.gp5' },
    { name: 'alphatex full-song (exported)', file: 'test-data/conversion/full-song.gp5' },
    { name: 'alphatex notation-legend-formatted', file: 'test-data/exporter/notation-legend-formatted.atex' }
];

describe('ModelCost', () => {
    it('import', () => {
        out.push('## import per format');
        out.push('| file | bytes | tracks | masterBars | beats | notes | median ms | alloc MB | finish ms (incl.) |');
        out.push('|---|---|---|---|---|---|---|---|---|');
        const details: string[] = [];
        const settings = new Settings();
        const entries: { name: string; size: number; run: () => Score }[] = [];
        for (const f of importFiles) {
            const data = load(f.file);
            entries.push({
                name: f.name,
                size: data.length,
                run: () => ScoreLoader.loadScoreFromBytes(data, settings)
            });
        }
        for (const f of texFiles) {
            let tex: string;
            try {
                tex = f.file.endsWith('.atex')
                    ? fs.readFileSync(path.join(root, f.file), 'utf8')
                    : new AlphaTexExporter().exportToString(ScoreLoader.loadScoreFromBytes(load(f.file), settings));
                ScoreLoader.loadAlphaTex(tex, settings);
            } catch (e) {
                out.push(`(${f.name}: export or re-import failed: ${(e as Error).message})`);
                continue;
            }
            entries.push({ name: f.name, size: tex.length, run: () => ScoreLoader.loadAlphaTex(tex, settings) });
        }
        for (const e of entries) {
            const c = countModel(e.run());
            const t = timed(runs, () => e.run());
            const a = AllocationSampler.measure(() => e.run(), 1024);
            const cpu = CpuSampler.measure(() => {
                for (let i = 0; i < runs; i++) {
                    e.run();
                }
            });
            let finishMs = 0;
            for (const [k, v] of cpu.inclusive.values) {
                if (k.startsWith('finish Score.ts')) {
                    finishMs = v / runs;
                }
            }
            out.push(
                `| ${e.name} | ${e.size} | ${c.tracks} | ${c.masterBars} | ${c.beats} | ${c.notes} | ${t.toFixed(1)} | ${(a.totalBytes / 1024 / 1024).toFixed(1)} | ${finishMs.toFixed(1)} |`
            );
            details.push(`### ${e.name}`);
            details.push(`  cpu self (${(cpu.totalMs / runs).toFixed(1)} ms per run):`);
            for (const [k, v] of cpu.self.top(12)) {
                details.push(`    ${((v / cpu.totalMs) * 100).toFixed(1).padStart(5)}%  ${k}`);
            }
            details.push('  cpu inclusive:');
            for (const [k, v] of cpu.inclusive.top(14)) {
                details.push(`    ${((v / cpu.totalMs) * 100).toFixed(1).padStart(5)}%  ${k}`);
            }
            details.push(`  alloc top sites (${mb(a.totalBytes)}):`);
            for (const [k, v] of a.bySite.top(12)) {
                details.push(`    ${mb(v).padStart(9)}  ${k}`);
            }
        }
        out.push('', ...details, '');
    });

    it('census', () => {
        out.push('## retained model');
        for (const f of [importFiles[0], importFiles[1], importFiles[7]]) {
            const data = load(f.file);
            ScoreLoader.loadScoreFromBytes(data, new Settings());
            let c = { notes: 0, beats: 0, bars: 0, masterBars: 0, tracks: 0 };
            const r = censusOf(() => {
                const s = ScoreLoader.loadScoreFromBytes(data, new Settings());
                c = countModel(s);
                return s;
            }, 45);
            out.push(
                `### ${f.name}: ${mb(r.bytes)} in ${r.count} objects; notes=${c.notes} beats=${c.beats} bars=${c.bars} masterBars=${c.masterBars}; ` +
                    `${(r.bytes / Math.max(1, c.notes)).toFixed(0)} B/note, ${(r.count / Math.max(1, c.beats)).toFixed(1)} objects/beat`
            );
            out.push(...r.lines);
        }
        out.push('');
    });

    it('midi', () => {
        out.push('## midi generation');
        const settings = new Settings();
        for (const f of [importFiles[0], importFiles[1], importFiles[2]]) {
            const score = ScoreLoader.loadScoreFromBytes(load(f.file), settings);
            const { midi } = generateMidi(score, settings);
            const t = timed(runs, () => generateMidi(score, settings));
            out.push(`### ${f.name}: ${t.toFixed(1)} ms, events=${midi.tracks[0].events.length}`);
            out.push(...allocTop(() => generateMidi(score, settings), 14));
            out.push(...cpuTop(() => generateMidi(score, settings), runs, 14, true));
            const r = censusOf(() => generateMidi(score, settings), 25);
            out.push(`  retained midi + tick lookup: ${mb(r.bytes)} in ${r.count} objects`);
            out.push(...r.lines);
        }
        out.push('');
    });

    it('cursor', () => {
        out.push('## per-tick cursor lookup (findBeat with hint, all tracks visible)');
        const settings = new Settings();
        for (const f of [importFiles[0], importFiles[1]]) {
            const score = ScoreLoader.loadScoreFromBytes(load(f.file), settings);
            const { gen } = generateMidi(score, settings);
            const lookup = gen.tickLookup;
            const tracks = new Set<number>(score.tracks.map(t => t.index));
            const last = lookup.masterBars[lookup.masterBars.length - 1];
            const endTick = last.end;
            // one render quantum (128 frames at 44.1 kHz) at 120 bpm ≈ 5.6 ticks
            const step = (960 * 2 * 128) / 44100;
            let calls = 0;
            let changes = 0;
            const play = () => {
                let hint: MidiTickLookupFindBeatResult | null = null;
                for (let tick = 0; tick < endTick; tick += step) {
                    const r = lookup.findBeat(tracks, tick, hint);
                    calls++;
                    if (r !== hint) {
                        changes++;
                    }
                    hint = r;
                }
            };
            play();
            calls = 0;
            changes = 0;
            const t0 = performance.now();
            play();
            const ms = performance.now() - t0;
            const a = AllocationSampler.measure(play, 512);
            out.push(
                `### ${f.name}: ${calls} calls (${changes} beat changes), ${((ms * 1e6) / calls).toFixed(0)} ns/call, ` +
                    `${(a.totalBytes / calls).toFixed(0)} B/call (${(a.totalBytes / Math.max(1, changes)).toFixed(0)} B/change)`
            );
            for (const [k, v] of a.bySite.top(6)) {
                out.push(`    ${mb(v).padStart(9)}  ${k}`);
            }
        }
        out.push('');
    });

    it('soundfont', () => {
        out.push('## sound font load and preset decode');
        const settings = new Settings();
        const score = ScoreLoader.loadScoreFromBytes(load(importFiles[2].file), settings);
        const { midi } = generateMidi(score, settings);
        for (const sf of ['test-data/audio/default.sf2', 'test-data/audio/default.sf3']) {
            const data = load(sf);
            const make = () => new AlphaSynth(new TestOutput(false), 500);
            const tLoad = timed(3, () => make().loadSoundFont(data, false));
            const synthForMidi = make();
            synthForMidi.loadSoundFont(data, false);
            const tMidi = timed(3, () => synthForMidi.loadMidiFile(midi));
            out.push(
                `### ${sf}: loadSoundFont ${tLoad.toFixed(1)} ms, loadMidiFile (full-song) ${tMidi.toFixed(1)} ms (warm, presets cached)`
            );
            for (const f of [importFiles[2], importFiles[0], importFiles[1]]) {
                const s2 = ScoreLoader.loadScoreFromBytes(load(f.file), settings);
                const m2 = generateMidi(s2, settings).midi;
                const firstTimes: number[] = [];
                for (let i = 0; i < 3; i++) {
                    const fresh = make();
                    fresh.loadSoundFont(data, false);
                    const t = performance.now();
                    fresh.loadMidiFile(m2);
                    firstTimes.push(performance.now() - t);
                }
                const fresh = make();
                fresh.loadSoundFont(data, false);
                const fa = AllocationSampler.measure(() => fresh.loadMidiFile(m2), 4096);
                const programs = Array.from((fresh as any).sequencer.instrumentPrograms as Set<number>).join(',');
                out.push(
                    `  first loadMidiFile ${f.name}: ${firstTimes.map(x => x.toFixed(1)).join(' / ')} ms, alloc ${mb(fa.totalBytes)}; programs [${programs}]`
                );
            }
            out.push('  loadSoundFont');
            out.push(...allocTop(() => make().loadSoundFont(data, false), 8));
            out.push('  loadMidiFile');
            out.push(...allocTop(() => synthForMidi.loadMidiFile(midi), 10));
            out.push(...cpuTop(() => synthForMidi.loadMidiFile(midi), 3, 10, false));
            const r = censusOf(() => {
                const s = make();
                s.loadSoundFont(data, false);
                s.loadMidiFile(midi);
                return s;
            }, 15);
            out.push(`  retained synth after load: ${mb(r.bytes)} in ${r.count} objects`);
            out.push(...r.lines);
        }
        out.push('');
    });

    it('synth', () => {
        out.push('## synthesizer per audio buffer (2048 frames = 46.4 ms of audio)');
        const settings = new Settings();
        const sf = load('test-data/audio/default.sf2');
        for (const f of [importFiles[2], importFiles[0], importFiles[1]]) {
            const score = ScoreLoader.loadScoreFromBytes(load(f.file), settings);
            const { midi } = generateMidi(score, settings);
            const output = new TestOutput(false);
            const synth = new AlphaSynth(output, 500);
            synth.loadSoundFont(sf, false);
            synth.loadMidiFile(midi);
            synth.play();
            const tsf = (synth as any).synthesizer;
            const buffers = 1300; // ≈ 60 s of audio
            // warm up 10 s
            for (let i = 0; i < 215; i++) {
                output.next();
            }
            let voices = 0;
            let maxVoices = 0;
            const times: number[] = [];
            for (let i = 0; i < buffers; i++) {
                const t = performance.now();
                output.next();
                times.push(performance.now() - t);
                const v = tsf.activeVoiceCount as number;
                voices += v;
                maxVoices = Math.max(maxVoices, v);
            }
            const sorted = times.slice().sort((a, b) => a - b);
            const total = times.reduce((a, b) => a + b, 0);
            const a = AllocationSampler.measure(() => {
                for (let i = 0; i < 400; i++) {
                    output.next();
                }
            }, 256);
            out.push(
                `### ${f.name}: mean ${(total / buffers).toFixed(3)} ms/buffer (${((total / buffers / 46.44) * 100).toFixed(1)} % of real time), ` +
                    `p50 ${sorted[buffers >> 1].toFixed(3)} p99 ${sorted[Math.floor(buffers * 0.99)].toFixed(3)} ms; voices avg ${(voices / buffers).toFixed(1)} max ${maxVoices}; ` +
                    `alloc ${(a.totalBytes / 400 / 1024).toFixed(1)} KB/buffer`
            );
            for (const [k, v] of a.bySite.top(10)) {
                out.push(`    ${(v / 400 / 1024).toFixed(2).padStart(8)} KB/buffer  ${k}`);
            }
            out.push(
                ...cpuTop(
                    () => {
                        for (let i = 0; i < 400; i++) {
                            output.next();
                        }
                    },
                    1,
                    12,
                    false
                )
            );
        }
        out.push(
            `  (micro buffers per buffer: ${SynthConstants.MicroBufferCount} × ${SynthConstants.MicroBufferSize} frames)`,
            ''
        );
    });

    it('tick', () => {
        out.push('## per render quantum position update in the synth (samplesPlayed(128) -> updateTimePosition)');
        const settings = new Settings();
        const sf = load('test-data/audio/default.sf2');
        const score = ScoreLoader.loadScoreFromBytes(load(importFiles[2].file), settings);
        const { midi } = generateMidi(score, settings);
        const output = new TestOutput(false);
        const synth = new AlphaSynth(output, 500);
        synth.loadSoundFont(sf, false);
        synth.loadMidiFile(midi);
        synth.play();
        let events = 0;
        synth.positionChanged.on(() => {
            events++;
        });
        const quanta = 20000;
        const step = () => {
            for (let i = 0; i < quanta; i++) {
                (synth as any)._onSamplesPlayed(128);
            }
        };
        step();
        (synth as any)._timePosition = 0;
        const t0 = performance.now();
        step();
        const ms = performance.now() - t0;
        (synth as any)._timePosition = 0;
        const a = AllocationSampler.measure(step, 256);
        out.push(
            `  ${((ms * 1e6) / quanta).toFixed(0)} ns/quantum, ${(a.totalBytes / quanta).toFixed(0)} B/quantum; positionChanged events ${events}; ` +
                `at 344.5 quanta/s: ${((344.5 * a.totalBytes) / quanta / 1024).toFixed(0)} KB/s`
        );
        for (const [k, v] of a.bySite.top(8)) {
            out.push(`    ${(v / quanta).toFixed(0).padStart(6)} B/quantum  ${k}`);
        }
        out.push('');
    });

    it('midiwire', () => {
        out.push('## midi hand-off to the synth worker (N6)');
        const settings = new Settings();
        const score = ScoreLoader.loadScoreFromBytes(load(importFiles[0].file), settings);
        const { midi } = generateMidi(score, settings);
        const events = midi.tracks[0].events;
        const json = JsonConverter.midiFileToJsObject(midi);
        const tJson = timed(runs, () => JsonConverter.midiFileToJsObject(midi));
        const aJson = AllocationSampler.measure(() => JsonConverter.midiFileToJsObject(midi), 1024);
        const ser = v8.serialize(json);
        const tSer = timed(runs, () => v8.serialize(json));
        const tDe = timed(runs, () => v8.deserialize(ser));
        const cloned = v8.deserialize(ser);
        const tBack = timed(runs, () => JsonConverter.jsObjectToMidiFile(cloned));

        // flat prototype: 7 numbers per event, notes/control/pitch-bend decoded directly
        const encode = () => {
            const f = new Float64Array(events.length * 7);
            let o = 0;
            for (const e of events) {
                const x = e as any;
                f[o] = e.type;
                f[o + 1] = e.track;
                f[o + 2] = e.tick;
                switch (e.type) {
                    case MidiEventType.NoteOn:
                    case MidiEventType.NoteOff:
                        f[o + 3] = x.channel;
                        f[o + 4] = x.noteKey;
                        f[o + 5] = x.noteVelocity;
                        break;
                    case MidiEventType.ControlChange:
                        f[o + 3] = x.channel;
                        f[o + 4] = x.controller;
                        f[o + 5] = x.value;
                        break;
                    case MidiEventType.PitchBend:
                        f[o + 3] = x.channel;
                        f[o + 4] = x.value;
                        break;
                }
                o += 7;
            }
            return f;
        };
        const decode = (f: Float64Array) => {
            const m = new MidiFile();
            const track = new MidiTrack();
            m.tracks.push(track);
            for (let o = 0; o < f.length; o += 7) {
                const type = f[o];
                let e: MidiEvent;
                switch (type) {
                    case MidiEventType.NoteOn:
                        e = new NoteOnEvent(f[o + 1], f[o + 2], f[o + 3], f[o + 4], f[o + 5]);
                        break;
                    case MidiEventType.NoteOff:
                        e = new NoteOffEvent(f[o + 1], f[o + 2], f[o + 3], f[o + 4], f[o + 5]);
                        break;
                    case MidiEventType.ControlChange:
                        e = new ControlChangeEvent(f[o + 1], f[o + 2], f[o + 3], f[o + 4], f[o + 5]);
                        break;
                    case MidiEventType.PitchBend:
                        e = new PitchBendEvent(f[o + 1], f[o + 2], f[o + 3], f[o + 4]);
                        break;
                    default:
                        e = new NoteOnEvent(f[o + 1], f[o + 2], 0, 0, 0);
                        break;
                }
                track.events.push(e);
            }
            return m;
        };
        const flat = encode();
        const tEnc = timed(runs, encode);
        const aEnc = AllocationSampler.measure(encode, 1024);
        const tDec = timed(runs, () => decode(flat));
        const byType = new Map<number, number>();
        for (const e of events) {
            byType.set(e.type, (byType.get(e.type) ?? 0) + 1);
        }
        out.push(
            `  events=${events.length}; by type: ${Array.from(byType.entries())
                .map(([k, v]) => `${MidiEventType[k]}=${v}`)
                .join(', ')}`
        );
        out.push('| step | thread | ms | alloc / size |');
        out.push('|---|---|---|---|');
        out.push(`| midiFileToJsObject | main | ${tJson.toFixed(1)} | ${mb(aJson.totalBytes)} |`);
        out.push(
            `| structured clone serialize (Maps) | main | ${tSer.toFixed(1)} | ${(ser.length / 1024).toFixed(0)} KB |`
        );
        out.push(`| structured clone deserialize (Maps) | synth | ${tDe.toFixed(1)} | |`);
        out.push(`| jsObjectToMidiFile | synth | ${tBack.toFixed(1)} | |`);
        out.push(
            `| flat encode (Float64Array, transferable) | main | ${tEnc.toFixed(2)} | ${mb(aEnc.totalBytes)} (${(flat.byteLength / 1024).toFixed(0)} KB) |`
        );
        out.push(`| flat decode to MidiFile | synth | ${tDec.toFixed(2)} | |`);
        out.push('');
    });

    it('write', () => {
        const dir = path.join(root, 'temp/layout-flow');
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, 'model-cost.txt');
        fs.appendFileSync(file, `${out.join('\n')}\n`);
        console.log(`written ${file}`);
    });
});
