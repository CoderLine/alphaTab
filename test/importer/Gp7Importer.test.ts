import { MidiUtils } from '@src/midi/MidiUtils';
import { Gp7Importer } from '@src/importer/Gp7Importer';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { Beat } from '@src/model/Beat';
import { BendType } from '@src/model/BendType';
import { FermataType } from '@src/model/Fermata';
import { GraceType } from '@src/model/GraceType';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { Ottavia } from '@src/model/Ottavia';
import { Score } from '@src/model/Score';
import { SimileMark } from '@src/model/SimileMark';
import { SlideOutType } from '@src/model/SlideOutType';
import { VibratoType } from '@src/model/VibratoType';
import { WhammyType } from '@src/model/WhammyType';
import { Settings } from '@src/Settings';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';
import { TestPlatform } from '@test/TestPlatform';
import { AutomationType } from '@src/model/Automation';

describe('Gp7ImporterTest', () => {
    const prepareGp7ImporterWithFile:(name:string) => Promise<Gp7Importer> = async (name: string): Promise<Gp7Importer> => {
        const data = await TestPlatform.loadFile('test-data/' + name);
        return prepareGp7ImporterWithBytes(data);
    };

    const prepareGp7ImporterWithBytes: (buffer: Uint8Array) => Gp7Importer = (buffer: Uint8Array): Gp7Importer => {
        let readerBase: Gp7Importer = new Gp7Importer();
        readerBase.init(ByteBuffer.fromBuffer(buffer), new Settings());
        return readerBase;
    };

    it('score-info', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/score-info.gp');
        let score: Score = reader.readScore();
        expect(score.title).toEqual('Title');
        expect(score.subTitle).toEqual('Subtitle');
        expect(score.artist).toEqual('Artist');
        expect(score.album).toEqual('Album');
        expect(score.words).toEqual('Words');
        expect(score.music).toEqual('Music');
        expect(score.copyright).toEqual('Copyright');
        expect(score.tab).toEqual('Tab');
        expect(score.instructions).toEqual('Instructions');
        expect(score.notices).toEqual('Notice1\nNotice2');
        expect(score.masterBars.length).toEqual(5);
        expect(score.tracks.length).toEqual(2);
        expect(score.tracks[0].name).toEqual('Track 1');
        expect(score.tracks[1].name).toEqual('Track 2');
    });

    it('notes', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/notes.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkNotes(score);
    });

    it('time-signatures', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/time-signatures.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTimeSignatures(score);
    });

    it('dead', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/dead.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkDead(score);
    });

    it('grace', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/grace.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkGrace(score);
    });

    it('accentuations', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/accentuations.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkAccentuations(score, true);
    });

    it('harmonics', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/harmonics.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkHarmonics(score);
    });

    it('hammer', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/hammer.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkHammer(score);
    });

    it('bend', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/bends.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendType).toEqual(BendType.Bend);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints.length).toEqual(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints[0].offset).toEqual(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints[0].value).toEqual(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints[1].offset).toEqual(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints[1].value).toEqual(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendType).toEqual(BendType.Bend);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints.length).toEqual(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[0].offset).toEqual(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[0].value).toEqual(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[1].offset).toEqual(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints[1].value).toEqual(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendType).toEqual(BendType.BendRelease);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints.length).toEqual(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints[0].offset).toEqual(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints[0].value).toEqual(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints[1].offset).toEqual(30);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints[1].value).toEqual(12);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints[2].offset).toEqual(30);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints[2].value).toEqual(12);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints[3].offset).toEqual(60);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints[3].value).toEqual(6);
    });

    it('bends-advanced', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/bends-advanced.gp');
        let score: Score = reader.readScore();

        // Simple Standalone Bends

        // // Bar 1
        let note: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(4);

        note = score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0];
        expect(note.bendType).toEqual(BendType.BendRelease);
        expect(note.bendPoints.length).toEqual(4);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(10.2);
        expect(note.bendPoints[1].value).toEqual(4);
        expect(note.bendPoints[2].offset).toBeCloseTo(20.4);
        expect(note.bendPoints[2].value).toEqual(4);
        expect(note.bendPoints[3].offset).toBeCloseTo(30);
        expect(note.bendPoints[3].value).toEqual(0);

        // // Bar 2
        note = score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0];
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(59.4);
        expect(note.bendPoints[1].value).toEqual(4);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0];
        expect(note.bendType).toEqual(BendType.BendRelease);
        expect(note.bendPoints.length).toEqual(4);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(10.2);
        expect(note.bendPoints[1].value).toEqual(4);
        expect(note.bendPoints[2].offset).toBeCloseTo(45.6);
        expect(note.bendPoints[2].value).toEqual(4);
        expect(note.bendPoints[3].offset).toBeCloseTo(59.4);
        expect(note.bendPoints[3].value).toEqual(0);

        // // Bar 3
        note = score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0];
        expect(note.bendType).toEqual(BendType.Prebend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(4);
        expect(note.bendPoints[1].offset).toBeCloseTo(60);
        expect(note.bendPoints[1].value).toEqual(4);

        note = score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0];
        expect(note.bendType).toEqual(BendType.PrebendBend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(4);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(6);

        // // Bar 4
        note = score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0];
        expect(note.bendType).toEqual(BendType.PrebendRelease);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(4);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(0);

        // // Bar 5
        note = score.tracks[0].staves[0].bars[4].voices[0].beats[0].notes[0];
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(14.4);
        expect(note.bendPoints[1].value).toEqual(8);

        note = score.tracks[0].staves[0].bars[4].voices[0].beats[1].notes[0];
        expect(note.bendType).toEqual(BendType.BendRelease);
        expect(note.bendPoints.length).toEqual(4);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(9);
        expect(note.bendPoints[1].value).toEqual(8);
        expect(note.bendPoints[2].offset).toBeCloseTo(20.4);
        expect(note.bendPoints[2].value).toEqual(8);
        expect(note.bendPoints[3].offset).toBeCloseTo(31.2);
        expect(note.bendPoints[3].value).toEqual(4);

        // // Bar 6
        note = score.tracks[0].staves[0].bars[5].voices[0].beats[0].notes[0];
        expect(note.bendType).toEqual(BendType.Prebend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(8);
        expect(note.bendPoints[1].offset).toBeCloseTo(60);
        expect(note.bendPoints[1].value).toEqual(8);

        note = score.tracks[0].staves[0].bars[5].voices[0].beats[1].notes[0];
        expect(note.bendType).toEqual(BendType.PrebendBend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(8);
        expect(note.bendPoints[1].offset).toBeCloseTo(16.2);
        expect(note.bendPoints[1].value).toEqual(12);

        // // Bar 7
        note = score.tracks[0].staves[0].bars[6].voices[0].beats[0].notes[0];
        expect(note.bendType).toEqual(BendType.PrebendRelease);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(8);
        expect(note.bendPoints[1].offset).toBeCloseTo(14.4);
        expect(note.bendPoints[1].value).toEqual(4);

        // // Bar 8
        note = score.tracks[0].staves[0].bars[7].voices[0].beats[0].notes[0];
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(4);

        // // Bar 9
        note = score.tracks[0].staves[0].bars[8].voices[0].beats[0].notes[0];
        expect(note.bendType).toEqual(BendType.BendRelease);
        expect(note.bendPoints.length).toEqual(4);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(10.2);
        expect(note.bendPoints[1].value).toEqual(4);
        expect(note.bendPoints[2].offset).toBeCloseTo(20.4);
        expect(note.bendPoints[2].value).toEqual(4);
        expect(note.bendPoints[3].offset).toBeCloseTo(30);
        expect(note.bendPoints[3].value).toEqual(0);
        // Combined Bends

        // // Bar 10
        note = score.tracks[0].staves[0].bars[9].voices[0].beats[0].notes[0];
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(4);

        note = score.tracks[0].staves[0].bars[9].voices[0].beats[1].notes[0];
        expect(note.bendType).toEqual(BendType.Release);
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(4);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(0);

        note = score.tracks[0].staves[0].bars[9].voices[0].beats[2].notes[0];
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.isContinuedBend).toBe(false);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(4);

        // // Bar 11
        note = score.tracks[0].staves[0].bars[10].voices[0].beats[0].notes[0];
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(4);

        note = score.tracks[0].staves[0].bars[10].voices[0].beats[1].notes[0];
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(4);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(8);

        note = score.tracks[0].staves[0].bars[10].voices[0].beats[2].notes[0];
        expect(note.bendType).toEqual(BendType.Release);
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(8);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(4);

        note = score.tracks[0].staves[0].bars[10].voices[0].beats[3].notes[0];
        expect(note.bendType).toEqual(BendType.Release);
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(4);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(0);

        // Grace Bends

        // // Bar 12
        note = score.tracks[0].staves[0].bars[11].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).toEqual(GraceType.BeforeBeat);
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(4);

        // // Bar 13
        note = score.tracks[0].staves[0].bars[12].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).toEqual(GraceType.BeforeBeat);
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(4);

        note = score.tracks[0].staves[0].bars[12].voices[0].beats[1].notes[0];
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendType).toEqual(BendType.Hold);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(4);
        expect(note.bendPoints[1].offset).toBeCloseTo(60);
        expect(note.bendPoints[1].value).toEqual(4);

        // // Bar 14
        note = score.tracks[0].staves[0].bars[13].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).toEqual(GraceType.OnBeat);
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(18);
        expect(note.bendPoints[1].value).toEqual(1);

        note = score.tracks[0].staves[0].bars[13].voices[0].beats[1].notes[0];
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendType).toEqual(BendType.Hold);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(1);
        expect(note.bendPoints[1].offset).toBeCloseTo(60);
        expect(note.bendPoints[1].value).toEqual(1);

        // // Bar 15
        note = score.tracks[0].staves[0].bars[14].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).toEqual(GraceType.BeforeBeat);
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(4);

        note = score.tracks[0].staves[0].bars[14].voices[0].beats[1].notes[0];
        expect(note.fret).toEqual(12);
        expect(note.isTieDestination).toBe(true);
        expect(note.isContinuedBend).toBe(true);
        expect(note.bendType).toEqual(BendType.Hold);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(4);
        expect(note.bendPoints[1].offset).toBeCloseTo(60);
        expect(note.bendPoints[1].value).toEqual(4);

        note = score.tracks[0].staves[0].bars[14].voices[0].beats[1].notes[1];
        expect(note.fret).toEqual(10);
        expect(note.isContinuedBend).toBe(false);
        expect(note.hasBend).toBe(false);
        expect(note.bendType).toEqual(BendType.None);
        note = score.tracks[0].staves[0].bars[15].voices[0].beats[0].notes[0];
        expect(note.fret).toEqual(10);
        expect(note.bendType).toEqual(BendType.None);

        // // Bar 16
        note = score.tracks[0].staves[0].bars[15].voices[0].beats[0].notes[1];
        expect(note.bendType).toEqual(BendType.Bend);
        expect(note.bendPoints.length).toEqual(2);
        expect(note.bendPoints[0].offset).toBeCloseTo(0);
        expect(note.bendPoints[0].value).toEqual(0);
        expect(note.bendPoints[1].offset).toBeCloseTo(15);
        expect(note.bendPoints[1].value).toEqual(4);
    });

    it('whammy-advanced', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/whammy-advanced.gp');
        let score: Score = reader.readScore();

        // Bar 1
        let beat: Beat = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        expect(beat.whammyBarType).toEqual(WhammyType.Dive);
        expect(beat.whammyBarPoints.length).toEqual(2);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(0);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(45);
        expect(beat.whammyBarPoints[1].value).toEqual(-4);

        beat = score.tracks[0].staves[0].bars[0].voices[0].beats[2];
        expect(beat.whammyBarType).toEqual(WhammyType.PrediveDive);
        expect(beat.whammyBarPoints.length).toEqual(2);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(-4);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(60);
        expect(beat.whammyBarPoints[1].value).toEqual(-16);

        // Bar 2
        beat = score.tracks[0].staves[0].bars[1].voices[0].beats[0];
        expect(beat.whammyBarType).toEqual(WhammyType.Dip);
        expect(beat.whammyBarPoints.length).toEqual(3);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(0);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(15);
        expect(beat.whammyBarPoints[1].value).toEqual(-16);
        expect(beat.whammyBarPoints[2].offset).toBeCloseTo(30);
        expect(beat.whammyBarPoints[2].value).toEqual(0);

        beat = score.tracks[0].staves[0].bars[1].voices[0].beats[2];
        expect(beat.whammyBarType).toEqual(WhammyType.Dip);
        expect(beat.whammyBarPoints.length).toEqual(4);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(0);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(14.4);
        expect(beat.whammyBarPoints[1].value).toEqual(-12);
        expect(beat.whammyBarPoints[2].offset).toBeCloseTo(31.8);
        expect(beat.whammyBarPoints[2].value).toEqual(-12);
        expect(beat.whammyBarPoints[3].offset).toBeCloseTo(53.4);
        expect(beat.whammyBarPoints[3].value).toEqual(0);

        // Bar 3
        beat = score.tracks[0].staves[0].bars[2].voices[0].beats[0];
        expect(beat.whammyBarType).toEqual(WhammyType.Dip);
        expect(beat.whammyBarPoints.length).toEqual(3);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(0);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(15);
        expect(beat.whammyBarPoints[1].value).toEqual(-16);
        expect(beat.whammyBarPoints[2].offset).toBeCloseTo(30);
        expect(beat.whammyBarPoints[2].value).toEqual(0);

        beat = score.tracks[0].staves[0].bars[2].voices[0].beats[2];
        expect(beat.whammyBarType).toEqual(WhammyType.Dip);
        expect(beat.whammyBarPoints.length).toEqual(4);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(0);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(14.4);
        expect(beat.whammyBarPoints[1].value).toEqual(-12);
        expect(beat.whammyBarPoints[2].offset).toBeCloseTo(31.8);
        expect(beat.whammyBarPoints[2].value).toEqual(-12);
        expect(beat.whammyBarPoints[3].offset).toBeCloseTo(53.4);
        expect(beat.whammyBarPoints[3].value).toEqual(0);

        // Bar 4
        beat = score.tracks[0].staves[0].bars[3].voices[0].beats[0];
        expect(beat.whammyBarType).toEqual(WhammyType.Predive);
        expect(beat.whammyBarPoints.length).toEqual(2);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(-8);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(60);
        expect(beat.whammyBarPoints[1].value).toEqual(-8);

        // Bar 5
        beat = score.tracks[0].staves[0].bars[4].voices[0].beats[0];
        expect(beat.whammyBarType).toEqual(WhammyType.PrediveDive);
        expect(beat.whammyBarPoints.length).toEqual(2);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(-4);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(30);
        expect(beat.whammyBarPoints[1].value).toEqual(0);

        // Bar 6
        beat = score.tracks[0].staves[0].bars[5].voices[0].beats[0];
        expect(beat.whammyBarType).toEqual(WhammyType.PrediveDive);
        expect(beat.whammyBarPoints.length).toEqual(2);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(-4);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(29.4);
        expect(beat.whammyBarPoints[1].value).toEqual(-12);

        beat = score.tracks[0].staves[0].bars[5].voices[0].beats[1];
        expect(beat.whammyBarType).toEqual(WhammyType.Dive);
        expect(beat.whammyBarPoints.length).toEqual(2);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(-12);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(45.6);
        expect(beat.whammyBarPoints[1].value).toEqual(0);

        // Bar 7
        beat = score.tracks[0].staves[0].bars[6].voices[0].beats[0];
        expect(beat.whammyBarType).toEqual(WhammyType.Dive);
        expect(beat.whammyBarPoints.length).toEqual(2);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(0);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(45);
        expect(beat.whammyBarPoints[1].value).toEqual(-4);

        beat = score.tracks[0].staves[0].bars[6].voices[0].beats[1];
        expect(beat.whammyBarType).toEqual(WhammyType.Hold);
        expect(beat.whammyBarPoints.length).toEqual(2);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(-4);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(60);
        expect(beat.whammyBarPoints[1].value).toEqual(-4);

        // Bar 8
        beat = score.tracks[0].staves[0].bars[7].voices[0].beats[0];
        expect(beat.whammyBarType).toEqual(WhammyType.Dive);
        expect(beat.whammyBarPoints.length).toEqual(2);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(-4);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(46.2);
        expect(beat.whammyBarPoints[1].value).toEqual(-12);

        beat = score.tracks[0].staves[0].bars[7].voices[0].beats[1];
        expect(beat.whammyBarType).toEqual(WhammyType.Dive);
        expect(beat.whammyBarPoints.length).toEqual(2);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(-12);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(44.4);
        expect(beat.whammyBarPoints[1].value).toEqual(8);

        // Bar 9
        beat = score.tracks[0].staves[0].bars[8].voices[0].beats[0];
        expect(beat.whammyBarType).toEqual(WhammyType.Dip);
        expect(beat.whammyBarPoints.length).toEqual(3);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(8);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(15);
        expect(beat.whammyBarPoints[1].value).toEqual(12);
        expect(beat.whammyBarPoints[2].offset).toBeCloseTo(30);
        expect(beat.whammyBarPoints[2].value).toEqual(0);

        beat = score.tracks[0].staves[0].bars[8].voices[0].beats[1];
        expect(beat.whammyBarType).toEqual(WhammyType.Dip);
        expect(beat.whammyBarPoints.length).toEqual(3);
        expect(beat.whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(beat.whammyBarPoints[0].value).toEqual(0);
        expect(beat.whammyBarPoints[1].offset).toBeCloseTo(15);
        expect(beat.whammyBarPoints[1].value).toEqual(-4);
        expect(beat.whammyBarPoints[2].offset).toBeCloseTo(30);
        expect(beat.whammyBarPoints[2].value).toEqual(0);
    });

    it('tremolo', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/tremolo.gp');
        let score: Score = reader.readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints.length).toEqual(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[0].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[1].offset).toBeCloseTo(30);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[1].value).toEqual(-4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[2].offset).toBeCloseTo(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints[2].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints.length).toEqual(2);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints[0].value).toEqual(-4);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints[1].offset).toBeCloseTo(60);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints[1].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints.length).toEqual(4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[0].value).toEqual(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[1].offset).toBeCloseTo(30);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[1].value).toEqual(-4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[2].offset).toBeCloseTo(30);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[2].value).toEqual(-4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[3].offset).toBeCloseTo(60);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints[3].value).toEqual(-4);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints.length).toEqual(4);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints[0].offset).toBeCloseTo(0);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints[0].value).toEqual(-4);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints[1].offset).toBeCloseTo(15);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints[1].value).toEqual(-12);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints[2].offset).toBeCloseTo(30.6);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints[2].value).toEqual(-12);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints[3].offset).toBeCloseTo(45);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints[3].value).toEqual(0);
    });

    it('slides', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/slides.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkSlides(score);
    });

    it('vibrato', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/vibrato.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkVibrato(score, true);
    });

    it('trills', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/trills.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTrills(score);
    });

    it('other-effects', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/other-effects.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkOtherEffects(score, true);
    });

    it('fingering', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/fingering.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkFingering(score);
    });

    it('stroke', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/strokes.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkStroke(score);
    });

    it('tuplets', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/tuplets.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTuplets(score);
    });

    it('ranges', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/ranges.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkRanges(score);
    });

    it('effects', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/effects.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkEffects(score);
    });

    it('serenade', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/serenade.gp');
        reader.readScore();
        // only Check reading
    });

    it('strings', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/strings.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkStrings(score);
    });

    it('key-signatures', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/key-signatures.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkKeySignatures(score);
    });

    it('chords', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/chords.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkChords(score);
    });

    it('colors', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/colors.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkColors(score);
    });

    it('tremolo-vibrato', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/tremolo-vibrato.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].vibrato).toEqual(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].vibrato).toEqual(VibratoType.Wide);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[1].vibrato).toEqual(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].vibrato).toEqual(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].vibrato).toEqual(VibratoType.Wide);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].vibrato).toEqual(VibratoType.Wide);
    });

    it('ottavia', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/ottavia.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].clefOttava).toEqual(Ottavia._8va);
        expect(score.tracks[0].staves[0].bars[1].clefOttava).toEqual(Ottavia._8vb);
        expect(score.tracks[0].staves[0].bars[2].clefOttava).toEqual(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[3].clefOttava).toEqual(Ottavia._15mb);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].ottava).toEqual(Ottavia._8va);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[1].ottava).toEqual(Ottavia._8vb);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[2].ottava).toEqual(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[3].ottava).toEqual(Ottavia._15mb);
    });

    it('simile-mark', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/simile-mark.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].simileMark).toEqual(SimileMark.None);
        expect(score.tracks[0].staves[0].bars[1].simileMark).toEqual(SimileMark.Simple);
        expect(score.tracks[0].staves[0].bars[2].simileMark).toEqual(SimileMark.None);
        expect(score.tracks[0].staves[0].bars[3].simileMark).toEqual(SimileMark.None);
        expect(score.tracks[0].staves[0].bars[4].simileMark).toEqual(SimileMark.FirstOfDouble);
        expect(score.tracks[0].staves[0].bars[5].simileMark).toEqual(SimileMark.SecondOfDouble);
    });

    it('anacrusis', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/anacrusis.gp');
        let score: Score = reader.readScore();
        expect(score.masterBars[0].isAnacrusis).toBe(true);
        expect(score.masterBars[0].calculateDuration()).toEqual(1920);
        expect(score.masterBars[1].calculateDuration()).toEqual(3840);
    });
    
    it('left-hand-tap', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/left-hand-tap.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isLeftHandTapped).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].isLeftHandTapped).toBe(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].isLeftHandTapped).toBe(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[6].notes[0].isLeftHandTapped).toBe(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[9].notes[0].isLeftHandTapped).toBe(true);
    });

    it('fermata', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/fermata.gp');
        let score: Score = reader.readScore();
        expect(score.masterBars[0].fermata.size).toEqual(5);
        expect(score.masterBars[1].fermata.size).toEqual(5);
        expect(score.masterBars[2].fermata.size).toEqual(5); // Short
        let offsets = [
            0,
            (MidiUtils.QuarterTime * (1 / 2)) | 0,
            (MidiUtils.QuarterTime * (1 / 1)) | 0,
            (MidiUtils.QuarterTime * (2 / 1)) | 0,
            (MidiUtils.QuarterTime * (3 / 1)) | 0
        ];
        let types: FermataType[] = [FermataType.Short, FermataType.Medium, FermataType.Long];
        for (let i: number = 0; i < 3; i++) {
            let masterBar: MasterBar = score.masterBars[i];
            expect(masterBar.fermata.size).toEqual(5);
            for (let offset of offsets) {
                let fermata = masterBar.fermata.get(offset);
                expect(fermata).toBeTruthy();
                expect(fermata!.type).toEqual(types[i]);
            }
            let beats: Beat[] = score.tracks[0].staves[0].bars[i].voices[0].beats;
            for (let beat of beats) {
                let fermata = masterBar.fermata.get(beat.playbackStart);
                let beatFermata = beat.fermata;
                expect(beatFermata).toBeTruthy();
                expect(fermata).toBeTruthy();
                expect(beatFermata!.type).toEqual(types[i]);
                expect(fermata!.type).toEqual(types[i]);
            }
        }
    });

    it('pick-slide', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/pick-slide.gp');
        let score: Score = reader.readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).toEqual(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).toEqual(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).toEqual(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].fret).toEqual(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].fret).toEqual(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].fret).toEqual(10);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].fret).toEqual(10);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].fret).toEqual(5);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].fret).toEqual(20);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0].fret).toEqual(12);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].notes[0].fret).toEqual(5);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].fret).toEqual(0);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0].fret).toEqual(20);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].notes[0].fret).toEqual(12);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].notes[0].fret).toEqual(5);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[3].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[3].notes[0].fret).toEqual(10);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].notes[0].slideOutType).toEqual(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].notes[0].fret).toEqual(20);
    });

    it('beat-lyrics', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/beat-lyrics.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].lyrics![0]).toBe("This");
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].lyrics![0]).toBe("is");
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].lyrics![0]).toBe("a");
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].lyrics![0]).toBe("test file");
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].lyrics![0]).toBe("for");
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].lyrics![0]).toBe("lyrics");
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].lyrics).toBe(null);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].lyrics).toBe(null);
    });

    it('track-volume', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/track-volume.gp');
        let score: Score = reader.readScore();

        expect(score.tracks[0].playbackInfo.volume).toBe(16);
        expect(score.tracks[1].playbackInfo.volume).toBe(14);
        expect(score.tracks[2].playbackInfo.volume).toBe(12);
        expect(score.tracks[3].playbackInfo.volume).toBe(10);
        expect(score.tracks[4].playbackInfo.volume).toBe(7);
        expect(score.tracks[5].playbackInfo.volume).toBe(3);
        expect(score.tracks[6].playbackInfo.volume).toBe(0);
    });

    it('track-balance', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/track-balance.gp');
        let score: Score = reader.readScore();

        expect(score.tracks[0].playbackInfo.balance).toBe(0);
        expect(score.tracks[1].playbackInfo.balance).toBe(4);
        expect(score.tracks[2].playbackInfo.balance).toBe(8);
        expect(score.tracks[3].playbackInfo.balance).toBe(12);
        expect(score.tracks[4].playbackInfo.balance).toBe(16);
    });
    
    it('program-change', async () => {
        const reader = await prepareGp7ImporterWithFile('guitarpro7/program-change.gp');
        let score: Score = reader.readScore();

        expect(score.tracks[0].playbackInfo.program).toBe(25);
        const automation = score.tracks[0].staves[0].bars[2].voices[0].beats[0].getAutomation(AutomationType.Instrument);
        expect(automation).toBeTruthy();
        if(automation) {
            expect(automation.value).toBe(29);
        }
    });
});
