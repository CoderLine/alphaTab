import { describe, expect, it } from 'vitest';
import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import { Gp7To8Importer } from '@coderline/alphatab/importer/Gp7To8Importer';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { type Beat, BeatBeamingMode } from '@coderline/alphatab/model/Beat';
import { BendType } from '@coderline/alphatab/model/BendType';
import { FermataType } from '@coderline/alphatab/model/Fermata';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import type { Note } from '@coderline/alphatab/model/Note';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import type { Score } from '@coderline/alphatab/model/Score';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import { WhammyType } from '@coderline/alphatab/model/WhammyType';
import { Settings } from '@coderline/alphatab/Settings';
import { GpImporterTestHelper } from 'test/importer/GpImporterTestHelper';
import { TestPlatform } from 'test/TestPlatform';
import { AutomationType } from '@coderline/alphatab/model/Automation';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

describe('Gp7ImporterTest', () => {
    async function prepareImporterWithFile(name: string): Promise<Gp7To8Importer> {
        const data = await TestPlatform.loadFile(`test-data/${name}`);
        return prepareImporterWithBytes(data);
    }

    function prepareImporterWithBytes(buffer: Uint8Array) {
        const readerBase: Gp7To8Importer = new Gp7To8Importer();
        readerBase.init(ByteBuffer.fromBuffer(buffer), new Settings());
        return readerBase;
    }

    it('score-info', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/score-info.gp');
        const score: Score = reader.readScore();
        expect(score.title).toBe('Title');
        expect(score.subTitle).toBe('Subtitle');
        expect(score.artist).toBe('Artist');
        expect(score.album).toBe('Album');
        expect(score.words).toBe('Words');
        expect(score.music).toBe('Music');
        expect(score.copyright).toBe('Copyright');
        expect(score.tab).toBe('Tab');
        expect(score.instructions).toBe('Instructions');
        expect(score.notices).toBe('Notice1\nNotice2');
        expect(score.masterBars.length).toBe(5);
        expect(score.tracks.length).toBe(2);
        expect(score.tracks[0].name).toBe('Track 1');
        expect(score.tracks[1].name).toBe('Track 2');
    });

    it('notes', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/notes.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkNotes(score);
    });

    it('time-signatures', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/time-signatures.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTimeSignatures(score);
    });

    it('dead', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/dead.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkDead(score);
    });

    it('grace', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/grace.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkGrace(score);
    });

    it('accentuations', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/accentuations.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkAccentuations(score, true);
    });

    it('harmonics', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/harmonics.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkHarmonics(score);
    });

    it('hammer', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/hammer.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkHammer(score);
    });

    it('bend', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/bends.gp');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendType).toBe(BendType.Bend);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints!.length).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![0].offset).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![0].value).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![1].offset).toBe(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![1].value).toBe(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendType).toBe(BendType.Bend);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints!.length).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![0].offset).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![0].value).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![1].offset).toBe(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![1].value).toBe(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendType).toBe(BendType.BendRelease);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints!.length).toBe(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![0].offset).toBe(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![0].value).toBe(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![1].offset).toBe(30);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![1].value).toBe(12);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![2].offset).toBe(30);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![2].value).toBe(12);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![3].offset).toBe(60);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![3].value).toBe(6);
    });

    it('bends-advanced', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/bends-advanced.gp');
        const score: Score = reader.readScore();

        // Simple Standalone Bends

        // // Bar 1
        let note: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(4);

        note = score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0];
        expect(note.bendType).toBe(BendType.BendRelease);
        expect(note.bendPoints!.length).toBe(4);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(10.2, 3);
        expect(note.bendPoints![1].value).toBe(4);
        expect(note.bendPoints![2].offset).toBeCloseTo(20.4, 3);
        expect(note.bendPoints![2].value).toBe(4);
        expect(note.bendPoints![3].offset).toBeCloseTo(30, 3);
        expect(note.bendPoints![3].value).toBe(0);

        // // Bar 2
        note = score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(59.4, 3);
        expect(note.bendPoints![1].value).toBe(4);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0];
        expect(note.bendType).toBe(BendType.BendRelease);
        expect(note.bendPoints!.length).toBe(4);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(10.2, 3);
        expect(note.bendPoints![1].value).toBe(4);
        expect(note.bendPoints![2].offset).toBeCloseTo(45.6, 3);
        expect(note.bendPoints![2].value).toBe(4);
        expect(note.bendPoints![3].offset).toBeCloseTo(59.4, 3);
        expect(note.bendPoints![3].value).toBe(0);

        // // Bar 3
        note = score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.Prebend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(4);
        expect(note.bendPoints![1].offset).toBeCloseTo(60, 3);
        expect(note.bendPoints![1].value).toBe(4);

        note = score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0];
        expect(note.bendType).toBe(BendType.PrebendBend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(4);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(6);

        // // Bar 4
        note = score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.PrebendRelease);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(4);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(0);

        // // Bar 5
        note = score.tracks[0].staves[0].bars[4].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(14.4, 3);
        expect(note.bendPoints![1].value).toBe(8);

        note = score.tracks[0].staves[0].bars[4].voices[0].beats[1].notes[0];
        expect(note.bendType).toBe(BendType.BendRelease);
        expect(note.bendPoints!.length).toBe(4);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(9, 3);
        expect(note.bendPoints![1].value).toBe(8);
        expect(note.bendPoints![2].offset).toBeCloseTo(20.4, 3);
        expect(note.bendPoints![2].value).toBe(8);
        expect(note.bendPoints![3].offset).toBeCloseTo(31.2, 3);
        expect(note.bendPoints![3].value).toBe(4);

        // // Bar 6
        note = score.tracks[0].staves[0].bars[5].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.Prebend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(8);
        expect(note.bendPoints![1].offset).toBeCloseTo(60, 3);
        expect(note.bendPoints![1].value).toBe(8);

        note = score.tracks[0].staves[0].bars[5].voices[0].beats[1].notes[0];
        expect(note.bendType).toBe(BendType.PrebendBend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(8);
        expect(note.bendPoints![1].offset).toBeCloseTo(16.2, 3);
        expect(note.bendPoints![1].value).toBe(12);

        // // Bar 7
        note = score.tracks[0].staves[0].bars[6].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.PrebendRelease);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(8);
        expect(note.bendPoints![1].offset).toBeCloseTo(14.4, 3);
        expect(note.bendPoints![1].value).toBe(4);

        // // Bar 8
        note = score.tracks[0].staves[0].bars[7].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(4);

        // // Bar 9
        note = score.tracks[0].staves[0].bars[8].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.BendRelease);
        expect(note.bendPoints!.length).toBe(4);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(10.2, 3);
        expect(note.bendPoints![1].value).toBe(4);
        expect(note.bendPoints![2].offset).toBeCloseTo(20.4, 3);
        expect(note.bendPoints![2].value).toBe(4);
        expect(note.bendPoints![3].offset).toBeCloseTo(30, 3);
        expect(note.bendPoints![3].value).toBe(0);
        // Combined Bends

        // // Bar 10
        note = score.tracks[0].staves[0].bars[9].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(4);

        note = score.tracks[0].staves[0].bars[9].voices[0].beats[1].notes[0];
        expect(note.bendType).toBe(BendType.Release);
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(4);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(0);

        note = score.tracks[0].staves[0].bars[9].voices[0].beats[2].notes[0];
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.isContinuedBend).toBe(false);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(4);

        // // Bar 11
        note = score.tracks[0].staves[0].bars[10].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(4);

        note = score.tracks[0].staves[0].bars[10].voices[0].beats[1].notes[0];
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(4);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(8);

        note = score.tracks[0].staves[0].bars[10].voices[0].beats[2].notes[0];
        expect(note.bendType).toBe(BendType.Release);
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(8);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(4);

        note = score.tracks[0].staves[0].bars[10].voices[0].beats[3].notes[0];
        expect(note.bendType).toBe(BendType.Release);
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(4);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(0);

        // Grace Bends

        // // Bar 12
        note = score.tracks[0].staves[0].bars[11].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).toBe(GraceType.BeforeBeat);
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(4);

        // // Bar 13
        note = score.tracks[0].staves[0].bars[12].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).toBe(GraceType.BeforeBeat);
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(4);

        note = score.tracks[0].staves[0].bars[12].voices[0].beats[1].notes[0];
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendType).toBe(BendType.Hold);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(4);
        expect(note.bendPoints![1].offset).toBeCloseTo(60, 3);
        expect(note.bendPoints![1].value).toBe(4);

        // // Bar 14
        note = score.tracks[0].staves[0].bars[13].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).toBe(GraceType.OnBeat);
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(18, 3);
        expect(note.bendPoints![1].value).toBe(1);

        note = score.tracks[0].staves[0].bars[13].voices[0].beats[1].notes[0];
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendType).toBe(BendType.Hold);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(1);
        expect(note.bendPoints![1].offset).toBeCloseTo(60, 3);
        expect(note.bendPoints![1].value).toBe(1);

        // // Bar 15
        note = score.tracks[0].staves[0].bars[14].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).toBe(GraceType.BeforeBeat);
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(4);

        note = score.tracks[0].staves[0].bars[14].voices[0].beats[1].notes[0];
        expect(note.fret).toBe(12);
        expect(note.isTieDestination).toBe(true);
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendType).toBe(BendType.Hold);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(4);
        expect(note.bendPoints![1].offset).toBeCloseTo(60, 3);
        expect(note.bendPoints![1].value).toBe(4);

        note = score.tracks[0].staves[0].bars[14].voices[0].beats[1].notes[1];
        expect(note.fret).toBe(10);
        expect(note.isContinuedBend).toBe(false);
        expect(note.hasBend).toBe(false);
        expect(note.bendType).toBe(BendType.None);
        note = score.tracks[0].staves[0].bars[15].voices[0].beats[0].notes[0];
        expect(note.fret).toBe(10);
        expect(note.bendType).toBe(BendType.None);

        // // Bar 16
        note = score.tracks[0].staves[0].bars[15].voices[0].beats[0].notes[1];
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBeCloseTo(15, 3);
        expect(note.bendPoints![1].value).toBe(4);
    });

    it('whammy-advanced', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/whammy-advanced.gp');
        const score: Score = reader.readScore();

        // Bar 1
        let beat: Beat = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        expect(beat.whammyBarType).toBe(WhammyType.Dive);
        expect(beat.whammyBarPoints!.length).toBe(2);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(0);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(45, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-4);

        beat = score.tracks[0].staves[0].bars[0].voices[0].beats[2];
        expect(beat.whammyBarType).toBe(WhammyType.PrediveDive);
        expect(beat.whammyBarPoints!.length).toBe(2);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(-4);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(60, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-16);

        // Bar 2
        beat = score.tracks[0].staves[0].bars[1].voices[0].beats[0];
        expect(beat.whammyBarType).toBe(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).toBe(3);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(0);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(15, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-16);
        expect(beat.whammyBarPoints![2].offset).toBeCloseTo(30, 3);
        expect(beat.whammyBarPoints![2].value).toBe(0);

        beat = score.tracks[0].staves[0].bars[1].voices[0].beats[2];
        expect(beat.whammyBarType).toBe(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).toBe(4);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(0);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(14.4, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-12);
        expect(beat.whammyBarPoints![2].offset).toBeCloseTo(31.8, 3);
        expect(beat.whammyBarPoints![2].value).toBe(-12);
        expect(beat.whammyBarPoints![3].offset).toBeCloseTo(53.4, 3);
        expect(beat.whammyBarPoints![3].value).toBe(0);

        // Bar 3
        beat = score.tracks[0].staves[0].bars[2].voices[0].beats[0];
        expect(beat.whammyBarType).toBe(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).toBe(3);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(0);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(15, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-16);
        expect(beat.whammyBarPoints![2].offset).toBeCloseTo(30, 3);
        expect(beat.whammyBarPoints![2].value).toBe(0);

        beat = score.tracks[0].staves[0].bars[2].voices[0].beats[2];
        expect(beat.whammyBarType).toBe(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).toBe(4);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(0);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(14.4, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-12);
        expect(beat.whammyBarPoints![2].offset).toBeCloseTo(31.8, 3);
        expect(beat.whammyBarPoints![2].value).toBe(-12);
        expect(beat.whammyBarPoints![3].offset).toBeCloseTo(53.4, 3);
        expect(beat.whammyBarPoints![3].value).toBe(0);

        // Bar 4
        beat = score.tracks[0].staves[0].bars[3].voices[0].beats[0];
        expect(beat.whammyBarType).toBe(WhammyType.Predive);
        expect(beat.whammyBarPoints!.length).toBe(2);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(-8);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(60, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-8);

        // Bar 5
        beat = score.tracks[0].staves[0].bars[4].voices[0].beats[0];
        expect(beat.whammyBarType).toBe(WhammyType.PrediveDive);
        expect(beat.whammyBarPoints!.length).toBe(2);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(-4);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(30, 3);
        expect(beat.whammyBarPoints![1].value).toBe(0);

        // Bar 6
        beat = score.tracks[0].staves[0].bars[5].voices[0].beats[0];
        expect(beat.whammyBarType).toBe(WhammyType.PrediveDive);
        expect(beat.whammyBarPoints!.length).toBe(2);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(-4);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(29.4, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-12);

        beat = score.tracks[0].staves[0].bars[5].voices[0].beats[1];
        expect(beat.whammyBarType).toBe(WhammyType.Dive);
        expect(beat.whammyBarPoints!.length).toBe(2);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(-12);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(45.6, 3);
        expect(beat.whammyBarPoints![1].value).toBe(0);

        // Bar 7
        beat = score.tracks[0].staves[0].bars[6].voices[0].beats[0];
        expect(beat.whammyBarType).toBe(WhammyType.Dive);
        expect(beat.whammyBarPoints!.length).toBe(2);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(0);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(45, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-4);

        beat = score.tracks[0].staves[0].bars[6].voices[0].beats[1];
        expect(beat.whammyBarType).toBe(WhammyType.Hold);
        expect(beat.whammyBarPoints!.length).toBe(2);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(-4);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(60, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-4);

        // Bar 8
        beat = score.tracks[0].staves[0].bars[7].voices[0].beats[0];
        expect(beat.whammyBarType).toBe(WhammyType.Dive);
        expect(beat.whammyBarPoints!.length).toBe(2);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(-4);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(46.2, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-12);

        beat = score.tracks[0].staves[0].bars[7].voices[0].beats[1];
        expect(beat.whammyBarType).toBe(WhammyType.Dive);
        expect(beat.whammyBarPoints!.length).toBe(2);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(-12);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(44.4, 3);
        expect(beat.whammyBarPoints![1].value).toBe(8);

        // Bar 9
        beat = score.tracks[0].staves[0].bars[8].voices[0].beats[0];
        expect(beat.whammyBarType).toBe(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).toBe(3);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(8);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(15, 3);
        expect(beat.whammyBarPoints![1].value).toBe(12);
        expect(beat.whammyBarPoints![2].offset).toBeCloseTo(30, 3);
        expect(beat.whammyBarPoints![2].value).toBe(0);

        beat = score.tracks[0].staves[0].bars[8].voices[0].beats[1];
        expect(beat.whammyBarType).toBe(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).toBe(3);
        expect(beat.whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(beat.whammyBarPoints![0].value).toBe(0);
        expect(beat.whammyBarPoints![1].offset).toBeCloseTo(15, 3);
        expect(beat.whammyBarPoints![1].value).toBe(-4);
        expect(beat.whammyBarPoints![2].offset).toBeCloseTo(30, 3);
        expect(beat.whammyBarPoints![2].value).toBe(0);
    });

    it('tremolo', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/tremolo.gp');
        const score: Score = reader.readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints!.length).toBe(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![0].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![1].offset).toBeCloseTo(30, 3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![1].value).toBe(-4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![2].offset).toBeCloseTo(60, 3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![2].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints!.length).toBe(2);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![0].value).toBe(-4);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![1].offset).toBeCloseTo(60, 3);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![1].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints!.length).toBe(4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![0].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![1].offset).toBeCloseTo(30, 3);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![1].value).toBe(-4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![2].offset).toBeCloseTo(30, 3);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![2].value).toBe(-4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![3].offset).toBeCloseTo(60, 3);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![3].value).toBe(-4);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints!.length).toBe(4);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![0].value).toBe(-4);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![1].offset).toBeCloseTo(15, 3);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![1].value).toBe(-12);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![2].offset).toBeCloseTo(30.6, 3);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![2].value).toBe(-12);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![3].offset).toBeCloseTo(45, 3);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![3].value).toBe(0);
    });

    it('slides', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/slides.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkSlides(score);
    });

    it('vibrato', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/vibrato.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkVibrato(score, true);
    });

    it('trills', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/trills.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTrills(score);
    });

    it('other-effects', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/other-effects.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkOtherEffects(score, true);
    });

    it('fingering', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/fingering.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkFingering(score);
    });

    it('stroke', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/strokes.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkStroke(score);
    });

    it('tuplets', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/tuplets.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTuplets(score);
    });

    it('ranges', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/ranges.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkRanges(score);
    });

    it('effects', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/effects.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkEffects(score);
    });

    it('serenade', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/serenade.gp');
        reader.readScore();
        // only Check reading
    });

    it('strings', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/strings.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkStrings(score);
    });

    it('key-signatures', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/key-signatures.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkKeySignatures(score);
    });

    it('chords', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/chords.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkChords(score);
    });

    it('colors', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/colors.gp');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkColors(score);
    });

    it('tremolo-vibrato', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/tremolo-vibrato.gp');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].vibrato).toBe(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].vibrato).toBe(VibratoType.Wide);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[1].vibrato).toBe(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].vibrato).toBe(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].vibrato).toBe(VibratoType.Wide);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].vibrato).toBe(VibratoType.Wide);
    });

    it('ottavia', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/ottavia.gp');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].clefOttava).toBe(Ottavia._8va);
        expect(score.tracks[0].staves[0].bars[1].clefOttava).toBe(Ottavia._8vb);
        expect(score.tracks[0].staves[0].bars[2].clefOttava).toBe(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[3].clefOttava).toBe(Ottavia._15mb);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].ottava).toBe(Ottavia._8va);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[1].ottava).toBe(Ottavia._8vb);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[2].ottava).toBe(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[3].ottava).toBe(Ottavia._15mb);
    });

    it('simile-mark', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/simile-mark.gp');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].simileMark).toBe(SimileMark.None);
        expect(score.tracks[0].staves[0].bars[1].simileMark).toBe(SimileMark.Simple);
        expect(score.tracks[0].staves[0].bars[2].simileMark).toBe(SimileMark.None);
        expect(score.tracks[0].staves[0].bars[3].simileMark).toBe(SimileMark.None);
        expect(score.tracks[0].staves[0].bars[4].simileMark).toBe(SimileMark.FirstOfDouble);
        expect(score.tracks[0].staves[0].bars[5].simileMark).toBe(SimileMark.SecondOfDouble);
    });

    it('anacrusis', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/anacrusis.gp');
        const score: Score = reader.readScore();
        expect(score.masterBars[0].isAnacrusis).toBe(true);
        expect(score.masterBars[0].calculateDuration()).toBe(1920);
        expect(score.masterBars[1].calculateDuration()).toBe(3840);
    });

    it('left-hand-tap', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/left-hand-tap.gp');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isLeftHandTapped).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].isLeftHandTapped).toBe(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].isLeftHandTapped).toBe(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[6].notes[0].isLeftHandTapped).toBe(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[9].notes[0].isLeftHandTapped).toBe(true);
    });

    it('fermata', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/fermata.gp');
        const score: Score = reader.readScore();
        expect(score.masterBars[0].fermata!.size).toBe(5);
        expect(score.masterBars[1].fermata!.size).toBe(5);
        expect(score.masterBars[2].fermata!.size).toBe(5); // Short
        const offsets = [
            0,
            (MidiUtils.QuarterTime * (1 / 2)) | 0,
            (MidiUtils.QuarterTime * (1 / 1)) | 0,
            (MidiUtils.QuarterTime * (2 / 1)) | 0,
            (MidiUtils.QuarterTime * (3 / 1)) | 0
        ];
        const types: FermataType[] = [FermataType.Short, FermataType.Medium, FermataType.Long];
        for (let i: number = 0; i < 3; i++) {
            const masterBar: MasterBar = score.masterBars[i];
            expect(masterBar.fermata!.size).toBe(5);
            for (const offset of offsets) {
                const fermata = masterBar.fermata!.get(offset);
                expect(fermata).toBeTruthy();
                expect(fermata!.type).toBe(types[i]);
            }
            const beats: Beat[] = score.tracks[0].staves[0].bars[i].voices[0].beats;
            for (const beat of beats) {
                const fermata = masterBar.fermata!.get(beat.playbackStart);
                const beatFermata = beat.fermata;
                expect(beatFermata).toBeTruthy();
                expect(fermata).toBeTruthy();
                expect(beatFermata!.type).toBe(types[i]);
                expect(fermata!.type).toBe(types[i]);
            }
        }
    });

    it('pick-slide', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/pick-slide.gp');
        const score: Score = reader.readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toBe(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).toBe(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).toBe(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].fret).toBe(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].fret).toBe(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].fret).toBe(10);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].fret).toBe(10);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].fret).toBe(5);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].fret).toBe(20);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0].fret).toBe(12);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].notes[0].fret).toBe(5);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].fret).toBe(0);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0].fret).toBe(20);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].notes[0].fret).toBe(12);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].notes[0].fret).toBe(5);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[3].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[3].notes[0].fret).toBe(10);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].notes[0].slideOutType).toBe(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].notes[0].fret).toBe(20);
    });

    it('beat-lyrics', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/beat-lyrics.gp');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].lyrics![0]).toBe('This');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].lyrics![0]).toBe('is');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].lyrics![0]).toBe('a');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].lyrics![0]).toBe('test file');
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].lyrics![0]).toBe('for');
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].lyrics![0]).toBe('lyrics');
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].lyrics).toBe(null);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].lyrics).toBe(null);
    });

    it('track-volume', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/track-volume.gp');
        const score: Score = reader.readScore();

        expect(score.tracks[0].playbackInfo.volume).toBe(16);
        expect(score.tracks[1].playbackInfo.volume).toBe(14);
        expect(score.tracks[2].playbackInfo.volume).toBe(12);
        expect(score.tracks[3].playbackInfo.volume).toBe(10);
        expect(score.tracks[4].playbackInfo.volume).toBe(7);
        expect(score.tracks[5].playbackInfo.volume).toBe(3);
        expect(score.tracks[6].playbackInfo.volume).toBe(0);
    });

    it('track-balance', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/track-balance.gp');
        const score: Score = reader.readScore();

        expect(score.tracks[0].playbackInfo.balance).toBe(0);
        expect(score.tracks[1].playbackInfo.balance).toBe(4);
        expect(score.tracks[2].playbackInfo.balance).toBe(8);
        expect(score.tracks[3].playbackInfo.balance).toBe(12);
        expect(score.tracks[4].playbackInfo.balance).toBe(16);
    });

    it('program-change', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/program-change.gp');
        const score: Score = reader.readScore();

        expect(score.tracks[0].playbackInfo.program).toBe(25);
        const automation = score.tracks[0].staves[0].bars[2].voices[0].beats[0].getAutomation(
            AutomationType.Instrument
        );
        expect(automation).toBeTruthy();
        if (automation) {
            expect(automation.value).toBe(29);
        }
    });

    it('chord-no-diagram', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/chord-no-diagram.gp');
        const score: Score = reader.readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.name).toBe('C');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings.length).toBe(0);
    });

    it('layout-configuration', async () => {
        const track1 = (await prepareImporterWithFile('guitarpro7/layout-configuration-multi-track-1.gp')).readScore();
        const track2 = (await prepareImporterWithFile('guitarpro7/layout-configuration-multi-track-2.gp')).readScore();
        const trackAll = (
            await prepareImporterWithFile('guitarpro7/layout-configuration-multi-track-all.gp')
        ).readScore();
        const track1And3 = (
            await prepareImporterWithFile('guitarpro7/layout-configuration-multi-track-1-3.gp')
        ).readScore();

        GpImporterTestHelper.checkMultiTrackLayoutConfiguration(track1, track2, trackAll, track1And3);
    });

    it('slash', async () => {
        const score = (await prepareImporterWithFile('guitarpro7/slash.gp')).readScore();
        GpImporterTestHelper.checkSlash(score);
    });

    it('beaming-mode', async () => {
        const score = (await prepareImporterWithFile('guitarpro7/beaming-mode.gp')).readScore();

        // auto
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].preferredBeamDirection).toBe(BeamDirection.Up);

        // force
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].beamingMode).toBe(
            BeatBeamingMode.ForceMergeWithNext
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].beamingMode).toBe(
            BeatBeamingMode.ForceMergeWithNext
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].beamingMode).toBe(
            BeatBeamingMode.ForceMergeWithNext
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].preferredBeamDirection).toBe(BeamDirection.Up);

        // break
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].beamingMode).toBe(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].beamingMode).toBe(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].beamingMode).toBe(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].preferredBeamDirection).toBe(BeamDirection.Up);

        // break secondary
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].beamingMode).toBe(
            BeatBeamingMode.ForceSplitOnSecondaryToNext
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].preferredBeamDirection).toBe(BeamDirection.Up);

        // invert to down
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].preferredBeamDirection).toBe(
            BeamDirection.Down
        );

        // invert to up
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].preferredBeamDirection).toBe(BeamDirection.Up);
    });
});
