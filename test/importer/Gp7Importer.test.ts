import { MidiUtils } from '@src/midi/MidiUtils';
import { Gp7To8Importer } from '@src/importer/Gp7To8Importer';
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
import { expect } from 'chai';

describe('Gp7ImporterTest', () => {
    async function prepareImporterWithFile(name: string): Promise<Gp7To8Importer> {
        const data = await TestPlatform.loadFile('test-data/' + name);
        return prepareImporterWithBytes(data);
    }

    function prepareImporterWithBytes(buffer: Uint8Array) {
        let readerBase: Gp7To8Importer = new Gp7To8Importer();
        readerBase.init(ByteBuffer.fromBuffer(buffer), new Settings());
        return readerBase;
    }

    it('score-info', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/score-info.gp');
        let score: Score = reader.readScore();
        expect(score.title).to.equal('Title');
        expect(score.subTitle).to.equal('Subtitle');
        expect(score.artist).to.equal('Artist');
        expect(score.album).to.equal('Album');
        expect(score.words).to.equal('Words');
        expect(score.music).to.equal('Music');
        expect(score.copyright).to.equal('Copyright');
        expect(score.tab).to.equal('Tab');
        expect(score.instructions).to.equal('Instructions');
        expect(score.notices).to.equal('Notice1\nNotice2');
        expect(score.masterBars.length).to.equal(5);
        expect(score.tracks.length).to.equal(2);
        expect(score.tracks[0].name).to.equal('Track 1');
        expect(score.tracks[1].name).to.equal('Track 2');
    });

    it('notes', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/notes.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkNotes(score);
    });

    it('time-signatures', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/time-signatures.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTimeSignatures(score);
    });

    it('dead', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/dead.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkDead(score);
    });

    it('grace', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/grace.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkGrace(score);
    });

    it('accentuations', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/accentuations.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkAccentuations(score, true);
    });

    it('harmonics', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/harmonics.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkHarmonics(score);
    });

    it('hammer', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/hammer.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkHammer(score);
    });

    it('bend', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/bends.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendType).to.equal(BendType.Bend);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints!.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![0].offset).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![0].value).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![1].offset).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![1].value).to.equal(4);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendType).to.equal(BendType.Bend);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints!.length).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![0].offset).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![0].value).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![1].offset).to.equal(60);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![1].value).to.equal(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendType).to.equal(BendType.BendRelease);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints!.length).to.equal(4);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![0].offset).to.equal(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![0].value).to.equal(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![1].offset).to.equal(30);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![1].value).to.equal(12);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![2].offset).to.equal(30);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![2].value).to.equal(12);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![3].offset).to.equal(60);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![3].value).to.equal(6);
    });

    it('bends-advanced', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/bends-advanced.gp');
        let score: Score = reader.readScore();

        // Simple Standalone Bends

        // // Bar 1
        let note: Note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        note = score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0];
        expect(note.bendType).to.equal(BendType.BendRelease);
        expect(note.bendPoints!.length).to.equal(4);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(10.2, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);
        expect(note.bendPoints![2].offset).to.be.closeTo(20.4, 0.001);
        expect(note.bendPoints![2].value).to.equal(4);
        expect(note.bendPoints![3].offset).to.be.closeTo(30, 0.001);
        expect(note.bendPoints![3].value).to.equal(0);

        // // Bar 2
        note = score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(59.4, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0];
        expect(note.bendType).to.equal(BendType.BendRelease);
        expect(note.bendPoints!.length).to.equal(4);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(10.2, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);
        expect(note.bendPoints![2].offset).to.be.closeTo(45.6, 0.001);
        expect(note.bendPoints![2].value).to.equal(4);
        expect(note.bendPoints![3].offset).to.be.closeTo(59.4, 0.001);
        expect(note.bendPoints![3].value).to.equal(0);

        // // Bar 3
        note = score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.Prebend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(4);
        expect(note.bendPoints![1].offset).to.be.closeTo(60, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        note = score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0];
        expect(note.bendType).to.equal(BendType.PrebendBend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(4);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(6);

        // // Bar 4
        note = score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.PrebendRelease);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(4);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(0);

        // // Bar 5
        note = score.tracks[0].staves[0].bars[4].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(14.4, 0.001);
        expect(note.bendPoints![1].value).to.equal(8);

        note = score.tracks[0].staves[0].bars[4].voices[0].beats[1].notes[0];
        expect(note.bendType).to.equal(BendType.BendRelease);
        expect(note.bendPoints!.length).to.equal(4);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(9, 0.001);
        expect(note.bendPoints![1].value).to.equal(8);
        expect(note.bendPoints![2].offset).to.be.closeTo(20.4, 0.001);
        expect(note.bendPoints![2].value).to.equal(8);
        expect(note.bendPoints![3].offset).to.be.closeTo(31.2, 0.001);
        expect(note.bendPoints![3].value).to.equal(4);

        // // Bar 6
        note = score.tracks[0].staves[0].bars[5].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.Prebend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(8);
        expect(note.bendPoints![1].offset).to.be.closeTo(60, 0.001);
        expect(note.bendPoints![1].value).to.equal(8);

        note = score.tracks[0].staves[0].bars[5].voices[0].beats[1].notes[0];
        expect(note.bendType).to.equal(BendType.PrebendBend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(8);
        expect(note.bendPoints![1].offset).to.be.closeTo(16.2, 0.001);
        expect(note.bendPoints![1].value).to.equal(12);

        // // Bar 7
        note = score.tracks[0].staves[0].bars[6].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.PrebendRelease);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(8);
        expect(note.bendPoints![1].offset).to.be.closeTo(14.4, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        // // Bar 8
        note = score.tracks[0].staves[0].bars[7].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        // // Bar 9
        note = score.tracks[0].staves[0].bars[8].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.BendRelease);
        expect(note.bendPoints!.length).to.equal(4);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(10.2, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);
        expect(note.bendPoints![2].offset).to.be.closeTo(20.4, 0.001);
        expect(note.bendPoints![2].value).to.equal(4);
        expect(note.bendPoints![3].offset).to.be.closeTo(30, 0.001);
        expect(note.bendPoints![3].value).to.equal(0);
        // Combined Bends

        // // Bar 10
        note = score.tracks[0].staves[0].bars[9].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        note = score.tracks[0].staves[0].bars[9].voices[0].beats[1].notes[0];
        expect(note.bendType).to.equal(BendType.Release);
        expect(note.isContinuedBend).to.be.equal(true);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(4);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(0);

        note = score.tracks[0].staves[0].bars[9].voices[0].beats[2].notes[0];
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.isContinuedBend).to.be.equal(false);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        // // Bar 11
        note = score.tracks[0].staves[0].bars[10].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        note = score.tracks[0].staves[0].bars[10].voices[0].beats[1].notes[0];
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.isContinuedBend).to.be.equal(true);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(4);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(8);

        note = score.tracks[0].staves[0].bars[10].voices[0].beats[2].notes[0];
        expect(note.bendType).to.equal(BendType.Release);
        expect(note.isContinuedBend).to.be.equal(true);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(8);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        note = score.tracks[0].staves[0].bars[10].voices[0].beats[3].notes[0];
        expect(note.bendType).to.equal(BendType.Release);
        expect(note.isContinuedBend).to.be.equal(true);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(4);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(0);

        // Grace Bends

        // // Bar 12
        note = score.tracks[0].staves[0].bars[11].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).to.equal(GraceType.BeforeBeat);
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        // // Bar 13
        note = score.tracks[0].staves[0].bars[12].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).to.equal(GraceType.BeforeBeat);
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        note = score.tracks[0].staves[0].bars[12].voices[0].beats[1].notes[0];
        expect(note.isContinuedBend).to.be.equal(true);
        expect(note.bendType).to.equal(BendType.Hold);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(4);
        expect(note.bendPoints![1].offset).to.be.closeTo(60, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        // // Bar 14
        note = score.tracks[0].staves[0].bars[13].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).to.equal(GraceType.OnBeat);
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(18, 0.001);
        expect(note.bendPoints![1].value).to.equal(1);

        note = score.tracks[0].staves[0].bars[13].voices[0].beats[1].notes[0];
        expect(note.isContinuedBend).to.be.equal(true);
        expect(note.bendType).to.equal(BendType.Hold);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(1);
        expect(note.bendPoints![1].offset).to.be.closeTo(60, 0.001);
        expect(note.bendPoints![1].value).to.equal(1);

        // // Bar 15
        note = score.tracks[0].staves[0].bars[14].voices[0].beats[0].notes[0];
        expect(note.beat.graceType).to.equal(GraceType.BeforeBeat);
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        note = score.tracks[0].staves[0].bars[14].voices[0].beats[1].notes[0];
        expect(note.fret).to.equal(12);
        expect(note.isTieDestination).to.be.equal(true);
        expect(note.isContinuedBend).to.be.equal(true);
        expect(note.bendType).to.equal(BendType.Hold);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(4);
        expect(note.bendPoints![1].offset).to.be.closeTo(60, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);

        note = score.tracks[0].staves[0].bars[14].voices[0].beats[1].notes[1];
        expect(note.fret).to.equal(10);
        expect(note.isContinuedBend).to.be.equal(false);
        expect(note.hasBend).to.be.equal(false);
        expect(note.bendType).to.equal(BendType.None);
        note = score.tracks[0].staves[0].bars[15].voices[0].beats[0].notes[0];
        expect(note.fret).to.equal(10);
        expect(note.bendType).to.equal(BendType.None);

        // // Bar 16
        note = score.tracks[0].staves[0].bars[15].voices[0].beats[0].notes[1];
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(note.bendPoints![1].value).to.equal(4);
    });

    it('whammy-advanced', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/whammy-advanced.gp');
        let score: Score = reader.readScore();

        // Bar 1
        let beat: Beat = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        expect(beat.whammyBarType).to.equal(WhammyType.Dive);
        expect(beat.whammyBarPoints!.length).to.equal(2);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(0);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(45, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-4);

        beat = score.tracks[0].staves[0].bars[0].voices[0].beats[2];
        expect(beat.whammyBarType).to.equal(WhammyType.PrediveDive);
        expect(beat.whammyBarPoints!.length).to.equal(2);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(-4);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(60, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-16);

        // Bar 2
        beat = score.tracks[0].staves[0].bars[1].voices[0].beats[0];
        expect(beat.whammyBarType).to.equal(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).to.equal(3);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(0);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-16);
        expect(beat.whammyBarPoints![2].offset).to.be.closeTo(30, 0.001);
        expect(beat.whammyBarPoints![2].value).to.equal(0);

        beat = score.tracks[0].staves[0].bars[1].voices[0].beats[2];
        expect(beat.whammyBarType).to.equal(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).to.equal(4);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(0);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(14.4, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-12);
        expect(beat.whammyBarPoints![2].offset).to.be.closeTo(31.8, 0.001);
        expect(beat.whammyBarPoints![2].value).to.equal(-12);
        expect(beat.whammyBarPoints![3].offset).to.be.closeTo(53.4, 0.001);
        expect(beat.whammyBarPoints![3].value).to.equal(0);

        // Bar 3
        beat = score.tracks[0].staves[0].bars[2].voices[0].beats[0];
        expect(beat.whammyBarType).to.equal(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).to.equal(3);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(0);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-16);
        expect(beat.whammyBarPoints![2].offset).to.be.closeTo(30, 0.001);
        expect(beat.whammyBarPoints![2].value).to.equal(0);

        beat = score.tracks[0].staves[0].bars[2].voices[0].beats[2];
        expect(beat.whammyBarType).to.equal(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).to.equal(4);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(0);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(14.4, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-12);
        expect(beat.whammyBarPoints![2].offset).to.be.closeTo(31.8, 0.001);
        expect(beat.whammyBarPoints![2].value).to.equal(-12);
        expect(beat.whammyBarPoints![3].offset).to.be.closeTo(53.4, 0.001);
        expect(beat.whammyBarPoints![3].value).to.equal(0);

        // Bar 4
        beat = score.tracks[0].staves[0].bars[3].voices[0].beats[0];
        expect(beat.whammyBarType).to.equal(WhammyType.Predive);
        expect(beat.whammyBarPoints!.length).to.equal(2);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(-8);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(60, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-8);

        // Bar 5
        beat = score.tracks[0].staves[0].bars[4].voices[0].beats[0];
        expect(beat.whammyBarType).to.equal(WhammyType.PrediveDive);
        expect(beat.whammyBarPoints!.length).to.equal(2);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(-4);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(30, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(0);

        // Bar 6
        beat = score.tracks[0].staves[0].bars[5].voices[0].beats[0];
        expect(beat.whammyBarType).to.equal(WhammyType.PrediveDive);
        expect(beat.whammyBarPoints!.length).to.equal(2);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(-4);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(29.4, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-12);

        beat = score.tracks[0].staves[0].bars[5].voices[0].beats[1];
        expect(beat.whammyBarType).to.equal(WhammyType.Dive);
        expect(beat.whammyBarPoints!.length).to.equal(2);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(-12);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(45.6, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(0);

        // Bar 7
        beat = score.tracks[0].staves[0].bars[6].voices[0].beats[0];
        expect(beat.whammyBarType).to.equal(WhammyType.Dive);
        expect(beat.whammyBarPoints!.length).to.equal(2);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(0);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(45, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-4);

        beat = score.tracks[0].staves[0].bars[6].voices[0].beats[1];
        expect(beat.whammyBarType).to.equal(WhammyType.Hold);
        expect(beat.whammyBarPoints!.length).to.equal(2);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(-4);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(60, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-4);

        // Bar 8
        beat = score.tracks[0].staves[0].bars[7].voices[0].beats[0];
        expect(beat.whammyBarType).to.equal(WhammyType.Dive);
        expect(beat.whammyBarPoints!.length).to.equal(2);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(-4);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(46.2, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-12);

        beat = score.tracks[0].staves[0].bars[7].voices[0].beats[1];
        expect(beat.whammyBarType).to.equal(WhammyType.Dive);
        expect(beat.whammyBarPoints!.length).to.equal(2);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(-12);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(44.4, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(8);

        // Bar 9
        beat = score.tracks[0].staves[0].bars[8].voices[0].beats[0];
        expect(beat.whammyBarType).to.equal(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).to.equal(3);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(8);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(12);
        expect(beat.whammyBarPoints![2].offset).to.be.closeTo(30, 0.001);
        expect(beat.whammyBarPoints![2].value).to.equal(0);

        beat = score.tracks[0].staves[0].bars[8].voices[0].beats[1];
        expect(beat.whammyBarType).to.equal(WhammyType.Dip);
        expect(beat.whammyBarPoints!.length).to.equal(3);
        expect(beat.whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(beat.whammyBarPoints![0].value).to.equal(0);
        expect(beat.whammyBarPoints![1].offset).to.be.closeTo(15, 0.001);
        expect(beat.whammyBarPoints![1].value).to.equal(-4);
        expect(beat.whammyBarPoints![2].offset).to.be.closeTo(30, 0.001);
        expect(beat.whammyBarPoints![2].value).to.equal(0);
    });

    it('tremolo', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/tremolo.gp');
        let score: Score = reader.readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints!.length).to.equal(3);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![0].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![1].offset).to.be.closeTo(
            30,
            0.001
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![1].value).to.equal(-4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![2].offset).to.be.closeTo(
            60,
            0.001
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].whammyBarPoints![2].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints!.length).to.equal(2);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![0].value).to.equal(-4);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![1].offset).to.be.closeTo(
            60,
            0.001
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].whammyBarPoints![1].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints!.length).to.equal(4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![0].value).to.equal(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![1].offset).to.be.closeTo(
            30,
            0.001
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![1].value).to.equal(-4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![2].offset).to.be.closeTo(
            30,
            0.001
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![2].value).to.equal(-4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![3].offset).to.be.closeTo(
            60,
            0.001
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![3].value).to.equal(-4);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints!.length).to.equal(4);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![0].offset).to.be.closeTo(0, 0.001);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![0].value).to.equal(-4);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![1].offset).to.be.closeTo(
            15,
            0.001
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![1].value).to.equal(-12);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![2].offset).to.be.closeTo(
            30.6,
            0.001
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![2].value).to.equal(-12);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![3].offset).to.be.closeTo(
            45,
            0.001
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].whammyBarPoints![3].value).to.equal(0);
    });

    it('slides', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/slides.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkSlides(score);
    });

    it('vibrato', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/vibrato.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkVibrato(score, true);
    });

    it('trills', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/trills.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTrills(score);
    });

    it('other-effects', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/other-effects.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkOtherEffects(score, true);
    });

    it('fingering', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/fingering.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkFingering(score);
    });

    it('stroke', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/strokes.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkStroke(score);
    });

    it('tuplets', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/tuplets.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTuplets(score);
    });

    it('ranges', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/ranges.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkRanges(score);
    });

    it('effects', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/effects.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkEffects(score);
    });

    it('serenade', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/serenade.gp');
        reader.readScore();
        // only Check reading
    });

    it('strings', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/strings.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkStrings(score);
    });

    it('key-signatures', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/key-signatures.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkKeySignatures(score);
    });

    it('chords', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/chords.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkChords(score);
    });

    it('colors', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/colors.gp');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkColors(score);
    });

    it('tremolo-vibrato', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/tremolo-vibrato.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].vibrato).to.equal(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].vibrato).to.equal(VibratoType.Wide);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[1].vibrato).to.equal(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].vibrato).to.equal(VibratoType.Slight);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].vibrato).to.equal(VibratoType.Wide);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].vibrato).to.equal(VibratoType.Wide);
    });

    it('ottavia', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/ottavia.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].clefOttava).to.equal(Ottavia._8va);
        expect(score.tracks[0].staves[0].bars[1].clefOttava).to.equal(Ottavia._8vb);
        expect(score.tracks[0].staves[0].bars[2].clefOttava).to.equal(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[3].clefOttava).to.equal(Ottavia._15mb);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].ottava).to.equal(Ottavia._8va);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[1].ottava).to.equal(Ottavia._8vb);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[2].ottava).to.equal(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[3].ottava).to.equal(Ottavia._15mb);
    });

    it('simile-mark', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/simile-mark.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].simileMark).to.equal(SimileMark.None);
        expect(score.tracks[0].staves[0].bars[1].simileMark).to.equal(SimileMark.Simple);
        expect(score.tracks[0].staves[0].bars[2].simileMark).to.equal(SimileMark.None);
        expect(score.tracks[0].staves[0].bars[3].simileMark).to.equal(SimileMark.None);
        expect(score.tracks[0].staves[0].bars[4].simileMark).to.equal(SimileMark.FirstOfDouble);
        expect(score.tracks[0].staves[0].bars[5].simileMark).to.equal(SimileMark.SecondOfDouble);
    });

    it('anacrusis', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/anacrusis.gp');
        let score: Score = reader.readScore();
        expect(score.masterBars[0].isAnacrusis).to.be.equal(true);
        expect(score.masterBars[0].calculateDuration()).to.equal(1920);
        expect(score.masterBars[1].calculateDuration()).to.equal(3840);
    });

    it('left-hand-tap', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/left-hand-tap.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isLeftHandTapped).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].isLeftHandTapped).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].isLeftHandTapped).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[6].notes[0].isLeftHandTapped).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[9].notes[0].isLeftHandTapped).to.be.equal(true);
    });

    it('fermata', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/fermata.gp');
        let score: Score = reader.readScore();
        expect(score.masterBars[0].fermata!.size).to.equal(5);
        expect(score.masterBars[1].fermata!.size).to.equal(5);
        expect(score.masterBars[2].fermata!.size).to.equal(5); // Short
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
            expect(masterBar.fermata!.size).to.equal(5);
            for (let offset of offsets) {
                let fermata = masterBar.fermata!.get(offset);
                expect(fermata).to.be.ok;
                expect(fermata!.type).to.equal(types[i]);
            }
            let beats: Beat[] = score.tracks[0].staves[0].bars[i].voices[0].beats;
            for (let beat of beats) {
                let fermata = masterBar.fermata!.get(beat.playbackStart);
                let beatFermata = beat.fermata;
                expect(beatFermata).to.be.ok;
                expect(fermata).to.be.ok;
                expect(beatFermata!.type).to.equal(types[i]);
                expect(fermata!.type).to.equal(types[i]);
            }
        }
    });

    it('pick-slide', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/pick-slide.gp');
        let score: Score = reader.readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].fret).to.equal(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].fret).to.equal(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].fret).to.equal(10);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].fret).to.equal(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].fret).to.equal(0);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].fret).to.equal(10);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].fret).to.equal(10);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].fret).to.equal(5);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].fret).to.equal(20);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].notes[0].fret).to.equal(12);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].notes[0].fret).to.equal(5);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].notes[0].fret).to.equal(0);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].notes[0].fret).to.equal(20);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].notes[0].fret).to.equal(12);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].notes[0].fret).to.equal(5);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[3].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideUp
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[3].notes[0].fret).to.equal(10);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].notes[0].slideOutType).to.equal(
            SlideOutType.PickSlideDown
        );
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].notes[0].fret).to.equal(20);
    });

    it('beat-lyrics', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/beat-lyrics.gp');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].lyrics![0]).to.be.equal('This');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].lyrics![0]).to.be.equal('is');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].lyrics![0]).to.be.equal('a');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].lyrics![0]).to.be.equal('test file');
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].lyrics![0]).to.be.equal('for');
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].lyrics![0]).to.be.equal('lyrics');
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].lyrics).to.be.equal(null);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].lyrics).to.be.equal(null);
    });

    it('track-volume', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/track-volume.gp');
        let score: Score = reader.readScore();

        expect(score.tracks[0].playbackInfo.volume).to.be.equal(16);
        expect(score.tracks[1].playbackInfo.volume).to.be.equal(14);
        expect(score.tracks[2].playbackInfo.volume).to.be.equal(12);
        expect(score.tracks[3].playbackInfo.volume).to.be.equal(10);
        expect(score.tracks[4].playbackInfo.volume).to.be.equal(7);
        expect(score.tracks[5].playbackInfo.volume).to.be.equal(3);
        expect(score.tracks[6].playbackInfo.volume).to.be.equal(0);
    });

    it('track-balance', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/track-balance.gp');
        let score: Score = reader.readScore();

        expect(score.tracks[0].playbackInfo.balance).to.be.equal(0);
        expect(score.tracks[1].playbackInfo.balance).to.be.equal(4);
        expect(score.tracks[2].playbackInfo.balance).to.be.equal(8);
        expect(score.tracks[3].playbackInfo.balance).to.be.equal(12);
        expect(score.tracks[4].playbackInfo.balance).to.be.equal(16);
    });

    it('program-change', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/program-change.gp');
        let score: Score = reader.readScore();

        expect(score.tracks[0].playbackInfo.program).to.be.equal(25);
        const automation = score.tracks[0].staves[0].bars[2].voices[0].beats[0].getAutomation(
            AutomationType.Instrument
        );
        expect(automation).to.be.ok;
        if (automation) {
            expect(automation.value).to.be.equal(29);
        }
    });

    it('chord-no-diagram', async () => {
        const reader = await prepareImporterWithFile('guitarpro7/chord-no-diagram.gp');
        let score: Score = reader.readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord).to.be.ok;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.name).to.be.equal('C');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings.length).to.be.equal(0);
    });

    it('layout-configuration', async () => {
        const track1 = (await prepareImporterWithFile('guitarpro7/layout-configuration-multi-track-1.gp')).readScore();
        const track2 = (await prepareImporterWithFile('guitarpro7/layout-configuration-multi-track-2.gp')).readScore();
        const trackAll = (await prepareImporterWithFile('guitarpro7/layout-configuration-multi-track-all.gp')).readScore();
        const track1And3 = (await prepareImporterWithFile('guitarpro7/layout-configuration-multi-track-1-3.gp')).readScore();

        GpImporterTestHelper.checkMultiTrackLayoutConfiguration(
            track1, 
            track2,
            trackAll,
            track1And3
        );
    });

    it('slash', async () => {
        const score = (await prepareImporterWithFile('guitarpro7/slash.gp')).readScore();
        GpImporterTestHelper.checkSlash(score);
    });
});
