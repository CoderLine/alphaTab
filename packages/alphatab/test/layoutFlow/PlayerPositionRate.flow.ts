/** @target web */
// Player position update rate versus cursor accuracy on fast songs. Plays each song offline through
// AlphaSynth with a simulated AudioWorklet output (128-frame render quanta, the same
// PlayedFramesAccumulator as the worklet processor) and runs the API's beat lookup on every position update.
// Reported per song and interval:
// - updates/s: positionChanged events per second of audio;
// - msgs/s: postMessages per second in worker mode (worklet -> main -> synth worker -> main = 3 per update);
// - delay avg/max: time from a beat's start in the audio to the update which makes it the current beat;
// - skipped: beats never reported as the current beat (no playedBeatChanged, no highlight);
// - cursor err avg/max: lag of the animated beat cursor behind the audio, sampled at 60 Hz
//   (the cursor starts at a beat when it is reported and moves at the beat's speed).
// Hop and frame latencies of the browser are the same for all intervals and not included.
// Run: npm run test-layout-flow -- PlayerPositionRate
// (PLAYER_POSITION_INTERVALS=0,5,10,15,23.2 sets the intervals in milliseconds)
import fs from 'node:fs';
import path from 'node:path';
import {
    EventEmitter,
    EventEmitterOfT,
    type IEventEmitter,
    type IEventEmitterOfT
} from '@coderline/alphatab/EventEmitter';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { AlphaSynthMidiFileHandler } from '@coderline/alphatab/midi/AlphaSynthMidiFileHandler';
import { MidiFile } from '@coderline/alphatab/midi/MidiFile';
import { MidiFileGenerator } from '@coderline/alphatab/midi/MidiFileGenerator';
import type { MidiTickLookupFindBeatResult } from '@coderline/alphatab/midi/MidiTickLookup';
import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { Settings } from '@coderline/alphatab/Settings';
import { AlphaSynth } from '@coderline/alphatab/synth/AlphaSynth';
import { PlayedFramesAccumulator } from '@coderline/alphatab/synth/ds/PlayedFramesAccumulator';
import type { ISynthOutput, ISynthOutputDevice } from '@coderline/alphatab/synth/ISynthOutput';
import { SynthConstants } from '@coderline/alphatab/synth/SynthConstants';
import { TestPlatform } from 'test/TestPlatform';
import { describe, it } from 'vitest';

const root = process.cwd();
const QuantumFrames = 128;
const BufferFrames = 4096;
const BufferCount = 5;

/**
 * Mirrors the AudioWorklet processor: plays 128-frame quanta from a sample queue, reports the played
 * frames through a {@link PlayedFramesAccumulator} and requests buffers when it falls under half.
 * @internal
 */
class SimulatedWorkletOutput implements ISynthOutput {
    private readonly _accumulator: PlayedFramesAccumulator;
    private _queue: Float32Array[] = [];
    private _queueOffset: number = 0;
    private _queuedSamples: number = 0;
    private _requestedBuffers: number = 0;

    public playedFrames: number = 0;
    public reports: number = 0;

    public constructor(intervalMilliseconds: number) {
        this._accumulator = new PlayedFramesAccumulator(Math.round((intervalMilliseconds * this.sampleRate) / 1000));
    }

    public get sampleRate(): number {
        return 44100;
    }

    public open(_bufferTimeInMilliseconds: number): void {
        (this.ready as EventEmitter).trigger();
    }

    public play(): void {}
    public pause(): void {}
    public destroy(): void {}
    public activate(): void {}

    public addSamples(f: Float32Array): void {
        this._queue.push(f);
        this._queuedSamples += f.length;
        if (this._requestedBuffers > 0) {
            this._requestedBuffers--;
        }
    }

    public resetSamples(): void {
        this._report(this._accumulator.flush());
        this._queue = [];
        this._queueOffset = 0;
        this._queuedSamples = 0;
    }

    /**
     * Plays one render quantum.
     */
    public quantum(): void {
        let wanted = QuantumFrames * SynthConstants.AudioChannels;
        let read = 0;
        while (wanted > 0 && this._queue.length > 0) {
            const chunk = this._queue[0];
            const n = Math.min(wanted, chunk.length - this._queueOffset);
            this._queueOffset += n;
            wanted -= n;
            read += n;
            if (this._queueOffset === chunk.length) {
                this._queue.shift();
                this._queueOffset = 0;
            }
        }
        this._queuedSamples -= read;
        const played = read / SynthConstants.AudioChannels;
        this.playedFrames += played;
        const report = this._accumulator.add(QuantumFrames, played);
        if (report !== PlayedFramesAccumulator.NothingToReport) {
            this._report(report);
        }
        this._requestBuffers();
    }

    private _report(frames: number) {
        if (frames < 0) {
            return;
        }
        this.reports++;
        (this.samplesPlayed as EventEmitterOfT<number>).trigger(frames);
    }

    private _requestBuffers() {
        const half = (BufferCount / 2) | 0;
        const buffered = this._queuedSamples / SynthConstants.AudioChannels + this._requestedBuffers * BufferFrames;
        if (buffered < half * BufferFrames) {
            for (let i = 0; i < half; i++) {
                this._requestedBuffers++;
                (this.sampleRequest as EventEmitter).trigger();
            }
        }
    }

    public readonly ready: IEventEmitter = new EventEmitter();
    public readonly samplesPlayed: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public readonly sampleRequest: IEventEmitter = new EventEmitter();

    public async enumerateOutputDevices(): Promise<ISynthOutputDevice[]> {
        return [] as ISynthOutputDevice[];
    }
    public async setOutputDevice(_device: ISynthOutputDevice | null): Promise<void> {}
    public async getOutputDevice(): Promise<ISynthOutputDevice | null> {
        return null;
    }
}

interface Song {
    name: string;
    tempo: number;
    tex: string;
}

function song(name: string, tempo: number, duration: number, bars: number): Song {
    const notesPerBar = duration;
    const bar = `:${duration} ${'3.3 5.3 7.3 5.3 '.repeat(notesPerBar / 4).trim()}`;
    const barsTex: string[] = [];
    for (let i = 0; i < bars; i++) {
        barsTex.push(bar);
    }
    return { name, tempo, tex: `\\tempo ${tempo} . ${barsTex.join(' | ')}` };
}

const songs: Song[] = [
    song('16ths @ 240 bpm (62.5 ms)', 240, 16, 16),
    song('32nds @ 240 bpm (31.3 ms)', 240, 32, 16),
    song('32nds @ 300 bpm (25.0 ms)', 300, 32, 20),
    song('64ths @ 240 bpm (15.6 ms)', 240, 64, 8)
];

interface Result {
    seconds: number;
    updates: number;
    reports: number;
    beats: number;
    skipped: number;
    delayAvg: number;
    delayMax: number;
    cursorAvg: number;
    cursorMax: number;
}

function play(soundFont: Uint8Array, s: Song, intervalMilliseconds: number): Result {
    const settings = new Settings();
    const score = ScoreLoader.loadAlphaTex(s.tex, settings);
    const midi = new MidiFile();
    const generator = new MidiFileGenerator(score, settings, new AlphaSynthMidiFileHandler(midi));
    generator.generate();
    const tickLookup = generator.tickLookup;
    const trackLookup = new Set<number>([0]);

    const output = new SimulatedWorkletOutput(intervalMilliseconds);
    const synth = new AlphaSynth(output, 500);
    synth.loadSoundFont(soundFont, false);
    synth.loadMidiFile(midi);

    const beats: Beat[] = score.tracks[0].staves[0].bars.flatMap(b => b.voices[0].beats);
    const beatStartMs = new Map<Beat, number>();
    for (const b of beats) {
        beatStartMs.set(b, MidiUtils.ticksToMillis(b.absolutePlaybackStart, s.tempo));
    }
    // detection time (audio ms) per beat in reporting order
    const detections: { beat: Beat; at: number }[] = [];
    let current: MidiTickLookupFindBeatResult | null = null;
    let updates = 0;
    synth.positionChanged.on(e => {
        if (e.isSeek) {
            return;
        }
        updates++;
        const at = (output.playedFrames / output.sampleRate) * 1000;
        const found = tickLookup.findBeat(trackLookup, e.currentTick, current);
        if (found && (found.beat !== current?.beat || found.start !== current?.start)) {
            current = found;
            detections.push({ beat: found.beat, at });
        }
    });

    let finished = false;
    synth.finished.on(() => {
        finished = true;
    });
    synth.play();
    const endMs = MidiUtils.ticksToMillis(tickLookup.masterBars[tickLookup.masterBars.length - 1].end, s.tempo);
    const maxFrames = ((endMs + 3000) / 1000) * output.sampleRate;
    while (!finished && output.playedFrames < maxFrames) {
        output.quantum();
    }
    synth.destroy();

    const detected = new Map<Beat, number>();
    for (const d of detections) {
        if (!detected.has(d.beat)) {
            detected.set(d.beat, d.at);
        }
    }
    let delaySum = 0;
    let delayMax = 0;
    let skipped = 0;
    for (const b of beats) {
        const at = detected.get(b);
        if (at === undefined) {
            skipped++;
            continue;
        }
        const delay = at - beatStartMs.get(b)!;
        delaySum += delay;
        delayMax = Math.max(delayMax, delay);
    }

    // animated cursor: starts at the reported beat when reported and moves with the beat's speed
    let cursorSum = 0;
    let cursorMax = 0;
    let frames = 0;
    let d = -1;
    const frameMs = 1000 / 60;
    const lastBeat = beats[beats.length - 1];
    const songEndMs = beatStartMs.get(lastBeat)!;
    for (let t = frameMs; t < songEndMs; t += frameMs) {
        while (d + 1 < detections.length && detections[d + 1].at <= t) {
            d++;
        }
        if (d < 0) {
            continue;
        }
        const det = detections[d];
        const start = beatStartMs.get(det.beat)!;
        const index = beats.indexOf(det.beat);
        const end = index + 1 < beats.length ? beatStartMs.get(beats[index + 1])! : start;
        const cursorMs = start + Math.min(t - det.at, end - start);
        const error = t - cursorMs;
        cursorSum += error;
        cursorMax = Math.max(cursorMax, error);
        frames++;
    }

    const seconds = output.playedFrames / output.sampleRate;
    const detectedCount = beats.length - skipped;
    return {
        seconds,
        updates,
        reports: output.reports,
        beats: beats.length,
        skipped,
        delayAvg: detectedCount > 0 ? delaySum / detectedCount : 0,
        delayMax,
        cursorAvg: frames > 0 ? cursorSum / frames : 0,
        cursorMax
    };
}

describe('PlayerPositionRate', () => {
    const out: string[] = [];

    it('rates', async () => {
        const soundFont = await TestPlatform.loadFile('test-data/audio/default.sf2');
        const intervals = (process.env.PLAYER_POSITION_INTERVALS ?? '0,5,10,15,23.2')
            .split(',')
            .map(v => Number.parseFloat(v));
        out.push(`## PlayerPositionRate (${new Date().toISOString()})`);
        out.push('');
        out.push(
            '| song | interval ms (quanta) | updates/s | msgs/s (worker) | beats | skipped | delay avg / max ms | cursor err avg / max ms |'
        );
        out.push('|---|---|---|---|---|---|---|---|');
        for (const s of songs) {
            for (const interval of intervals) {
                const r = play(soundFont, s, interval);
                const quanta = Math.max(1, Math.ceil(Math.round((interval * 44100) / 1000) / QuantumFrames));
                out.push(
                    `| ${s.name} | ${interval} (${quanta}) | ${(r.updates / r.seconds).toFixed(0)} | ${(
                        (r.reports * 2 + r.updates) / r.seconds
                    ).toFixed(
                        0
                    )} | ${r.beats} | ${r.skipped} | ${r.delayAvg.toFixed(1)} / ${r.delayMax.toFixed(1)} | ${r.cursorAvg.toFixed(1)} / ${r.cursorMax.toFixed(1)} |`
                );
            }
        }
        out.push('');
        console.log(out.join('\n'));
    });

    it('write', () => {
        const dir = path.join(root, 'temp/layout-flow');
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, 'player-position-rate.txt');
        fs.appendFileSync(file, `${out.join('\n')}\n`);
        console.log(`written ${file}`);
    });
});
