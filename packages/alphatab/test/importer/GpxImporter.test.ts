import { describe, expect, it } from 'vitest';
import { type GpxFile, GpxFileSystem } from '@coderline/alphatab/importer/GpxFileSystem';
import { GpxImporter } from '@coderline/alphatab/importer/GpxImporter';
import { UnsupportedFormatError } from '@coderline/alphatab/importer/UnsupportedFormatError';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { OverflowError } from '@coderline/alphatab/io/IReadable';
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
        const fileSystem: GpxFileSystem = new GpxFileSystem(new Settings().importer.maxDecodingBufferSize);
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

    /**
     * Builds a BCFS container with one score.gpif entry. Sector indices are relative to the data after the header.
     */
    function buildBcfsContainer(
        sectorCount: number,
        entrySector: number,
        fileSize: number,
        sectorPointers: number[]
    ): Uint8Array {
        const buffer = ByteBuffer.fromBuffer(new Uint8Array(4 + sectorCount * 0x1000));
        buffer.write(IOHelper.stringToBytes('BCFS'), 0, 4);
        const entry = 4 + entrySector * 0x1000;
        buffer.position = entry;
        IOHelper.writeInt32LE(buffer, 2);
        buffer.write(IOHelper.stringToBytes('score.gpif'), 0, 10);
        buffer.position = entry + 0x8c;
        IOHelper.writeInt32LE(buffer, fileSize);
        buffer.position = entry + 0x94;
        for (const pointer of sectorPointers) {
            IOHelper.writeInt32LE(buffer, pointer);
        }
        return buffer.toArray();
    }

    function loadFileSystem(data: Uint8Array): GpxFileSystem {
        const fileSystem: GpxFileSystem = new GpxFileSystem(new Settings().importer.maxDecodingBufferSize);
        fileSystem.load(ByteBuffer.fromBuffer(data));
        return fileSystem;
    }

    it('file-system-sector-before-entry', () => {
        const fileSystem = loadFileSystem(buildBcfsContainer(3, 2, 1, [1]));
        expect(fileSystem.files.length).toBe(1);
        expect(fileSystem.files[0].fileName).toBe('score.gpif');
    });

    it('file-system-negative-sector', () => {
        expect(() => loadFileSystem(buildBcfsContainer(3, 2, 1, [-1]))).toThrow(UnsupportedFormatError);
    });

    it('file-system-sector-past-end', () => {
        expect(() => loadFileSystem(buildBcfsContainer(3, 2, 1, [3]))).toThrow(UnsupportedFormatError);
    });

    it('file-system-unterminated-sector-list', () => {
        const pointers: number[] = [];
        for (let i = 0; i < (0x1000 - 0x94) / 4; i++) {
            pointers.push(1);
        }
        expect(() => loadFileSystem(buildBcfsContainer(3, 2, 1, pointers))).toThrow(UnsupportedFormatError);
    });

    it('file-system-negative-file-size', () => {
        expect(() => loadFileSystem(buildBcfsContainer(3, 2, -1, [1]))).toThrow(UnsupportedFormatError);
    });

    it('file-system-file-size-exceeds-container', () => {
        expect(() => loadFileSystem(buildBcfsContainer(3, 2, 0x7fffffff, [1]))).toThrow(UnsupportedFormatError);
    });

    it('file-system-decompressed-size-exceeds-limit', () => {
        const buffer = ByteBuffer.empty();
        buffer.write(IOHelper.stringToBytes('BCFZ'), 0, 4);
        IOHelper.writeInt32LE(buffer, 0x7fffffff);
        expect(() => loadFileSystem(buffer.toArray())).toThrow(OverflowError);
    });

    it('file-system-decompressed-size-below-header', () => {
        const buffer = ByteBuffer.empty();
        buffer.write(IOHelper.stringToBytes('BCFZ'), 0, 4);
        IOHelper.writeInt32LE(buffer, 2);
        expect(() => loadFileSystem(buffer.toArray())).toThrow(UnsupportedFormatError);
    });

    it('score-loader-malformed-gpx-terminates', () => {
        const data = buildBcfsContainer(3, 2, 1, [1]);
        expect(() => ScoreLoader.loadScoreFromBytes(data)).toThrow(UnsupportedFormatError);
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

    it('synthesized-fingering-keeps-ties', async () => {
        const score = (await prepareImporterWithFile('conversion/full-song.gpx')).readScore();
        let ties = 0;
        for (const track of score.tracks) {
            for (const staff of track.staves) {
                for (const bar of staff.bars) {
                    for (const voice of bar.voices) {
                        for (const beat of voice.beats) {
                            for (const note of beat.notes) {
                                if (note.isTieDestination && note.tieOrigin !== null) {
                                    expect(note.tieOrigin.string).toBe(note.string);
                                    expect(note.tieOrigin.realValue).toBe(note.realValue);
                                    ties++;
                                }
                            }
                        }
                    }
                }
            }
        }
        expect(ties).toBeGreaterThan(0);
    });

    it('drum-tablature-follows-part-configuration', async () => {
        const score = (await prepareImporterWithFile('conversion/full-song.gpx')).readScore();
        const drums = score.tracks[10].staves[0];
        expect(drums.isPercussion).toBe(true);
        // the PartConfiguration of this file enables standard notation and tablature on the drum track
        expect(drums.showTablature).toBe(true);
        expect(drums.showStandardNotation).toBe(true);
    });
});
