/** @target web */
import fs from 'node:fs';
import v8 from 'node:v8';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { Logger } from '@coderline/alphatab/Logger';
import { LogLevel } from '@coderline/alphatab/LogLevel';
import { AlphaSynthMidiFileHandler } from '@coderline/alphatab/midi/AlphaSynthMidiFileHandler';
import { ControllerType } from '@coderline/alphatab/midi/ControllerType';
import {
    AlphaTabMetronomeEvent,
    AlphaTabRestEvent,
    ControlChangeEvent,
    EndOfTrackEvent,
    MidiEventType,
    NoteBendEvent,
    NoteOffEvent,
    NoteOnEvent,
    PitchBendEvent,
    ProgramChangeEvent,
    TempoChangeEvent,
    TimeSignatureEvent
} from '@coderline/alphatab/midi/MidiEvent';
import { MidiFile, MidiTrack } from '@coderline/alphatab/midi/MidiFile';
import { MidiFileGenerator } from '@coderline/alphatab/midi/MidiFileGenerator';
import { MidiFileWire } from '@coderline/alphatab/midi/MidiFileWire';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import { AlphaSynthWebWorker } from '@coderline/alphatab/platform/worker/AlphaSynthWebWorker';
import { AlphaSynthWebWorkerApi } from '@coderline/alphatab/platform/worker/AlphaSynthWebWorkerApi';
import type {
    IAlphaSynthWorker,
    IAlphaSynthWorkerMessage,
    IAlphaTabWorkerGlobalScope
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import { Settings } from '@coderline/alphatab/Settings';
import { AlphaSynth } from '@coderline/alphatab/synth/AlphaSynth';
import type { PositionChangedEventArgs } from '@coderline/alphatab/synth/PositionChangedEventArgs';
import { TestOutput } from 'test/audio/TestOutput';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ScoreCorpus } from '../ScoreCorpus';

/**
 * Connects an {@link AlphaSynthWebWorkerApi} and an {@link AlphaSynthWebWorker} in-process; structured clone
 * with transfer emulates the message boundary.
 */
class LoopbackSynthWorker implements IAlphaSynthWorker {
    public readonly posted: { message: IAlphaSynthWorkerMessage; transfer: Transferable[] | undefined }[] = [];
    public worker: AlphaSynthWebWorker | null = null;
    private _mainListeners: ((ev: MessageEvent<IAlphaSynthWorkerMessage>) => void)[] = [];

    public postMessage(message: IAlphaSynthWorkerMessage, transfer?: Transferable[]): void {
        this.posted.push({ message, transfer });
        const cloned = structuredClone(message, { transfer }) as IAlphaSynthWorkerMessage;
        this.worker!.handleMessage({ data: cloned } as MessageEvent<IAlphaSynthWorkerMessage>);
    }

    public deliverToMain(message: IAlphaSynthWorkerMessage): void {
        for (const l of this._mainListeners) {
            l({ data: message } as MessageEvent<IAlphaSynthWorkerMessage>);
        }
    }

    public addEventListener(_event: 'message', handler: (ev: MessageEvent<IAlphaSynthWorkerMessage>) => void): void {
        this._mainListeners.push(handler);
    }

    public removeEventListener(_event: 'message', handler: (ev: MessageEvent<IAlphaSynthWorkerMessage>) => void): void {
        this._mainListeners = this._mainListeners.filter(l => l !== handler);
    }

    public terminate(): void {
        // nothing to do
    }
}

class LoopbackWorkerScope implements IAlphaTabWorkerGlobalScope<IAlphaSynthWorkerMessage> {
    private _main: LoopbackSynthWorker;

    public constructor(main: LoopbackSynthWorker) {
        this._main = main;
    }

    public postMessage(message: IAlphaSynthWorkerMessage): void {
        this._main.deliverToMain(message);
    }

    public addEventListener(_event: 'message', _handler: (ev: MessageEvent<IAlphaSynthWorkerMessage>) => void): void {
        // messages are delivered through handleMessage
    }

    public removeEventListener(
        _event: 'message',
        _handler: (ev: MessageEvent<IAlphaSynthWorkerMessage>) => void
    ): void {
        // nothing to do
    }
}

// The synth worker receives the midi as MidiFileWire; the result must equal the public
// midiFileToJsObject/jsObjectToMidiFile round trip.
describe('MidiFileWire', () => {
    let previousLogLevel = LogLevel.Info;
    beforeAll(() => {
        previousLogLevel = Logger.logLevel;
        Logger.logLevel = LogLevel.None;
    });
    afterAll(() => {
        Logger.logLevel = previousLogLevel;
    });

    function generate(score: Score, settings: Settings): MidiFile {
        const midi = new MidiFile();
        new MidiFileGenerator(score, settings, new AlphaSynthMidiFileHandler(midi)).generate();
        return midi;
    }

    function viaMap(midi: MidiFile): MidiFile {
        return JsonConverter.jsObjectToMidiFile(v8.deserialize(v8.serialize(JsonConverter.midiFileToJsObject(midi))));
    }

    function viaWire(midi: MidiFile): MidiFile {
        const encoded = MidiFileWire.encode(midi);
        return MidiFileWire.decode(structuredClone(encoded, { transfer: [encoded.buffer] }));
    }

    it('all-event-types', () => {
        const midi = new MidiFile();
        midi.division = 960;
        midi.tickShift = 120;
        const a = new MidiTrack();
        a.addEvent(new TimeSignatureEvent(0, 0, 7, 3, 24, 8));
        const tempo = new TempoChangeEvent(0, 0);
        tempo.beatsPerMinute = 123.456;
        a.addEvent(tempo);
        a.addEvent(new ProgramChangeEvent(0, 0, 2, 25));
        a.addEvent(new ControlChangeEvent(0, 0, 2, ControllerType.VolumeCoarse, 100));
        a.addEvent(new AlphaTabMetronomeEvent(0, 0, 1, 960, 486.0110669));
        a.addEvent(new NoteOnEvent(0, 10, 2, 64, 95));
        a.addEvent(new PitchBendEvent(0, 20, 2, 8192.5));
        a.addEvent(new NoteBendEvent(0, 30, 2, 64, 8500.25));
        a.addEvent(new NoteOffEvent(0, 960, 2, 64, 0));
        a.addEvent(new AlphaTabRestEvent(0, 960, 2));
        a.addEvent(new EndOfTrackEvent(0, 1920));
        midi.tracks.push(a);
        midi.tracks.push(new MidiTrack());
        const b = new MidiTrack();
        b.addEvent(new NoteOnEvent(2, 5, 3, 40, 127));
        b.addEvent(new EndOfTrackEvent(2, 1920));
        midi.tracks.push(b);

        const types = new Set<MidiEventType>();
        for (const e of a.events) {
            types.add(e.type);
        }
        expect(types.size).toBe(11);

        const decoded = viaWire(midi);
        expect(decoded).toStrictEqual(viaMap(midi));
        expect(decoded.tracks.length).toBe(3);
        expect(decoded.tracks[0].events[1]).toBeInstanceOf(TempoChangeEvent);
        expect((decoded.tracks[0].events[1] as TempoChangeEvent).beatsPerMinute).toBe(123.456);
    });

    it('unknown-event-type', () => {
        const midi = new MidiFile();
        const track = new MidiTrack();
        const e = new EndOfTrackEvent(0, 0);
        e.type = MidiEventType.SystemExclusive;
        track.addEvent(e);
        midi.tracks.push(track);
        expect(() => viaMap(midi)).toThrow('Unknown Midi Event type');
        expect(() => viaWire(midi)).toThrow('Unknown Midi Event type');
    });

    it('corpus', () => {
        let compared = 0;
        let events = 0;
        for (const file of ScoreCorpus.files(process.cwd())) {
            const settings = new Settings();
            settings.core.logLevel = LogLevel.None;
            let score: Score;
            try {
                score = ScoreLoader.loadScoreFromBytes(new Uint8Array(fs.readFileSync(file)), settings);
            } catch {
                continue;
            }
            const midi = generate(score, settings);
            const decoded = viaWire(midi);
            const expected = viaMap(midi);
            if (decoded.tracks[0].events.length !== expected.tracks[0].events.length) {
                expect(decoded.tracks[0].events.length, file).toBe(expected.tracks[0].events.length);
            }
            expect(decoded, file).toStrictEqual(expected);
            compared++;
            events += midi.tracks[0].events.length;
        }
        expect(compared).toBeGreaterThan(90);
        expect(events).toBeGreaterThan(100000);
    });

    it('worker-load-midi', () => {
        const settings = new Settings();
        const score = ScoreLoader.loadScoreFromBytes(
            new Uint8Array(fs.readFileSync('test-data/conversion/full-song.gp5')),
            settings
        );
        const midi = generate(score, settings);

        const loopback = new LoopbackSynthWorker();
        loopback.worker = new AlphaSynthWebWorker(new LoopbackWorkerScope(loopback));
        const api = new AlphaSynthWebWorkerApi(new TestOutput(), settings, loopback);
        const loaded: PositionChangedEventArgs[] = [];
        api.midiLoaded.on(e => loaded.push(e));
        loopback.posted.length = 0;

        api.loadMidiFile(midi);

        expect(loopback.posted.length).toBe(1);
        const posted = loopback.posted[0];
        expect(posted.message.cmd).toBe('alphaSynth.loadMidi');
        const wire = (posted.message as { midi: unknown }).midi as Float64Array;
        expect(wire).toBeInstanceOf(Float64Array);
        expect(posted.transfer!.length).toBe(1);
        expect(posted.transfer![0]).toBe(wire.buffer);
        // transferred: the main side no longer owns the buffer
        expect(wire.byteLength).toBe(0);

        const direct = new AlphaSynth(new TestOutput(), 500);
        direct.loadMidiFile(viaMap(midi));
        expect(loaded.length).toBe(1);
        expect(loaded[0].endTick).toBe(direct.loadedMidiInfo!.endTick);
        expect(loaded[0].endTime).toBe(direct.loadedMidiInfo!.endTime);
        expect(loaded[0].endTick).toBeGreaterThan(0);
        api.destroy();
    });
});
