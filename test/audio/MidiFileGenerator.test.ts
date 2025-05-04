import { ControllerType } from '@src/midi/ControllerType';
import { type MidiEvent, MidiEventType, NoteOnEvent, type TimeSignatureEvent } from '@src/midi/MidiEvent';
import { MidiFileGenerator } from '@src/midi/MidiFileGenerator';
import { MidiFile } from '@src/midi/MidiFile';
import { MidiUtils } from '@src/midi/MidiUtils';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { Gp3To5Importer } from '@src/importer/Gp3To5Importer';
import { Gp7To8Importer } from '@src/importer/Gp7To8Importer';
import { ByteBuffer } from '@src/io/ByteBuffer';
import type { Beat } from '@src/model/Beat';
import { DynamicValue } from '@src/model/DynamicValue';
import { GraceType } from '@src/model/GraceType';
import type { Note } from '@src/model/Note';
import type { PlaybackInformation } from '@src/model/PlaybackInformation';
import type { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { Logger } from '@src/Logger';
import {
    FlatNoteBendEvent,
    FlatControlChangeEvent,
    FlatMidiEventGenerator,
    type FlatMidiEvent,
    FlatNoteEvent,
    FlatProgramChangeEvent,
    FlatTempoEvent,
    FlatTimeSignatureEvent,
    FlatTrackEndEvent,
    FlatRestEvent
} from '@test/audio/FlatMidiEventGenerator';
import { TestPlatform } from '@test/TestPlatform';
import { AlphaSynthMidiFileHandler } from '@src/midi/AlphaSynthMidiFileHandler';
import { expect } from 'chai';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import type { MidiTickLookup } from '@src/midi/MidiTickLookup';
import { AccentuationType } from '@src/model/AccentuationType';
import { Duration } from '@src/model/Duration';
import { VibratoType } from '@src/model/VibratoType';

describe('MidiFileGeneratorTest', () => {
    const parseTex: (tex: string) => Score = (tex: string): Score => {
        const importer: AlphaTexImporter = new AlphaTexImporter();
        importer.initFromString(tex, new Settings());
        return importer.readScore();
    };

    const assertEvents: (actualEvents: FlatMidiEvent[], expectedEvents: FlatMidiEvent[]) => void = (
        actualEvents: FlatMidiEvent[],
        expectedEvents: FlatMidiEvent[]
    ) => {
        for (let i: number = 0; i < actualEvents.length; i++) {
            Logger.info('Test', `i[${i}] ${actualEvents[i]}`);
            if (i < expectedEvents.length) {
                expect(expectedEvents[i].equals(actualEvents[i])).to.equal(
                    true,
                    `i[${i}] expected[${expectedEvents[i]}] !== actual[${actualEvents[i]}]`
                );
            }
        }
        expect(actualEvents.length).to.equal(expectedEvents.length);
    };

    it('full-song', async () => {
        const buffer = await TestPlatform.loadFile('test-data/audio/full-song.gp5');
        const readerBase: Gp3To5Importer = new Gp3To5Importer();
        readerBase.init(ByteBuffer.fromBuffer(buffer), new Settings());
        const score: Score = readerBase.readScore();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, new FlatMidiEventGenerator());
        generator.generate();
    });

    it('midi-order', () => {
        const midiFile: MidiFile = new MidiFile();
        midiFile.addEvent(new NoteOnEvent(0, 0, 0, 0, 0));
        midiFile.addEvent(new NoteOnEvent(0, 0, 0, 1, 0));
        midiFile.addEvent(new NoteOnEvent(0, 100, 0, 2, 0));
        midiFile.addEvent(new NoteOnEvent(0, 50, 0, 3, 0));
        midiFile.addEvent(new NoteOnEvent(0, 50, 0, 4, 0));
        expect((midiFile.tracks[0].events[0] as NoteOnEvent).noteKey).to.equal(0);
        expect((midiFile.tracks[0].events[1] as NoteOnEvent).noteKey).to.equal(1);
        expect((midiFile.tracks[0].events[2] as NoteOnEvent).noteKey).to.equal(3);
        expect((midiFile.tracks[0].events[3] as NoteOnEvent).noteKey).to.equal(4);
        expect((midiFile.tracks[0].events[4] as NoteOnEvent).noteKey).to.equal(2);
    });

    it('bend', () => {
        const tex: string = ':4 15.6{b(0 4)} 15.6';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes.length).to.equal(1);
        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            // bend effect
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note.realValue, 8192), // no bend
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note.realValue, 8192),
            new FlatNoteBendEvent(1 * 80, 0, info.secondaryChannel, note.realValue, 8277),
            new FlatNoteBendEvent(2 * 80, 0, info.secondaryChannel, note.realValue, 8363),
            new FlatNoteBendEvent(3 * 80, 0, info.secondaryChannel, note.realValue, 8448),
            new FlatNoteBendEvent(4 * 80, 0, info.secondaryChannel, note.realValue, 8533),
            new FlatNoteBendEvent(5 * 80, 0, info.secondaryChannel, note.realValue, 8619),
            new FlatNoteBendEvent(6 * 80, 0, info.secondaryChannel, note.realValue, 8704),
            new FlatNoteBendEvent(7 * 80, 0, info.secondaryChannel, note.realValue, 8789),
            new FlatNoteBendEvent(8 * 80, 0, info.secondaryChannel, note.realValue, 8875),
            new FlatNoteBendEvent(9 * 80, 0, info.secondaryChannel, note.realValue, 8960),
            new FlatNoteBendEvent(10 * 80, 0, info.secondaryChannel, note.realValue, 9045),
            new FlatNoteBendEvent(11 * 80, 0, info.secondaryChannel, note.realValue, 9131),
            new FlatNoteBendEvent(12 * 80, 0, info.secondaryChannel, note.realValue, 9216),

            // note itself
            new FlatNoteEvent(
                0,
                0,
                info.secondaryChannel,
                MidiUtils.toTicks(note.beat.duration),
                note.realValue,
                MidiUtils.dynamicToVelocity(note.dynamics)
            ),

            // reset bend
            new FlatNoteBendEvent(960, 0, info.primaryChannel, note.realValue, 8192),
            new FlatNoteEvent(
                960,
                0,
                info.primaryChannel,
                MidiUtils.toTicks(note.beat.duration),
                note.realValue,
                MidiUtils.dynamicToVelocity(note.dynamics)
            ),

            // end of track
            new FlatTrackEndEvent(3840, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('grace-beats', async () => {
        const reader: Gp7To8Importer = new Gp7To8Importer();
        const buffer = await TestPlatform.loadFile('test-data/audio/grace-beats.gp');
        const settings: Settings = Settings.songBook;
        reader.init(ByteBuffer.fromBuffer(buffer), settings);
        const score: Score = reader.readScore();
        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, settings, handler);
        generator.generate();
        // on beat
        let tick: number = 0;
        const ticks: number[] = [];
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].absolutePlaybackStart).to.equal(tick);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].playbackDuration).to.equal(3840);
        ticks.push(tick);
        tick += score.tracks[0].staves[0].bars[0].voices[0].beats[0].playbackDuration;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].absolutePlaybackStart).to.equal(tick);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].playbackDuration).to.equal(120);
        ticks.push(tick);
        tick += score.tracks[0].staves[0].bars[1].voices[0].beats[0].playbackDuration;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].absolutePlaybackStart).to.equal(tick);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].playbackDuration).to.equal(3720);
        ticks.push(tick);
        tick += score.tracks[0].staves[0].bars[1].voices[0].beats[1].playbackDuration;
        // before beat
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].absolutePlaybackStart).to.equal(tick);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].playbackDuration).to.equal(3720);
        ticks.push(tick);
        tick += score.tracks[0].staves[0].bars[2].voices[0].beats[0].playbackDuration;
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].absolutePlaybackStart).to.equal(tick);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].playbackDuration).to.equal(120);
        ticks.push(tick);
        tick += score.tracks[0].staves[0].bars[3].voices[0].beats[0].playbackDuration;
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].absolutePlaybackStart).to.equal(tick);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].playbackDuration).to.equal(3840);
        ticks.push(tick);
        tick += score.tracks[0].staves[0].bars[3].voices[0].beats[1].playbackDuration;
        // bend
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].graceType).to.equal(GraceType.BendGrace);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].absolutePlaybackStart).to.equal(tick);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].playbackDuration).to.equal(1920);
        ticks.push(tick);
        tick += score.tracks[0].staves[0].bars[4].voices[0].beats[0].playbackDuration;
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[1].absolutePlaybackStart).to.equal(tick);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[1].playbackDuration).to.equal(1920);
        ticks.push(tick);
        tick += score.tracks[0].staves[0].bars[4].voices[0].beats[1].playbackDuration;
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const mfVelocity = MidiUtils.dynamicToVelocity(DynamicValue.MF);
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 96),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 96),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            // on beat
            new FlatNoteBendEvent(ticks[0], 0, info.primaryChannel, 67, 8192),
            new FlatNoteEvent(ticks[0], 0, info.primaryChannel, 3840, 67, mfVelocity),

            new FlatNoteBendEvent(ticks[1], 0, info.primaryChannel, 67, 8192),
            new FlatNoteEvent(ticks[1], 0, info.primaryChannel, 120, 67, mfVelocity),

            new FlatNoteBendEvent(ticks[2], 0, info.primaryChannel, 67, 8192),
            new FlatNoteEvent(ticks[2], 0, info.primaryChannel, 3720, 67, mfVelocity),

            // before beat
            new FlatNoteBendEvent(ticks[3], 0, info.primaryChannel, 67, 8192),
            new FlatNoteEvent(ticks[3], 0, info.primaryChannel, 3720, 67, mfVelocity),

            new FlatNoteBendEvent(ticks[4], 0, info.primaryChannel, 67, 8192),
            new FlatNoteEvent(ticks[4], 0, info.primaryChannel, 120, 67, mfVelocity),

            new FlatNoteBendEvent(ticks[5], 0, info.primaryChannel, 67, 8192),
            new FlatNoteEvent(ticks[5], 0, info.primaryChannel, 3840, 67, mfVelocity),

            // bend beat
            new FlatNoteBendEvent(ticks[6], 0, info.secondaryChannel, 67, 8192),
            new FlatNoteBendEvent(ticks[6] + 12 * 0, 0, info.secondaryChannel, 67, 8192),
            new FlatNoteBendEvent(ticks[6] + 12 * 1, 0, info.secondaryChannel, 67, 8277),
            new FlatNoteBendEvent(ticks[6] + 12 * 2, 0, info.secondaryChannel, 67, 8363),
            new FlatNoteBendEvent(ticks[6] + 12 * 3, 0, info.secondaryChannel, 67, 8448),
            new FlatNoteBendEvent(ticks[6] + 12 * 4, 0, info.secondaryChannel, 67, 8533),
            new FlatNoteBendEvent(ticks[6] + 12 * 5, 0, info.secondaryChannel, 67, 8619),
            new FlatNoteBendEvent(ticks[6] + 12 * 6, 0, info.secondaryChannel, 67, 8704),
            new FlatNoteBendEvent(ticks[6] + 12 * 7, 0, info.secondaryChannel, 67, 8789),
            new FlatNoteBendEvent(ticks[6] + 12 * 8, 0, info.secondaryChannel, 67, 8875),
            new FlatNoteBendEvent(ticks[6] + 12 * 9, 0, info.secondaryChannel, 67, 8960),
            new FlatNoteBendEvent(ticks[6] + 12 * 10, 0, info.secondaryChannel, 67, 9045),
            new FlatNoteBendEvent(ticks[6] + 12 * 11, 0, info.secondaryChannel, 67, 9131),
            new FlatNoteBendEvent(ticks[6] + 12 * 12, 0, info.secondaryChannel, 67, 9216),
            new FlatNoteEvent(ticks[6], 0, info.secondaryChannel, 3840, 67, mfVelocity),

            // end of track
            new FlatTrackEndEvent(19200, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('bend-multi-point', () => {
        const tex: string = ':4 15.6{b(0 4 0)} 15.6';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes.length).to.equal(1);
        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            // bend effect
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note.realValue, 8192),
            new FlatNoteBendEvent(0 * 40, 0, info.secondaryChannel, note.realValue, 8192), // no bend
            new FlatNoteBendEvent(1 * 40, 0, info.secondaryChannel, note.realValue, 8277),
            new FlatNoteBendEvent(2 * 40, 0, info.secondaryChannel, note.realValue, 8363),
            new FlatNoteBendEvent(3 * 40, 0, info.secondaryChannel, note.realValue, 8448),
            new FlatNoteBendEvent(4 * 40, 0, info.secondaryChannel, note.realValue, 8533),
            new FlatNoteBendEvent(5 * 40, 0, info.secondaryChannel, note.realValue, 8619),
            new FlatNoteBendEvent(6 * 40, 0, info.secondaryChannel, note.realValue, 8704),
            new FlatNoteBendEvent(7 * 40, 0, info.secondaryChannel, note.realValue, 8789),
            new FlatNoteBendEvent(8 * 40, 0, info.secondaryChannel, note.realValue, 8875),
            new FlatNoteBendEvent(9 * 40, 0, info.secondaryChannel, note.realValue, 8960),
            new FlatNoteBendEvent(10 * 40, 0, info.secondaryChannel, note.realValue, 9045),
            new FlatNoteBendEvent(11 * 40, 0, info.secondaryChannel, note.realValue, 9131),
            new FlatNoteBendEvent(12 * 40, 0, info.secondaryChannel, note.realValue, 9216), // full bend
            new FlatNoteBendEvent(12 * 40, 0, info.secondaryChannel, note.realValue, 9216), // full bend
            new FlatNoteBendEvent(13 * 40, 0, info.secondaryChannel, note.realValue, 9131),
            new FlatNoteBendEvent(14 * 40, 0, info.secondaryChannel, note.realValue, 9045),
            new FlatNoteBendEvent(15 * 40, 0, info.secondaryChannel, note.realValue, 8960),
            new FlatNoteBendEvent(16 * 40, 0, info.secondaryChannel, note.realValue, 8875),
            new FlatNoteBendEvent(17 * 40, 0, info.secondaryChannel, note.realValue, 8789),
            new FlatNoteBendEvent(18 * 40, 0, info.secondaryChannel, note.realValue, 8704),
            new FlatNoteBendEvent(19 * 40, 0, info.secondaryChannel, note.realValue, 8619),
            new FlatNoteBendEvent(20 * 40, 0, info.secondaryChannel, note.realValue, 8533),
            new FlatNoteBendEvent(21 * 40, 0, info.secondaryChannel, note.realValue, 8448),
            new FlatNoteBendEvent(22 * 40, 0, info.secondaryChannel, note.realValue, 8363),
            new FlatNoteBendEvent(23 * 40, 0, info.secondaryChannel, note.realValue, 8277),
            new FlatNoteBendEvent(24 * 40, 0, info.secondaryChannel, note.realValue, 8192), // no bend

            // note itself
            new FlatNoteEvent(
                0,
                0,
                info.secondaryChannel,
                MidiUtils.toTicks(note.beat.duration),
                note.realValue,
                MidiUtils.dynamicToVelocity(note.dynamics)
            ),

            // reset bend
            new FlatNoteBendEvent(960, 0, info.primaryChannel, note.realValue, 8192), // finish
            new FlatNoteEvent(
                960,
                0,
                info.primaryChannel,
                MidiUtils.toTicks(note.beat.duration),
                note.realValue,
                MidiUtils.dynamicToVelocity(note.dynamics)
            ), // end of track
            new FlatTrackEndEvent(3840, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('bend-continued', () => {
        const tex: string = '7.3{b (0 4)} -.3{b (4 0)}';
        const score: Score = parseTex(tex);

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            // bend up
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, 62, 8192),
            new FlatNoteBendEvent(0 * 80, 0, info.secondaryChannel, 62, 8192), // no bend
            new FlatNoteBendEvent(1 * 80, 0, info.secondaryChannel, 62, 8277),
            new FlatNoteBendEvent(2 * 80, 0, info.secondaryChannel, 62, 8363),
            new FlatNoteBendEvent(3 * 80, 0, info.secondaryChannel, 62, 8448),
            new FlatNoteBendEvent(4 * 80, 0, info.secondaryChannel, 62, 8533),
            new FlatNoteBendEvent(5 * 80, 0, info.secondaryChannel, 62, 8619),
            new FlatNoteBendEvent(6 * 80, 0, info.secondaryChannel, 62, 8704),
            new FlatNoteBendEvent(7 * 80, 0, info.secondaryChannel, 62, 8789),
            new FlatNoteBendEvent(8 * 80, 0, info.secondaryChannel, 62, 8875),
            new FlatNoteBendEvent(9 * 80, 0, info.secondaryChannel, 62, 8960),
            new FlatNoteBendEvent(10 * 80, 0, info.secondaryChannel, 62, 9045),
            new FlatNoteBendEvent(11 * 80, 0, info.secondaryChannel, 62, 9131),
            new FlatNoteBendEvent(12 * 80, 0, info.secondaryChannel, 62, 9216),

            // note itself
            new FlatNoteEvent(
                0,
                0,
                info.secondaryChannel,
                MidiUtils.toTicks(note.beat.duration) * 2,
                note.realValue,
                MidiUtils.dynamicToVelocity(note.dynamics)
            ),

            // release on tied note
            new FlatNoteBendEvent(12 * 80, 0, info.secondaryChannel, 62, 9216), // reset bend for tied note
            new FlatNoteBendEvent(12 * 80, 0, info.secondaryChannel, 62, 9216), // full bend
            new FlatNoteBendEvent(13 * 80, 0, info.secondaryChannel, 62, 9131),
            new FlatNoteBendEvent(14 * 80, 0, info.secondaryChannel, 62, 9045),
            new FlatNoteBendEvent(15 * 80, 0, info.secondaryChannel, 62, 8960),
            new FlatNoteBendEvent(16 * 80, 0, info.secondaryChannel, 62, 8875),
            new FlatNoteBendEvent(17 * 80, 0, info.secondaryChannel, 62, 8789),
            new FlatNoteBendEvent(18 * 80, 0, info.secondaryChannel, 62, 8704),
            new FlatNoteBendEvent(19 * 80, 0, info.secondaryChannel, 62, 8619),
            new FlatNoteBendEvent(20 * 80, 0, info.secondaryChannel, 62, 8533),
            new FlatNoteBendEvent(21 * 80, 0, info.secondaryChannel, 62, 8448),
            new FlatNoteBendEvent(22 * 80, 0, info.secondaryChannel, 62, 8363),
            new FlatNoteBendEvent(23 * 80, 0, info.secondaryChannel, 62, 8277),
            new FlatNoteBendEvent(24 * 80, 0, info.secondaryChannel, 62, 8192), // no bend

            new FlatTrackEndEvent(3840, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('pre-bend-release-continued', () => {
        const tex: string = '7.3{b (4 0)} -.3';
        const score: Score = parseTex(tex);

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            // bend up
            new FlatNoteBendEvent(0 * 80, 0, info.secondaryChannel, 62, 9216), // pre-bend
            new FlatNoteBendEvent(0 * 160, 0, info.secondaryChannel, 62, 9216), // bend start
            new FlatNoteBendEvent(1 * 160, 0, info.secondaryChannel, 62, 9131),
            new FlatNoteBendEvent(2 * 160, 0, info.secondaryChannel, 62, 9045),
            new FlatNoteBendEvent(3 * 160, 0, info.secondaryChannel, 62, 8960),
            new FlatNoteBendEvent(4 * 160, 0, info.secondaryChannel, 62, 8875),
            new FlatNoteBendEvent(5 * 160, 0, info.secondaryChannel, 62, 8789),
            new FlatNoteBendEvent(6 * 160, 0, info.secondaryChannel, 62, 8704),
            new FlatNoteBendEvent(7 * 160, 0, info.secondaryChannel, 62, 8619),
            new FlatNoteBendEvent(8 * 160, 0, info.secondaryChannel, 62, 8533),
            new FlatNoteBendEvent(9 * 160, 0, info.secondaryChannel, 62, 8448),
            new FlatNoteBendEvent(10 * 160, 0, info.secondaryChannel, 62, 8363),
            new FlatNoteBendEvent(11 * 160, 0, info.secondaryChannel, 62, 8277),
            new FlatNoteBendEvent(12 * 160, 0, info.secondaryChannel, 62, 8192),

            // note itself
            new FlatNoteEvent(
                0,
                0,
                info.secondaryChannel,
                MidiUtils.toTicks(note.beat.duration) * 2,
                note.realValue,
                MidiUtils.dynamicToVelocity(note.dynamics)
            ),

            new FlatTrackEndEvent(3840, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('pre-bend-release-continued-songbook', () => {
        const tex: string = '7.3{b (4 0)} -.3';
        const score: Score = parseTex(tex);

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const settings = new Settings();
        settings.setSongBookModeSettings();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, settings, handler);
        generator.generate();
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            // bend up
            new FlatNoteBendEvent(0 * 80, 0, info.secondaryChannel, 62, 9216), // pre-bend
            new FlatNoteBendEvent(0 * 80, 0, info.secondaryChannel, 62, 9216), // bend start
            new FlatNoteBendEvent(1 * 80, 0, info.secondaryChannel, 62, 9131),
            new FlatNoteBendEvent(2 * 80, 0, info.secondaryChannel, 62, 9045),
            new FlatNoteBendEvent(3 * 80, 0, info.secondaryChannel, 62, 8960),
            new FlatNoteBendEvent(4 * 80, 0, info.secondaryChannel, 62, 8875),
            new FlatNoteBendEvent(5 * 80, 0, info.secondaryChannel, 62, 8789),
            new FlatNoteBendEvent(6 * 80, 0, info.secondaryChannel, 62, 8704),
            new FlatNoteBendEvent(7 * 80, 0, info.secondaryChannel, 62, 8619),
            new FlatNoteBendEvent(8 * 80, 0, info.secondaryChannel, 62, 8533),
            new FlatNoteBendEvent(9 * 80, 0, info.secondaryChannel, 62, 8448),
            new FlatNoteBendEvent(10 * 80, 0, info.secondaryChannel, 62, 8363),
            new FlatNoteBendEvent(11 * 80, 0, info.secondaryChannel, 62, 8277),
            new FlatNoteBendEvent(12 * 80, 0, info.secondaryChannel, 62, 8192),

            // note itself
            new FlatNoteEvent(
                0,
                0,
                info.secondaryChannel,
                MidiUtils.toTicks(note.beat.duration) * 2,
                note.realValue,
                MidiUtils.dynamicToVelocity(note.dynamics)
            ),

            new FlatTrackEndEvent(3840, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('triplet-feel', () => {
        const tex: string =
            '\\ts 2 4 \\tf t8 3.2.8*4 | \\tf t16 3.2.16*8 | \\tf d8 3.2.8*4 | \\tf d16 3.2.16*8 | \\tf s8 3.2.8*4 | \\tf s16 3.2.16*8';
        const score: Score = parseTex(tex);
        // prettier-ignore
        const expectedPlaybackStartTimes: number[] = [
            0, 480, 960, 1440, 0, 240, 480, 720, 960, 1200, 1440, 1680, 0, 480, 960, 1440, 0, 240, 480, 720, 960, 1200,
            1440, 1680, 0, 480, 960, 1440, 0, 240, 480, 720, 960, 1200, 1440, 1680
        ];
        // prettier-ignore
        const expectedPlaybackDurations: number[] = [
            480, 480, 480, 480, 240, 240, 240, 240, 240, 240, 240, 240, 480, 480, 480, 480, 240, 240, 240, 240, 240,
            240, 240, 240, 480, 480, 480, 480, 240, 240, 240, 240, 240, 240, 240, 240
        ];
        const actualPlaybackStartTimes: number[] = [];
        const actualPlaybackDurations: number[] = [];
        let beat: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (beat) {
            actualPlaybackStartTimes.push(beat.playbackStart);
            actualPlaybackDurations.push(beat.playbackDuration);
            beat = beat.nextBeat;
        }
        expect(actualPlaybackStartTimes.join(',')).to.equal(expectedPlaybackStartTimes.join(','));
        expect(actualPlaybackDurations.join(',')).to.equal(expectedPlaybackDurations.join(','));
        // prettier-ignore
        const expectedMidiStartTimes: number[] = [
            0, 640, 960, 1600, 1920, 2240, 2400, 2720, 2880, 3200, 3360, 3680, 3840, 4560, 4800, 5520, 5760, 6120, 6240,
            6600, 6720, 7080, 7200, 7560, 7680, 7920, 8640, 8880, 9600, 9720, 10080, 10200, 10560, 10680, 11040, 11160
        ];
        // prettier-ignore
        const expectedMidiDurations: number[] = [
            640, 320, 640, 320, 320, 160, 320, 160, 320, 160, 320, 160, 720, 240, 720, 240, 360, 120, 360, 120, 360,
            120, 360, 120, 240, 720, 240, 720, 120, 360, 120, 360, 120, 360, 120, 360
        ];

        const actualMidiStartTimes: number[] = [];
        const actualMidiDurations: number[] = [];
        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        for (const midiEvent of handler.midiEvents) {
            if (midiEvent instanceof FlatNoteEvent) {
                actualMidiStartTimes.push(midiEvent.tick);
                actualMidiDurations.push(midiEvent.length);
            }
        }
        expect(actualMidiStartTimes.join(',')).to.equal(expectedMidiStartTimes.join(','));
        expect(actualMidiDurations.join(',')).to.equal(expectedMidiDurations.join(','));
    });

    it('beat-multi-bend', () => {
        const tex: string = ':4 (15.6{b(0 4)} 14.6{b(0 8)}) 15.6';
        const score: Score = parseTex(tex);
        expect(score.tracks.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices.length).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes.length).to.equal(1);
        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note1: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const note2: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[1];
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            // bend effect (note 1)
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note1.realValue, 8192), // no bend
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note1.realValue, 8192),
            new FlatNoteBendEvent(1 * 80, 0, info.secondaryChannel, note1.realValue, 8277),
            new FlatNoteBendEvent(2 * 80, 0, info.secondaryChannel, note1.realValue, 8363),
            new FlatNoteBendEvent(3 * 80, 0, info.secondaryChannel, note1.realValue, 8448),
            new FlatNoteBendEvent(4 * 80, 0, info.secondaryChannel, note1.realValue, 8533),
            new FlatNoteBendEvent(5 * 80, 0, info.secondaryChannel, note1.realValue, 8619),
            new FlatNoteBendEvent(6 * 80, 0, info.secondaryChannel, note1.realValue, 8704),
            new FlatNoteBendEvent(7 * 80, 0, info.secondaryChannel, note1.realValue, 8789),
            new FlatNoteBendEvent(8 * 80, 0, info.secondaryChannel, note1.realValue, 8875),
            new FlatNoteBendEvent(9 * 80, 0, info.secondaryChannel, note1.realValue, 8960),
            new FlatNoteBendEvent(10 * 80, 0, info.secondaryChannel, note1.realValue, 9045),
            new FlatNoteBendEvent(11 * 80, 0, info.secondaryChannel, note1.realValue, 9131),
            new FlatNoteBendEvent(12 * 80, 0, info.secondaryChannel, note1.realValue, 9216),

            // note itself
            new FlatNoteEvent(
                0,
                0,
                info.secondaryChannel,
                MidiUtils.toTicks(note1.beat.duration),
                note1.realValue,
                MidiUtils.dynamicToVelocity(note1.dynamics)
            ),

            // bend effect (note 2)
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note2.realValue, 8192), // no bend
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note2.realValue, 8192),
            new FlatNoteBendEvent(1 * 40, 0, info.secondaryChannel, note2.realValue, 8277),
            new FlatNoteBendEvent(2 * 40, 0, info.secondaryChannel, note2.realValue, 8363),
            new FlatNoteBendEvent(3 * 40, 0, info.secondaryChannel, note2.realValue, 8448),
            new FlatNoteBendEvent(4 * 40, 0, info.secondaryChannel, note2.realValue, 8533),
            new FlatNoteBendEvent(5 * 40, 0, info.secondaryChannel, note2.realValue, 8619),
            new FlatNoteBendEvent(6 * 40, 0, info.secondaryChannel, note2.realValue, 8704),
            new FlatNoteBendEvent(7 * 40, 0, info.secondaryChannel, note2.realValue, 8789),
            new FlatNoteBendEvent(8 * 40, 0, info.secondaryChannel, note2.realValue, 8875),
            new FlatNoteBendEvent(9 * 40, 0, info.secondaryChannel, note2.realValue, 8960),
            new FlatNoteBendEvent(10 * 40, 0, info.secondaryChannel, note2.realValue, 9045),
            new FlatNoteBendEvent(11 * 40, 0, info.secondaryChannel, note2.realValue, 9131),
            new FlatNoteBendEvent(12 * 40, 0, info.secondaryChannel, note2.realValue, 9216),
            new FlatNoteBendEvent(13 * 40, 0, info.secondaryChannel, note2.realValue, 9301),
            new FlatNoteBendEvent(14 * 40, 0, info.secondaryChannel, note2.realValue, 9387),
            new FlatNoteBendEvent(15 * 40, 0, info.secondaryChannel, note2.realValue, 9472),
            new FlatNoteBendEvent(16 * 40, 0, info.secondaryChannel, note2.realValue, 9557),
            new FlatNoteBendEvent(17 * 40, 0, info.secondaryChannel, note2.realValue, 9643),
            new FlatNoteBendEvent(18 * 40, 0, info.secondaryChannel, note2.realValue, 9728),
            new FlatNoteBendEvent(19 * 40, 0, info.secondaryChannel, note2.realValue, 9813),
            new FlatNoteBendEvent(20 * 40, 0, info.secondaryChannel, note2.realValue, 9899),
            new FlatNoteBendEvent(21 * 40, 0, info.secondaryChannel, note2.realValue, 9984),
            new FlatNoteBendEvent(22 * 40, 0, info.secondaryChannel, note2.realValue, 10069),
            new FlatNoteBendEvent(23 * 40, 0, info.secondaryChannel, note2.realValue, 10155),
            new FlatNoteBendEvent(24 * 40, 0, info.secondaryChannel, note2.realValue, 10240),

            // note itself
            new FlatNoteEvent(
                0,
                0,
                info.secondaryChannel,
                MidiUtils.toTicks(note2.beat.duration),
                note2.realValue,
                MidiUtils.dynamicToVelocity(note2.dynamics)
            ),

            // reset bend
            new FlatNoteBendEvent(960, 0, info.primaryChannel, note1.realValue, 8192),
            new FlatNoteEvent(
                960,
                0,
                info.primaryChannel,
                MidiUtils.toTicks(note1.beat.duration),
                note1.realValue,
                MidiUtils.dynamicToVelocity(note1.dynamics)
            ),

            // end of track
            new FlatTrackEndEvent(3840, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('tied-vibrato', () => {
        const tex: string = '3.3{v}.4 -.3{v}.4';
        const score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].vibrato).to.equal(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isTieDestination).to.be.true;
        score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].vibrato = VibratoType.None;
        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const settings = new Settings();
        settings.player.vibrato.noteSlightLength = MidiUtils.QuarterTime / 2; // to reduce the number of vibrato events
        const generator: MidiFileGenerator = new MidiFileGenerator(score, settings, handler);
        generator.vibratoResolution = settings.player.vibrato.noteSlightLength / 4;
        generator.generate();
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note1: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            new FlatNoteBendEvent(0, 0, info.primaryChannel, note1.realValue, 8192), // no bend (note itself)
            new FlatNoteBendEvent(0, 0, info.primaryChannel, note1.realValue, 8192), // no bend (vibrato start on main note)
            new FlatNoteBendEvent(120, 0, info.primaryChannel, note1.realValue, 8320),
            new FlatNoteBendEvent(240, 0, info.primaryChannel, note1.realValue, 8192),
            new FlatNoteBendEvent(360, 0, info.primaryChannel, note1.realValue, 8064),
            new FlatNoteBendEvent(480, 0, info.primaryChannel, note1.realValue, 8192),
            new FlatNoteBendEvent(600, 0, info.primaryChannel, note1.realValue, 8320),
            new FlatNoteBendEvent(720, 0, info.primaryChannel, note1.realValue, 8192),
            new FlatNoteBendEvent(840, 0, info.primaryChannel, note1.realValue, 8064),
            new FlatNoteBendEvent(960, 0, info.primaryChannel, note1.realValue, 8192), // end of quarter note (main)
            new FlatNoteEvent(
                0,
                0,
                info.primaryChannel,
                1920,
                note1.realValue,
                MidiUtils.dynamicToVelocity(note1.dynamics)
            ),

            new FlatNoteBendEvent(960, 0, info.primaryChannel, note1.realValue, 8192), // no bend (vibrato start on main note)
            new FlatNoteBendEvent(1080, 0, info.primaryChannel, note1.realValue, 8320), // continued vibrato on tied note
            new FlatNoteBendEvent(1200, 0, info.primaryChannel, note1.realValue, 8192),
            new FlatNoteBendEvent(1320, 0, info.primaryChannel, note1.realValue, 8064),
            new FlatNoteBendEvent(1440, 0, info.primaryChannel, note1.realValue, 8192),
            new FlatNoteBendEvent(1560, 0, info.primaryChannel, note1.realValue, 8320),
            new FlatNoteBendEvent(1680, 0, info.primaryChannel, note1.realValue, 8192),
            new FlatNoteBendEvent(1800, 0, info.primaryChannel, note1.realValue, 8064),
            new FlatNoteBendEvent(1920, 0, info.primaryChannel, note1.realValue, 8192), // end of second quarter note

            // end of track
            new FlatTrackEndEvent(3840, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('bend-tied-no-vibrato', () => {
        const tex: string = '3.3{b (0 4)}.4 -.3.4';
        const score: Score = parseTex(tex);

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const settings = new Settings();
        settings.player.vibrato.noteSlightLength = MidiUtils.QuarterTime / 2; // to reduce the number of vibrato events
        const generator: MidiFileGenerator = new MidiFileGenerator(score, settings, handler);
        generator.vibratoResolution = settings.player.vibrato.noteSlightLength / 4;
        generator.generate();
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note1: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            // bend spans the whole range of both quarter notes
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note1.realValue, 8192), // no bend
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note1.realValue, 8192),
            new FlatNoteBendEvent(160, 0, info.secondaryChannel, note1.realValue, 8277),
            new FlatNoteBendEvent(320, 0, info.secondaryChannel, note1.realValue, 8363),
            new FlatNoteBendEvent(480, 0, info.secondaryChannel, note1.realValue, 8448),
            new FlatNoteBendEvent(640, 0, info.secondaryChannel, note1.realValue, 8533),
            new FlatNoteBendEvent(800, 0, info.secondaryChannel, note1.realValue, 8619),
            new FlatNoteBendEvent(960, 0, info.secondaryChannel, note1.realValue, 8704),
            new FlatNoteBendEvent(1120, 0, info.secondaryChannel, note1.realValue, 8789),
            new FlatNoteBendEvent(1280, 0, info.secondaryChannel, note1.realValue, 8875),
            new FlatNoteBendEvent(1440, 0, info.secondaryChannel, note1.realValue, 8960),
            new FlatNoteBendEvent(1600, 0, info.secondaryChannel, note1.realValue, 9045),
            new FlatNoteBendEvent(1760, 0, info.secondaryChannel, note1.realValue, 9131),
            new FlatNoteBendEvent(1920, 0, info.secondaryChannel, note1.realValue, 9216),
            new FlatNoteEvent(
                0,
                0,
                info.secondaryChannel,
                1920,
                note1.realValue,
                MidiUtils.dynamicToVelocity(note1.dynamics)
            ),

            // end of track
            new FlatTrackEndEvent(3840, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('tied-bend', () => {
        const tex: string = '3.3.4 -.3.8 -.3{b (0 4)}.8';
        const score: Score = parseTex(tex);

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const settings = new Settings();
        settings.player.vibrato.noteSlightLength = MidiUtils.QuarterTime / 2; // to reduce the number of vibrato events
        const generator: MidiFileGenerator = new MidiFileGenerator(score, settings, handler);
        generator.vibratoResolution = settings.player.vibrato.noteSlightLength / 4;
        generator.generate();
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note1: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note1.realValue, 8192), // no bend
            new FlatNoteEvent(
                0,
                0,
                info.secondaryChannel,
                1920,
                note1.realValue,
                MidiUtils.dynamicToVelocity(note1.dynamics)
            ),

            // tied note (no bend)

            // tied note (with bend)
            new FlatNoteBendEvent(1440, 0, info.secondaryChannel, note1.realValue, 8192), // reset to start
            new FlatNoteBendEvent(1440, 0, info.secondaryChannel, note1.realValue, 8192), // begin bend
            new FlatNoteBendEvent(1480, 0, info.secondaryChannel, note1.realValue, 8277),
            new FlatNoteBendEvent(1520, 0, info.secondaryChannel, note1.realValue, 8363),
            new FlatNoteBendEvent(1560, 0, info.secondaryChannel, note1.realValue, 8448),
            new FlatNoteBendEvent(1600, 0, info.secondaryChannel, note1.realValue, 8533),
            new FlatNoteBendEvent(1640, 0, info.secondaryChannel, note1.realValue, 8619),
            new FlatNoteBendEvent(1680, 0, info.secondaryChannel, note1.realValue, 8704),
            new FlatNoteBendEvent(1720, 0, info.secondaryChannel, note1.realValue, 8789),
            new FlatNoteBendEvent(1760, 0, info.secondaryChannel, note1.realValue, 8875),
            new FlatNoteBendEvent(1800, 0, info.secondaryChannel, note1.realValue, 8960),
            new FlatNoteBendEvent(1840, 0, info.secondaryChannel, note1.realValue, 9045),
            new FlatNoteBendEvent(1880, 0, info.secondaryChannel, note1.realValue, 9131),
            new FlatNoteBendEvent(1920, 0, info.secondaryChannel, note1.realValue, 9216),

            // end of track
            new FlatTrackEndEvent(3840, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('tied-bend-hammer', async () => {
        const score: Score = ScoreLoader.loadScoreFromBytes(
            await TestPlatform.loadFile('test-data/audio/tied-bend-hammer.gp')
        );

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const settings = new Settings();
        settings.player.vibrato.noteSlightLength = MidiUtils.QuarterTime / 2; // to reduce the number of vibrato events
        const generator: MidiFileGenerator = new MidiFileGenerator(score, settings, handler);
        generator.vibratoResolution = settings.player.vibrato.noteSlightLength / 4;
        generator.generate();
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note1: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const note2: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0];
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 96),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 96),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 6, 4),
            new FlatTempoEvent(0, 120),

            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note1.realValue, 8192), // no bend
            new FlatNoteEvent(
                0,
                0,
                info.secondaryChannel,
                2880,
                note1.realValue,
                MidiUtils.dynamicToVelocity(note1.dynamics)
            ),

            // tied note (with bend)
            new FlatNoteBendEvent(1920, 0, info.secondaryChannel, note1.realValue, 8192), // reset to start
            new FlatNoteBendEvent(1920, 0, info.secondaryChannel, note1.realValue, 8192), // begin bend
            new FlatNoteBendEvent(1927, 0, info.secondaryChannel, note1.realValue, 8277),
            new FlatNoteBendEvent(1934, 0, info.secondaryChannel, note1.realValue, 8363),
            new FlatNoteBendEvent(1942, 0, info.secondaryChannel, note1.realValue, 8448),
            new FlatNoteBendEvent(1949, 0, info.secondaryChannel, note1.realValue, 8533),
            new FlatNoteBendEvent(1957, 0, info.secondaryChannel, note1.realValue, 8619),
            new FlatNoteBendEvent(1964, 0, info.secondaryChannel, note1.realValue, 8704),
            new FlatNoteBendEvent(1972, 0, info.secondaryChannel, note1.realValue, 8789),
            new FlatNoteBendEvent(1979, 0, info.secondaryChannel, note1.realValue, 8875),
            new FlatNoteBendEvent(1987, 0, info.secondaryChannel, note1.realValue, 8960), // end

            new FlatNoteBendEvent(1987, 0, info.secondaryChannel, note1.realValue, 8960), // begin hold
            new FlatNoteBendEvent(2112, 0, info.secondaryChannel, note1.realValue, 8960), // end hold

            new FlatNoteBendEvent(2112, 0, info.secondaryChannel, note1.realValue, 8960), // begin release
            new FlatNoteBendEvent(2120, 0, info.secondaryChannel, note1.realValue, 8875), //
            new FlatNoteBendEvent(2129, 0, info.secondaryChannel, note1.realValue, 8789), //
            new FlatNoteBendEvent(2137, 0, info.secondaryChannel, note1.realValue, 8704), //
            new FlatNoteBendEvent(2146, 0, info.secondaryChannel, note1.realValue, 8619), //
            new FlatNoteBendEvent(2154, 0, info.secondaryChannel, note1.realValue, 8533), //
            new FlatNoteBendEvent(2163, 0, info.secondaryChannel, note1.realValue, 8448), //
            new FlatNoteBendEvent(2171, 0, info.secondaryChannel, note1.realValue, 8363), //
            new FlatNoteBendEvent(2180, 0, info.secondaryChannel, note1.realValue, 8277), //
            new FlatNoteBendEvent(2188, 0, info.secondaryChannel, note1.realValue, 8192), // end release

            // last note
            new FlatNoteBendEvent(2880, 0, info.primaryChannel, note2.realValue, 8192),
            new FlatNoteEvent(
                2880,
                0,
                info.primaryChannel,
                1920,
                note2.realValue,
                MidiUtils.dynamicToVelocity(note2.dynamics, -1) // -1 on velocity because of pull-off
            ),

            // end of track
            new FlatTrackEndEvent(5760, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('bend-tied-vibrato', () => {
        const tex: string = '3.3{b (0 4)}.4 -.3{v}.4';
        const score: Score = parseTex(tex);

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const settings = new Settings();
        settings.player.vibrato.noteSlightLength = MidiUtils.QuarterTime / 2; // to reduce the number of vibrato events
        const generator: MidiFileGenerator = new MidiFileGenerator(score, settings, handler);
        generator.vibratoResolution = settings.player.vibrato.noteSlightLength / 4;
        generator.generate();
        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note1: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            // bend only takes first quarter note until tied note
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note1.realValue, 8192), // no bend
            new FlatNoteBendEvent(0, 0, info.secondaryChannel, note1.realValue, 8192),
            new FlatNoteBendEvent(80, 0, info.secondaryChannel, note1.realValue, 8277),
            new FlatNoteBendEvent(160, 0, info.secondaryChannel, note1.realValue, 8363),
            new FlatNoteBendEvent(240, 0, info.secondaryChannel, note1.realValue, 8448),
            new FlatNoteBendEvent(320, 0, info.secondaryChannel, note1.realValue, 8533),
            new FlatNoteBendEvent(400, 0, info.secondaryChannel, note1.realValue, 8619),
            new FlatNoteBendEvent(480, 0, info.secondaryChannel, note1.realValue, 8704),
            new FlatNoteBendEvent(560, 0, info.secondaryChannel, note1.realValue, 8789),
            new FlatNoteBendEvent(640, 0, info.secondaryChannel, note1.realValue, 8875),
            new FlatNoteBendEvent(720, 0, info.secondaryChannel, note1.realValue, 8960),
            new FlatNoteBendEvent(800, 0, info.secondaryChannel, note1.realValue, 9045),
            new FlatNoteBendEvent(880, 0, info.secondaryChannel, note1.realValue, 9131),
            new FlatNoteBendEvent(960, 0, info.secondaryChannel, note1.realValue, 9216),
            new FlatNoteEvent(
                0,
                0,
                info.secondaryChannel,
                1920,
                note1.realValue,
                MidiUtils.dynamicToVelocity(note1.dynamics)
            ),

            // vibrato starts on tied note on height of the bend-end
            new FlatNoteBendEvent(960, 0, info.secondaryChannel, note1.realValue, 9216),
            new FlatNoteBendEvent(1080, 0, info.secondaryChannel, note1.realValue, 9344),
            new FlatNoteBendEvent(1200, 0, info.secondaryChannel, note1.realValue, 9216),
            new FlatNoteBendEvent(1320, 0, info.secondaryChannel, note1.realValue, 9088),
            new FlatNoteBendEvent(1440, 0, info.secondaryChannel, note1.realValue, 9216),
            new FlatNoteBendEvent(1560, 0, info.secondaryChannel, note1.realValue, 9344),
            new FlatNoteBendEvent(1680, 0, info.secondaryChannel, note1.realValue, 9216),
            new FlatNoteBendEvent(1800, 0, info.secondaryChannel, note1.realValue, 9088),
            new FlatNoteBendEvent(1920, 0, info.secondaryChannel, note1.realValue, 9216),

            // end of track
            new FlatTrackEndEvent(3840, 0) // 3840 = end of bar
        ];

        assertEvents(handler.midiEvents, expectedEvents);
    });

    it('full-bar-rest', () => {
        const tex: string = '\\ts 3 4 3.3.4 3.3.4 3.3.4 | r.1 | 3.3.4 3.3.4 3.3.4';
        const score: Score = parseTex(tex);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].isFullBarRest).to.be.true;

        const expectedNoteOnTimes: number[] = [
            0 * MidiUtils.QuarterTime, // note 1
            1 * MidiUtils.QuarterTime, // note 2
            2 * MidiUtils.QuarterTime, // note 3
            3 * MidiUtils.QuarterTime, // 3/4 rest
            6 * MidiUtils.QuarterTime, // note 4
            7 * MidiUtils.QuarterTime, // note 5
            8 * MidiUtils.QuarterTime // note 6
        ];
        let noteOnTimes: number[] = [];
        let beat: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (beat != null) {
            noteOnTimes.push(beat.absolutePlaybackStart);
            beat = beat.nextBeat;
        }

        expect(noteOnTimes.join(',')).to.equal(expectedNoteOnTimes.join(','));

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        noteOnTimes = [];
        for (const evt of handler.midiEvents) {
            if (evt instanceof FlatNoteEvent) {
                noteOnTimes.push(evt.tick);
            } else if (evt instanceof FlatRestEvent) {
                noteOnTimes.push(evt.tick);
            }
        }
        expect(noteOnTimes.join(',')).to.equal(expectedNoteOnTimes.join(','));
    });

    it('time-signature', () => {
        const tex: string = '\\ts 3 4 3.3.4 3.3.4 3.3.4';
        const score: Score = parseTex(tex);

        const file = new MidiFile();
        const handler: AlphaSynthMidiFileHandler = new AlphaSynthMidiFileHandler(file);
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();

        let timeSignature: MidiEvent | null = null;
        for (const evt of file.events) {
            if (evt.type === MidiEventType.TimeSignature) {
                timeSignature = evt;
                break;
            }
        }

        expect(timeSignature).to.be.ok;
        const meta: TimeSignatureEvent = timeSignature as TimeSignatureEvent;
        const timeSignatureNumerator: number = meta.numerator;
        const timeSignatureDenominator: number = Math.pow(2, meta.denominatorIndex);
        expect(timeSignatureNumerator).to.equal(3);
        expect(timeSignatureDenominator).to.equal(4);
    });

    it('first-bar-tempo', () => {
        const tex: string = '\\tempo 120 . \\tempo 60 3.3*4 | \\tempo 80 3.3*4';
        const score: Score = parseTex(tex);

        expect(score.tempo).to.be.equal(120);
        expect(score.masterBars[0].tempoAutomations).to.have.length(1);
        expect(score.masterBars[0].tempoAutomations[0]!.value).to.be.equal(60);

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();

        const tempoChanges: FlatTempoEvent[] = [];
        for (const evt of handler.midiEvents) {
            if (evt instanceof FlatTempoEvent) {
                tempoChanges.push(evt as FlatTempoEvent);
            }
        }

        expect(tempoChanges.map(t => t.tick).join(',')).to.be.equal('0,3840');
        expect(tempoChanges.map(t => t.tempo).join(',')).to.be.equal('60,80');
    });

    it('has-valid-dynamics', () => {
        const tex: string = ':2 1.1{dy fff ac} 1.1{dy ppp g}';
        const score: Score = parseTex(tex);

        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const note1: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const note2: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0];
        // First note has already highest dynamics which is increased due to accentuation
        expect(note1.dynamics).to.be.equal(DynamicValue.FFF);
        expect(note1.accentuated).to.be.equal(AccentuationType.Normal);

        // Second note has lowest dynamics which is decreased due to ghost note
        expect(note2.dynamics).to.be.equal(DynamicValue.PPP);
        expect(note2.isGhost).to.be.true;

        const expectedEvents: FlatMidiEvent[] = [
            // channel init
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.primaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.primaryChannel, info.program),

            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.PanCoarse, 64),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.ExpressionControllerCoarse, 127),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.RegisteredParameterCourse, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryFine, 0),
            new FlatControlChangeEvent(0, 0, info.secondaryChannel, ControllerType.DataEntryCoarse, 16),
            new FlatProgramChangeEvent(0, 0, info.secondaryChannel, info.program),

            new FlatTimeSignatureEvent(0, 4, 4),
            new FlatTempoEvent(0, 120),

            new FlatNoteBendEvent(0, 0, info.primaryChannel, note1.realValue, 8192),
            new FlatNoteEvent(
                0,
                0,
                info.primaryChannel,
                1920,
                note1.realValue,
                MidiUtils.dynamicToVelocity(note1.dynamics, 1)
            ),

            new FlatNoteBendEvent(1920, 0, info.primaryChannel, note2.realValue, 8192),
            new FlatNoteEvent(
                1920,
                0,
                info.primaryChannel,
                1920,
                note2.realValue,
                MidiUtils.dynamicToVelocity(note2.dynamics, -1)
            ),

            // end of track
            new FlatTrackEndEvent(3840, 0) // 3840 = end of bar
        ];

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        assertEvents(handler.midiEvents, expectedEvents);
    });

    function expectBeat(
        tickLookup: MidiTickLookup,
        tick: number,
        fret: number,
        tickDuration: number,
        millisDuration: number
    ) {
        const res = tickLookup.findBeat(new Set<number>([0]), tick);
        expect(res).to.be.ok;
        expect(res!.beat.notes[0].fret).to.equal(fret);
        expect(res!.tickDuration).to.equal(tickDuration);
        expect(res!.duration).to.equal(millisDuration);
    }

    it('beat-tempo-change', async () => {
        /**
         * ![image](../../test-data/visual-tests/effects-and-annotations/beat-tempo-change.png)
         */
        const buffer = await TestPlatform.loadFile(
            'test-data/visual-tests/effects-and-annotations/beat-tempo-change.gp'
        );
        const score = ScoreLoader.loadScoreFromBytes(buffer);

        // rewrite frets for easier assertions
        let fret = 0;
        for (const bars of score.tracks[0].staves[0].bars) {
            for (const b of bars.voices[0].beats) {
                b.notes[0].fret = fret++;
            }
        }

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();

        const tempoChanges: FlatTempoEvent[] = [];
        for (const evt of handler.midiEvents) {
            if (evt instanceof FlatTempoEvent) {
                tempoChanges.push(evt as FlatTempoEvent);
            }
        }

        expect(tempoChanges.map(t => t.tick).join(',')).to.be.equal('0,1920,3840,6288,7680,9120,11520,12960,15120');
        expect(tempoChanges.map(t => t.tempo).join(',')).to.be.equal('120,60,100,120,121,120,121,120,121');

        const tickLookup = generator.tickLookup;

        // two quarter notes at 120
        expectBeat(tickLookup, MidiUtils.QuarterTime * 0, 0, MidiUtils.QuarterTime, 500);
        expectBeat(tickLookup, MidiUtils.QuarterTime * 1, 1, MidiUtils.QuarterTime, 500);
        // then two quarter notes at 60
        expectBeat(tickLookup, MidiUtils.QuarterTime * 2, 2, MidiUtils.QuarterTime, 1000);
        expectBeat(tickLookup, MidiUtils.QuarterTime * 3, 3, MidiUtils.QuarterTime, 1000);

        // two quarter notes at 100
        expectBeat(tickLookup, MidiUtils.QuarterTime * 4, 4, MidiUtils.QuarterTime, 600);
        expectBeat(tickLookup, MidiUtils.QuarterTime * 5, 5, MidiUtils.QuarterTime, 600);
        // one quarter note partially at 100 then, switching to 120
        // - The beat starts at 5760
        // - The change is at ratio 0.6375, that's midi tick 6288
        // - Hence from tick 5760 to 6288 it plays with 100 BPM
        // - From tick 6288 to 6720 it plays with 120 BPM
        // - Thats 330ms + 224ms = 555ms

        const beatStart = MidiUtils.QuarterTime * 6;
        const beatEnd = MidiUtils.QuarterTime * 7;
        const tempoChangeTick =
            score.masterBars[1].start +
            score.masterBars[1].calculateDuration() * score.masterBars[1].tempoAutomations[1].ratioPosition;
        expect(tempoChangeTick - beatStart).to.equal(528);
        expect(beatEnd - tempoChangeTick).to.equal(432);

        const firstPartMillis = MidiUtils.ticksToMillis(tempoChangeTick - beatStart, 100);
        const secondPartMillis = MidiUtils.ticksToMillis(beatEnd - tempoChangeTick, 120);

        expectBeat(tickLookup, beatStart, 6, MidiUtils.QuarterTime, firstPartMillis + secondPartMillis);
    });

    it('dead-slap', () => {
        const tex: string = 'r.4 { ds } r.2 { ds } r.4 { ds }';
        const score: Score = parseTex(tex);

        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const sixtyFourth = MidiUtils.toTicks(Duration.SixtyFourth);
        const forte = MidiUtils.dynamicToVelocity(DynamicValue.F);
        const expectedEvents: FlatMidiEvent[] = [
            new FlatNoteEvent(0, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[0], forte),
            new FlatNoteEvent(0, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[1], forte),
            new FlatNoteEvent(0, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[2], forte),
            new FlatNoteEvent(0, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[3], forte),
            new FlatNoteEvent(0, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[4], forte),
            new FlatNoteEvent(0, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[5], forte),

            new FlatNoteEvent(960, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[0], forte),
            new FlatNoteEvent(960, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[1], forte),
            new FlatNoteEvent(960, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[2], forte),
            new FlatNoteEvent(960, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[3], forte),
            new FlatNoteEvent(960, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[4], forte),
            new FlatNoteEvent(960, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[5], forte),

            new FlatNoteEvent(2880, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[0], forte),
            new FlatNoteEvent(2880, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[1], forte),
            new FlatNoteEvent(2880, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[2], forte),
            new FlatNoteEvent(2880, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[3], forte),
            new FlatNoteEvent(2880, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[4], forte),
            new FlatNoteEvent(2880, 0, info.primaryChannel, sixtyFourth, score.tracks[0].staves[0].tuning[5], forte)
        ];

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        const actualNoteEvents: FlatMidiEvent[] = handler.midiEvents.filter(e => e instanceof FlatNoteEvent);

        assertEvents(actualNoteEvents, expectedEvents);
    });

    it('fade-in', () => {
        const tex: string = '3.3.4 3.3.4 { f }';
        const score: Score = parseTex(tex);

        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const expectedEvents: FlatMidiEvent[] = [
            new FlatControlChangeEvent(960, 0, info.primaryChannel, ControllerType.VolumeCoarse, 0),
            new FlatControlChangeEvent(960, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 0),

            new FlatControlChangeEvent(1080, 0, info.primaryChannel, ControllerType.VolumeCoarse, 19),
            new FlatControlChangeEvent(1080, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 19),

            new FlatControlChangeEvent(1200, 0, info.primaryChannel, ControllerType.VolumeCoarse, 38),
            new FlatControlChangeEvent(1200, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 38),

            new FlatControlChangeEvent(1320, 0, info.primaryChannel, ControllerType.VolumeCoarse, 56),
            new FlatControlChangeEvent(1320, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 56),

            new FlatControlChangeEvent(1440, 0, info.primaryChannel, ControllerType.VolumeCoarse, 75),
            new FlatControlChangeEvent(1440, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 75),

            new FlatControlChangeEvent(1560, 0, info.primaryChannel, ControllerType.VolumeCoarse, 94),
            new FlatControlChangeEvent(1560, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 94),

            new FlatControlChangeEvent(1728, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(1728, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120)
        ];

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        const actualNoteEvents: FlatMidiEvent[] = handler.midiEvents.filter(
            e =>
                e instanceof FlatControlChangeEvent &&
                (e as FlatControlChangeEvent).controller === ControllerType.VolumeCoarse &&
                e.tick >= MidiUtils.QuarterTime
        );

        assertEvents(actualNoteEvents, expectedEvents);
    });

    it('fade-out', () => {
        const tex: string = '3.3.4 3.3.4 { fo }';
        const score: Score = parseTex(tex);

        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const expectedEvents: FlatMidiEvent[] = [
            new FlatControlChangeEvent(960, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(960, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),

            new FlatControlChangeEvent(1080, 0, info.primaryChannel, ControllerType.VolumeCoarse, 101),
            new FlatControlChangeEvent(1080, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 101),

            new FlatControlChangeEvent(1200, 0, info.primaryChannel, ControllerType.VolumeCoarse, 83),
            new FlatControlChangeEvent(1200, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 83),

            new FlatControlChangeEvent(1320, 0, info.primaryChannel, ControllerType.VolumeCoarse, 64),
            new FlatControlChangeEvent(1320, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 64),

            new FlatControlChangeEvent(1440, 0, info.primaryChannel, ControllerType.VolumeCoarse, 45),
            new FlatControlChangeEvent(1440, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 45),

            new FlatControlChangeEvent(1560, 0, info.primaryChannel, ControllerType.VolumeCoarse, 26),
            new FlatControlChangeEvent(1560, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 26),

            new FlatControlChangeEvent(1728, 0, info.primaryChannel, ControllerType.VolumeCoarse, 0),
            new FlatControlChangeEvent(1728, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 0)
        ];

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        const actualNoteEvents: FlatMidiEvent[] = handler.midiEvents.filter(
            e =>
                e instanceof FlatControlChangeEvent &&
                (e as FlatControlChangeEvent).controller === ControllerType.VolumeCoarse &&
                e.tick >= MidiUtils.QuarterTime
        );

        assertEvents(actualNoteEvents, expectedEvents);
    });

    it('volume-swell', () => {
        const tex: string = '3.3.4 3.3.4 { vs }';
        const score: Score = parseTex(tex);

        const info: PlaybackInformation = score.tracks[0].playbackInfo;
        const expectedEvents: FlatMidiEvent[] = [
            // fade-in
            new FlatControlChangeEvent(960, 0, info.primaryChannel, ControllerType.VolumeCoarse, 0),
            new FlatControlChangeEvent(960, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 0),

            new FlatControlChangeEvent(1080, 0, info.primaryChannel, ControllerType.VolumeCoarse, 38),
            new FlatControlChangeEvent(1080, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 38),

            new FlatControlChangeEvent(1200, 0, info.primaryChannel, ControllerType.VolumeCoarse, 75),
            new FlatControlChangeEvent(1200, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 75),

            new FlatControlChangeEvent(1344, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(1344, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),

            // fade-out
            new FlatControlChangeEvent(1440, 0, info.primaryChannel, ControllerType.VolumeCoarse, 120),
            new FlatControlChangeEvent(1440, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 120),

            new FlatControlChangeEvent(1560, 0, info.primaryChannel, ControllerType.VolumeCoarse, 83),
            new FlatControlChangeEvent(1560, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 83),

            new FlatControlChangeEvent(1680, 0, info.primaryChannel, ControllerType.VolumeCoarse, 45),
            new FlatControlChangeEvent(1680, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 45),

            new FlatControlChangeEvent(1824, 0, info.primaryChannel, ControllerType.VolumeCoarse, 0),
            new FlatControlChangeEvent(1824, 0, info.secondaryChannel, ControllerType.VolumeCoarse, 0)
        ];

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        const actualNoteEvents: FlatMidiEvent[] = handler.midiEvents.filter(
            e =>
                e instanceof FlatControlChangeEvent &&
                (e as FlatControlChangeEvent).controller === ControllerType.VolumeCoarse &&
                e.tick >= MidiUtils.QuarterTime
        );

        assertEvents(actualNoteEvents, expectedEvents);
    });

    it('ornaments', async () => {
        const buffer = await TestPlatform.loadFile('test-data/audio/ornaments.gp');
        const score = ScoreLoader.loadScoreFromBytes(buffer);

        const note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const noteKey = note.realValue;
        const noteVelocity = MidiUtils.dynamicToVelocity(note.dynamics, -1);
        const expectedEvents: FlatMidiEvent[] = [
            // Upper Mordent (shortened)
            new FlatNoteEvent(0, 0, 0, 60, noteKey, noteVelocity),
            new FlatNoteEvent(60, 0, 0, 60, noteKey + 2, noteVelocity),
            new FlatNoteEvent(120, 0, 0, 360, noteKey, noteVelocity),

            // Upper Mordent (quarter)
            new FlatNoteEvent(3840, 0, 0, 120, noteKey, noteVelocity),
            new FlatNoteEvent(3960, 0, 0, 120, noteKey + 2, noteVelocity),
            new FlatNoteEvent(4080, 0, 0, 720, noteKey, noteVelocity),

            // Upper Mordent (longer)
            new FlatNoteEvent(7680, 0, 0, 120, noteKey, noteVelocity),
            new FlatNoteEvent(7800, 0, 0, 120, noteKey + 2, noteVelocity),
            new FlatNoteEvent(7920, 0, 0, 1680, noteKey, noteVelocity),

            // Lower Mordent (shortened)
            new FlatNoteEvent(11520, 0, 0, 60, noteKey, noteVelocity),
            new FlatNoteEvent(11580, 0, 0, 60, noteKey - 1, noteVelocity),
            new FlatNoteEvent(11640, 0, 0, 360, noteKey, noteVelocity),

            // Lower Mordent (quarter)
            new FlatNoteEvent(15360, 0, 0, 120, noteKey, noteVelocity),
            new FlatNoteEvent(15480, 0, 0, 120, noteKey - 1, noteVelocity),
            new FlatNoteEvent(15600, 0, 0, 720, noteKey, noteVelocity),

            // Lower Mordent (longer)
            new FlatNoteEvent(19200, 0, 0, 120, noteKey, noteVelocity),
            new FlatNoteEvent(19320, 0, 0, 120, noteKey - 1, noteVelocity),
            new FlatNoteEvent(19440, 0, 0, 1680, noteKey, noteVelocity),

            // Turn (shortened)
            new FlatNoteEvent(23040, 0, 0, 40, noteKey - 1, noteVelocity),
            new FlatNoteEvent(23080, 0, 0, 40, noteKey, noteVelocity),
            new FlatNoteEvent(23120, 0, 0, 40, noteKey + 2, noteVelocity),
            new FlatNoteEvent(23160, 0, 0, 360, noteKey, noteVelocity),

            // Turn (quarter)
            new FlatNoteEvent(26880, 0, 0, 80, noteKey - 1, noteVelocity),
            new FlatNoteEvent(26960, 0, 0, 80, noteKey, noteVelocity),
            new FlatNoteEvent(27040, 0, 0, 80, noteKey + 2, noteVelocity),
            new FlatNoteEvent(27120, 0, 0, 720, noteKey, noteVelocity),

            // Turn (longer)
            new FlatNoteEvent(30720, 0, 0, 80, noteKey - 1, noteVelocity),
            new FlatNoteEvent(30800, 0, 0, 80, noteKey, noteVelocity),
            new FlatNoteEvent(30880, 0, 0, 80, noteKey + 2, noteVelocity),
            new FlatNoteEvent(30960, 0, 0, 1680, noteKey, noteVelocity),

            // Inverted Turn (shortened)
            new FlatNoteEvent(34560, 0, 0, 40, noteKey + 2, noteVelocity),
            new FlatNoteEvent(34600, 0, 0, 40, noteKey, noteVelocity),
            new FlatNoteEvent(34640, 0, 0, 40, noteKey - 1, noteVelocity),
            new FlatNoteEvent(34680, 0, 0, 360, noteKey, noteVelocity),

            // Inverted Turn (quarter)
            new FlatNoteEvent(38400, 0, 0, 80, noteKey + 2, noteVelocity),
            new FlatNoteEvent(38480, 0, 0, 80, noteKey, noteVelocity),
            new FlatNoteEvent(38560, 0, 0, 80, noteKey - 1, noteVelocity),
            new FlatNoteEvent(38640, 0, 0, 720, noteKey, noteVelocity),

            // Inverted Turn (longer)
            new FlatNoteEvent(42240, 0, 0, 80, noteKey + 2, noteVelocity),
            new FlatNoteEvent(42320, 0, 0, 80, noteKey, noteVelocity),
            new FlatNoteEvent(42400, 0, 0, 80, noteKey - 1, noteVelocity),
            new FlatNoteEvent(42480, 0, 0, 1680, noteKey, noteVelocity)
        ];

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        const actualNoteEvents: FlatMidiEvent[] = handler.midiEvents.filter(e => e instanceof FlatNoteEvent);

        assertEvents(actualNoteEvents, expectedEvents);
    });

    it('rasgueado', async () => {
        const buffer = await TestPlatform.loadFile('test-data/audio/rasgueado.gp');
        const score = ScoreLoader.loadScoreFromBytes(buffer);

        const note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        const noteVelocity = MidiUtils.dynamicToVelocity(note.dynamics);
        const expectedEvents: FlatMidiEvent[] = [
            // ii - A string
            new FlatNoteEvent(0, 0, 0, 480, 48, noteVelocity), // down - no brush offset
            new FlatNoteEvent(600, 0, 0, 360, 48, noteVelocity), // up - with brush offset

            // ii - D string
            new FlatNoteEvent(30, 0, 0, 450, 52, noteVelocity),
            new FlatNoteEvent(570, 0, 0, 390, 52, noteVelocity),

            // ii - G string
            new FlatNoteEvent(60, 0, 0, 420, 55, noteVelocity),
            new FlatNoteEvent(540, 0, 0, 420, 55, noteVelocity),

            // ii - B string
            new FlatNoteEvent(90, 0, 0, 390, 60, noteVelocity),
            new FlatNoteEvent(510, 0, 0, 450, 60, noteVelocity),

            // ii - E string
            new FlatNoteEvent(120, 0, 0, 360, 64, noteVelocity),
            new FlatNoteEvent(480, 0, 0, 480, 64, noteVelocity),

            // pmp (anapaest) - A string
            new FlatNoteEvent(1980, 0, 0, 180, 48, noteVelocity),
            new FlatNoteEvent(2160, 0, 0, 240, 48, noteVelocity),
            new FlatNoteEvent(2400, 0, 0, 480, 48, noteVelocity),

            // pmp (anapaest) - D string
            new FlatNoteEvent(1965, 0, 0, 195, 52, noteVelocity),
            new FlatNoteEvent(2175, 0, 0, 225, 52, noteVelocity),
            new FlatNoteEvent(2430, 0, 0, 450, 52, noteVelocity),

            // pmp (anapaest) - G string
            new FlatNoteEvent(1950, 0, 0, 210, 55, noteVelocity),
            new FlatNoteEvent(2190, 0, 0, 210, 55, noteVelocity),
            new FlatNoteEvent(2460, 0, 0, 420, 55, noteVelocity),

            // pmp (anapaest) - B string
            new FlatNoteEvent(1935, 0, 0, 225, 60, noteVelocity),
            new FlatNoteEvent(2205, 0, 0, 195, 60, noteVelocity),
            new FlatNoteEvent(2490, 0, 0, 390, 60, noteVelocity),

            // pmp (anapaest) - E string
            new FlatNoteEvent(1920, 0, 0, 240, 64, noteVelocity),
            new FlatNoteEvent(2220, 0, 0, 180, 64, noteVelocity),
            new FlatNoteEvent(2520, 0, 0, 360, 64, noteVelocity)
        ];

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();
        const actualNoteEvents: FlatMidiEvent[] = handler.midiEvents.filter(e => e instanceof FlatNoteEvent);

        assertEvents(actualNoteEvents, expectedEvents);
    });

    it('beat-timer-repeats-jumps', () => {
        const score: Score = parseTex(`
            \\tempo 120
            .
                3.3.4 { timer } 3.3.4*3 |
                \\ro 3.3.4 { timer } 3.3.4*3 |
                3.3.4 { timer } 3.3.4*3 |
                \\jump fine 3.3.4 { timer } 3.3.4*3 |
                \\ae (1) 3.3.4 { timer } 3.3.4*3 |
                \\ae (2 3) \\rc 3 3.3.4 { timer } 3.3.4*3 |
                3.3.4 { timer } 3.3.4*3 |
                \\jump DaCapoAlFine 3.3.4 { timer } 3.3.4*3 |
                3.3.4 { timer } 3.3.4*3
        `);

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();

        const actualTimers: number[] = [];
        let b: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (b !== null) {
            if (b.showTimer) {
                actualTimers.push(b.timer ?? -1);
            }
            b = b.nextBeat;
        }

        const expectedTimers: number[] = [0, 2000, 4000, 6000, 8000, 16000, 26000, 28000, -1];

        expect(actualTimers.join(',')).to.equal(expectedTimers.join(','));
    });

    it('beat-timer-tempo-changes', () => {
        const score: Score = parseTex(`
            \\tempo 120
            .
                3.3.4 { timer }
                3.3.8 { timer }
                3.3.8 { timer }
                3.3.4 { timer }
                3.3.4 { timer } |
                
                3.3.4 { timer tempo 60 }
                3.3.8 { timer }
                3.3.8 { timer tempo 240 }
                3.3.4 { timer }
                3.3.4 { timer }
        `);

        // no timers at start
        let b: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (b !== null) {
            expect(b.showTimer).to.be.true;
            expect(b.timer).to.equal(null);
            b = b.nextBeat;
        }

        // generate audio
        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();

        const actualTimers: number[] = [];
        b = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        while (b !== null) {
            actualTimers.push(b.timer ?? -1);
            b = b.nextBeat;
        }

        const expectedTimers: number[] = [
            // first bar
            0, 500, 750, 1000, 1500,
            // second bar
            2000, 3000, 3500, 3625, 3875
        ];

        expect(actualTimers.join(',')).to.equal(expectedTimers.join(','));
    });

    it('transpose', () => {
        const score = parseTex(`
            \\track \\staff \\instrument piano 
                    C4.4| r.1
            \\track \\staff \\instrument piano 
                \\displayTranspose 12
                    r.1 | C4.4 | r.1
            \\track \\staff \\instrument piano
                \\transpose 12
                    r.1 | r.1 | C4.4
        `);
        expect(score.tracks[0].staves[0].displayTranspositionPitch).to.equal(0);
        expect(score.tracks[0].staves[0].transpositionPitch).to.equal(0);

        expect(score.tracks[1].staves[0].displayTranspositionPitch).to.equal(-12);
        expect(score.tracks[1].staves[0].transpositionPitch).to.equal(0);

        expect(score.tracks[2].staves[0].displayTranspositionPitch).to.equal(0);
        expect(score.tracks[2].staves[0].transpositionPitch).to.equal(-12);

        const handler: FlatMidiEventGenerator = new FlatMidiEventGenerator();
        const generator: MidiFileGenerator = new MidiFileGenerator(score, null, handler);
        generator.generate();

        expect(generator.transpositionPitches.has(0)).to.be.true;
        expect(generator.transpositionPitches.get(0)!).to.equal(0);

        expect(generator.transpositionPitches.has(1)).to.be.true;
        expect(generator.transpositionPitches.get(1)!).to.equal(0);

        expect(generator.transpositionPitches.has(2)).to.be.true;
        expect(generator.transpositionPitches.get(2)!).to.equal(0);

        expect(generator.transpositionPitches.has(3)).to.be.true;
        expect(generator.transpositionPitches.get(3)!).to.equal(0);

        expect(generator.transpositionPitches.has(4)).to.be.true;
        expect(generator.transpositionPitches.get(4)!).to.equal(12);

        expect(generator.transpositionPitches.has(5)).to.be.true;
        expect(generator.transpositionPitches.get(5)!).to.equal(12);
    });
});
