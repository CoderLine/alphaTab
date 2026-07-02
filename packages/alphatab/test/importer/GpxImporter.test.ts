import { describe, expect, it } from 'vitest';
import { type GpxFile, GpxFileSystem } from '@coderline/alphatab/importer/GpxFileSystem';
import { GpxImporter } from '@coderline/alphatab/importer/GpxImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import type { Score } from '@coderline/alphatab/model/Score';
import { Settings } from '@coderline/alphatab/Settings';
import { Logger } from '@coderline/alphatab/Logger';
import { GpImporterTestHelper } from 'test/importer/GpImporterTestHelper';
import { TestPlatform } from 'test/TestPlatform';
describe('GpxImporterTest', () => {
    async function prepareImporterWithFile(name: string): Promise<GpxImporter> {
        const data = await TestPlatform.loadFile(`test-data/${name}`);
        return prepareImporterWithBytes(data);
    }

    function prepareImporterWithBytes(buffer: Uint8Array) {
        const readerBase: GpxImporter = new GpxImporter();
        readerBase.init(ByteBuffer.fromBuffer(buffer), new Settings());
        return readerBase;
    }

    it('file-system-compressed', async () => {
        const data = await TestPlatform.loadFile('test-data/guitarpro6/file-system-compressed.gpx');
        const fileSystem: GpxFileSystem = new GpxFileSystem();
        fileSystem.load(ByteBuffer.fromBuffer(data));
        const names: string[] = [
            'score.gpif',
            'misc.xml',
            'BinaryStylesheet',
            'PartConfiguration',
            'LayoutConfiguration'
        ];
        const sizes = [8488, 130, 12204, 20, 12];
        for (let i: number = 0; i < fileSystem.files.length; i++) {
            const file: GpxFile = fileSystem.files[i];
            Logger.info('Test', `${file.fileName} - ${file.fileSize}`);
            expect(file.fileName).toBe(names[i]);
            expect(file.fileSize).toBe(sizes[i]);
        }
    });

    it('score-info', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/score-info.gpx');
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
        const reader = await prepareImporterWithFile('guitarpro6/notes.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkNotes(score);
    });

    it('time-signatures', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/time-signatures.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTimeSignatures(score);
    });

    it('dead', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/dead.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkDead(score);
    });

    it('grace', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/grace.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkGrace(score);
    });

    it('accentuations', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/accentuations.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkAccentuations(score, true);
    });

    it('harmonics', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/harmonics.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkHarmonics(score);
    });

    it('hammer', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/hammer.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkHammer(score);
    });

    it('bends', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/bends.gpx');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints!.length).toBe(2);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![0].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![1].offset).toBeCloseTo(60, 3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].bendPoints![1].value).toBe(4);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints!.length).toBe(2);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![0].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![1].offset).toBeCloseTo(60, 3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].bendPoints![1].value).toBe(4);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints!.length).toBe(4);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![0].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![0].offset).toBeCloseTo(0, 3);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![0].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![1].offset).toBeCloseTo(30, 3);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![1].value).toBe(12);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![2].offset).toBeCloseTo(30, 3);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![2].value).toBe(12);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![3].offset).toBeCloseTo(60, 3);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0].bendPoints![3].value).toBe(6);
    });

    it('tremolo', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/tremolo.gpx');
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

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints!.length).toBe(3);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![0].offset).toBeCloseTo(0, 3);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![0].value).toBe(0);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![1].offset).toBeCloseTo(30, 3);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![1].value).toBe(-4);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![2].offset).toBeCloseTo(60, 3);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].whammyBarPoints![2].value).toBe(-4);

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
        const reader = await prepareImporterWithFile('guitarpro6/slides.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkSlides(score);
    });

    it('vibrato', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/vibrato.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkVibrato(score, true);
    });

    it('trills', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/trills.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTrills(score);
    });

    it('other-effects', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/other-effects.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkOtherEffects(score, true);
    });

    it('fingering', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/fingering.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkFingering(score);
    });

    it('stroke', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/strokes.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkStroke(score);
    });

    it('tuplets', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/tuplets.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTuplets(score);
    });

    it('ranges', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/ranges.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkRanges(score);
    });

    it('effects', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/effects.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkEffects(score);
    });

    it('serenade', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/serenade.gpx');
        reader.readScore();
        // only Check reading
    });

    it('strings', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/strings.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkStrings(score);
    });

    it('key-signatures', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/key-signatures.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkKeySignatures(score);
    });

    it('chords', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/chords.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkChords(score);
    });

    it('colors', async () => {
        const reader = await prepareImporterWithFile('guitarpro6/colors.gpx');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkColors(score);
    });

    it('layout-configuration', async () => {
        const track1 = (await prepareImporterWithFile('guitarpro6/layout-configuration-multi-track-1.gpx')).readScore();
        const track2 = (await prepareImporterWithFile('guitarpro6/layout-configuration-multi-track-2.gpx')).readScore();
        const trackAll = (
            await prepareImporterWithFile('guitarpro6/layout-configuration-multi-track-all.gpx')
        ).readScore();
        const track1And3 = (
            await prepareImporterWithFile('guitarpro6/layout-configuration-multi-track-1-3.gpx')
        ).readScore();

        GpImporterTestHelper.checkMultiTrackLayoutConfiguration(track1, track2, trackAll, track1And3);
    });

    it('slash', async () => {
        const score = (await prepareImporterWithFile('guitarpro6/slash.gpx')).readScore();
        GpImporterTestHelper.checkSlash(score);
    });
});
