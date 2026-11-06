import { AlphaTexExporter } from '@coderline/alphatab/exporter/AlphaTexExporter';
import { FormatError } from '@coderline/alphatab/FormatError';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { TablEditImporter } from '@coderline/alphatab/importer/TablEditImporter';
import { TefReadingList, TefReadingListItem } from '@coderline/alphatab/importer/tablEdit/TefReadingList';
import { UnsupportedFormatError } from '@coderline/alphatab/importer/UnsupportedFormatError';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { OverflowError } from '@coderline/alphatab/io/IReadable';
import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import { AccentuationType } from '@coderline/alphatab/model/AccentuationType';
import { AutomationType } from '@coderline/alphatab/model/Automation';
import { BarLineStyle } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatBeamingMode } from '@coderline/alphatab/model/Beat';
import { BendType } from '@coderline/alphatab/model/BendType';
import { BrushType } from '@coderline/alphatab/model/BrushType';
import { Clef } from '@coderline/alphatab/model/Clef';
import { CrescendoType } from '@coderline/alphatab/model/CrescendoType';
import { Direction } from '@coderline/alphatab/model/Direction';
import { Duration } from '@coderline/alphatab/model/Duration';
import { DynamicValue } from '@coderline/alphatab/model/DynamicValue';
import { FadeType } from '@coderline/alphatab/model/FadeType';
import { FermataType } from '@coderline/alphatab/model/Fermata';
import { Fingers } from '@coderline/alphatab/model/Fingers';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import type { Note } from '@coderline/alphatab/model/Note';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { NoteOrnament } from '@coderline/alphatab/model/NoteOrnament';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { PickStroke } from '@coderline/alphatab/model/PickStroke';
import { Rasgueado } from '@coderline/alphatab/model/Rasgueado';
import type { Score } from '@coderline/alphatab/model/Score';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import { TripletFeel } from '@coderline/alphatab/model/TripletFeel';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { Settings } from '@coderline/alphatab/Settings';
import { TestPlatform } from 'test/TestPlatform';
import { describe, expect, it } from 'vitest';

/**
 * @record
 * @internal
 */
interface ExpectedTupletBeat {
    duration: Duration;
    ratio: string;
    start: number;
    tolerance: number;
}

/**
 * @record
 * @internal
 */
interface ReadingListStructure {
    list: [number, number][];
    tablEdit: number[];
    alphaTab?: number[];
    repeatStart?: number[];
    repeatCount?: [number, number][];
    endings?: [number, number][];
    directions?: [number, Direction[]][];
}

/**
 * The files in test-data/tabledit were entered in TablEdit 3.06 (unless the file says otherwise a 6-string
 * guitar in standard tuning, 4/4); every expected value follows from what was entered and the file format.
 * Markers sit on string row 0, so the notes of a marker column are on row 1 or below.
 */
describe('TablEditImporterTest', () => {
    const quarter = 960;
    const cellsPointer = 60;
    const titlePointer = 64;
    const textsPointer = 84;
    const chordsPointer = 88;
    const measuresPointer = 92;
    const instrumentsPointer = 96;
    const readingListPointer = 128;
    const formatOffset = 205;
    const cellSize = 12;
    const stringCount = 6;

    function loadData(name: string): Promise<Uint8Array> {
        return TestPlatform.loadFile(`test-data/tabledit/${name}.tef`);
    }

    function readBytes(data: Uint8Array, settings: Settings | null = null): Score {
        const importer = new TablEditImporter();
        importer.init(ByteBuffer.fromBuffer(data), settings ?? new Settings());
        return importer.readScore();
    }

    async function load(name: string): Promise<Score> {
        const score = ScoreLoader.loadScoreFromBytes(await loadData(name), new Settings());
        expectBarsFilled(score);
        return score;
    }

    /**
     * Every voice with content lasts exactly as long as its bar. alphaTab truncates the ticks of a tuplet
     * whose length is no whole number of ticks, each such beat may end the voice one tick early.
     */
    function expectBarsFilled(score: Score) {
        for (const track of score.tracks) {
            for (const staff of track.staves) {
                for (const bar of staff.bars) {
                    for (const voice of bar.voices) {
                        if (voice.isEmpty) {
                            continue;
                        }
                        let duration = 0;
                        let truncated = 0;
                        for (const b of voice.beats) {
                            duration += b.playbackDuration;
                            if (
                                b.hasTuplet &&
                                (MidiUtils.toTicks(b.duration) * b.tupletDenominator) % b.tupletNumerator !== 0
                            ) {
                                truncated++;
                            }
                        }
                        const missing = bar.masterBar.calculateDuration() - duration;
                        expect(missing, `bar ${bar.index} voice ${voice.index}`).toBeGreaterThanOrEqual(0);
                        expect(missing, `bar ${bar.index} voice ${voice.index}`).toBeLessThanOrEqual(truncated);
                    }
                }
            }
        }
    }

    function beats(score: Score, bar: number, voice: number = 0): Beat[] {
        return score.tracks[0].staves[0].bars[bar].voices[voice].beats;
    }

    function noteOn(beat: Beat, string: number): Note {
        const note = beat.notes.find(n => n.string === string);
        expect(note, `note on string ${string}`).toBeDefined();
        return note!;
    }

    function single(beat: Beat): Note {
        expect(beat.notes.length).toBe(1);
        return beat.notes[0];
    }

    function frets(beat: Beat): Map<number, number> {
        return new Map(beat.notes.map(n => [n.string, n.fret]));
    }

    /**
     * Per beat: the fret of its single note (or 'r' for a rest), duration, dots and start in the bar.
     */
    function timeline(score: Score, bar: number): unknown[][] {
        return beats(score, bar).map(
            b => [b.isRest ? 'r' : single(b).fret, b.duration, b.dots, b.playbackStart] as unknown[]
        );
    }

    function tuplet(beat: Beat): string {
        return beat.hasTuplet ? `${beat.tupletNumerator}:${beat.tupletDenominator}` : '';
    }

    function bendPoints(note: Note): number[][] | null {
        return note.bendPoints ? note.bendPoints.map(p => [p.offset, p.value] as number[]) : null;
    }

    function whammy(b: Beat): number[][] | null {
        return b.whammyBarPoints ? b.whammyBarPoints.map(p => [p.offset, p.value] as number[]) : null;
    }

    function expectNoNoteEffect(beat: Beat) {
        for (const n of beat.notes) {
            expect(n.isHammerPullOrigin).toBe(false);
            expect(n.slideOutType).toBe(SlideOutType.None);
            expect(n.harmonicType).toBe(HarmonicType.None);
            expect(n.bendPoints).toBe(null);
            expect(n.isGhost).toBe(false);
            expect(n.isDead).toBe(false);
            expect(n.isLetRing).toBe(false);
            expect(n.isStaccato).toBe(false);
            expect(n.isPalmMute).toBe(false);
            expect(n.vibrato).toBe(VibratoType.None);
        }
        expect(beat.brushType).toBe(BrushType.None);
        expect(beat.slap).toBe(false);
        expect(beat.tap).toBe(false);
        expect(beat.fade).toBe(FadeType.None);
        expect(beat.whammyBarPoints).toBe(null);
        expect(beat.rasgueado).toBe(Rasgueado.None);
    }

    function u16(data: Uint8Array, offset: number): number {
        return data[offset] | (data[offset + 1] << 8);
    }

    function u32(data: Uint8Array, offset: number): number {
        return (data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16)) + data[offset + 3] * 16777216;
    }

    function setU16(data: Uint8Array, offset: number, value: number) {
        data[offset] = value & 0xff;
        data[offset + 1] = (value >> 8) & 0xff;
    }

    function setU32(data: Uint8Array, offset: number, value: number) {
        setU16(data, offset, value % 65536);
        setU16(data, offset + 2, Math.floor(value / 65536));
    }

    /**
     * The offset of the 8 data bytes of the cell at the given 64th and string row.
     */
    function cellData(data: Uint8Array, position: number, row: number): number {
        let p = u32(data, cellsPointer);
        while (u32(data, p) !== 0xffffffff) {
            const slot = Math.floor(u32(data, p) / 8);
            if (Math.floor(slot / stringCount) === position && slot % stringCount === row) {
                return p + 4;
            }
            p += cellSize;
        }
        throw new Error(`no cell at ${position}/${row}`);
    }

    /**
     * Appends a block to the file and points the given header pointer to it.
     */
    function withBlock(data: Uint8Array, pointer: number, block: Uint8Array): Uint8Array {
        const result = new Uint8Array(data.length + block.length);
        result.set(data, 0);
        result.set(block, data.length);
        setU32(result, pointer, data.length);
        return result;
    }

    function loadHealthy(): Promise<Uint8Array> {
        return TestPlatform.loadFile('test-data/corrupt/healthy.tef');
    }

    /**
     * Appends cells, each given as 64th, string row and data bytes, to the cells of a 6-string file.
     */
    function withCells(data: Uint8Array, cells: [number, number, number[]][]): Uint8Array {
        const start = u32(data, cellsPointer);
        let end = start;
        while (u32(data, end) !== 0xffffffff) {
            end += cellSize;
        }
        const block = new Uint8Array(end - start + cells.length * cellSize + 4);
        block.set(data.subarray(start, end), 0);
        let p = end - start;
        for (const [position, row, bytes] of cells) {
            setU32(block, p, (position * stringCount + row) * 8);
            for (let k = 0; k < bytes.length; k++) {
                block[p + 4 + k] = bytes[k];
            }
            p += cellSize;
        }
        setU32(block, p, 0xffffffff);
        return withBlock(data, cellsPointer, block);
    }

    /**
     * Sets the upper voice on the notes and rests of a bar of a 6-string file whose bars up to it are 4/4.
     */
    function withUpperVoice(data: Uint8Array, bar: number): Uint8Array {
        const result = new Uint8Array(data);
        let p = u32(result, cellsPointer);
        while (u32(result, p) !== 0xffffffff) {
            const position = Math.floor(Math.floor(u32(result, p) / 8) / stringCount);
            const type = result[p + 4] & 0x3f;
            if (Math.floor(position / 64) === bar && type > 0 && type <= 0x33) {
                result[p + 6] = (result[p + 6] & 0xcf) | 0x20;
            }
            p += cellSize;
        }
        return result;
    }

    function directionsOf(m: MasterBar): Direction[] {
        return m.directions ? Array.from(m.directions) : [];
    }

    function toTex(score: Score): string {
        return new AlphaTexExporter().exportToString(score);
    }

    describe('detection', () => {
        it('loads-tabledit', async () => {
            const score = ScoreLoader.loadScoreFromBytes(await loadData('notes'), new Settings());
            expect(score.masterBars.length).toBe(5);
            expect(score.tracks.length).toBe(1);
        });

        it('leaves-other-formats', async () => {
            const gp5 = await TestPlatform.loadFile('test-data/guitarpro5/notes.gp5');
            expect(ScoreLoader.loadScoreFromBytes(gp5, new Settings()).tracks.length).toBeGreaterThan(0);
            const tex = ScoreLoader.loadScoreFromBytes(
                IOHelper.stringToBytes('\\title "TablEdit detection" . 3.3 0.2 1.1 2.2 |'),
                new Settings()
            );
            expect(tex.masterBars.length).toBe(1);
        });

        it('leaves-alphatex', async () => {
            const expectAlphaTex = (name: string, tex: string, title: string | null) => {
                const data = IOHelper.stringToBytes(tex);
                expect(() => readBytes(data), name).toThrow(UnsupportedFormatError);
                const score = ScoreLoader.loadScoreFromBytes(data, new Settings());
                expect(score.masterBars.length, name).toBeGreaterThan(0);
                if (title !== null) {
                    expect(score.title, name).toBe(title);
                }
            };
            const legend = await TestPlatform.loadFile('test-data/exporter/notation-legend-formatted.atex');
            expectAlphaTex('notation-legend-formatted.atex', IOHelper.toString(legend, 'utf-8'), null);
            for (const file of await TestPlatform.listDirectory('test-data/tabledit')) {
                const score = readBytes(await loadData(file.substring(0, file.length - 4)));
                expectAlphaTex(file, toTex(score), score.title);
            }
        });

        it('rejects-foreign-data', () => {
            expect(() => readBytes(new Uint8Array(0))).toThrow(UnsupportedFormatError);
            expect(() => readBytes(new Uint8Array(10))).toThrow(UnsupportedFormatError);
            expect(() => readBytes(new Uint8Array(255))).toThrow(UnsupportedFormatError);
            expect(() => readBytes(new Uint8Array(300))).toThrow(UnsupportedFormatError);
        });

        it('rejects-other-score-files', async () => {
            for (const folder of ['guitarpro3', 'guitarpro4', 'guitarpro5', 'guitarpro6', 'guitarpro7', 'musicxml3']) {
                const files = await TestPlatform.listDirectory(`test-data/${folder}`);
                for (const file of files) {
                    const data = await TestPlatform.loadFile(`test-data/${folder}/${file}`);
                    expect(() => readBytes(data), `${folder}/${file}`).toThrow(UnsupportedFormatError);
                }
            }
        });
    });

    describe('corrupt', () => {
        async function patched(offset: number, value: number): Promise<Uint8Array> {
            const data = await loadHealthy();
            data[offset] = value;
            return data;
        }

        it('healthy', async () => {
            const score = readBytes(await loadHealthy());
            expect(score.masterBars.length).toBe(5);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(4);
        });

        it('detection-measure', async () => {
            const base = await loadHealthy();
            const patches: [number, number][] = [
                [204, 3],
                [204, 0],
                [formatOffset, 0]
            ];
            for (const [offset, value] of patches) {
                const data = new Uint8Array(base);
                data[offset] = value;
                expect(() => readBytes(data), `[${offset}] = ${value}`).toThrow(UnsupportedFormatError);
            }
            const longMeasure = new Uint8Array(base);
            setU16(longMeasure, 202, 100);
            expect(() => readBytes(longMeasure)).toThrow(UnsupportedFormatError);
        });

        it('old-format', async () => {
            {
                const data = await patched(formatOffset, 2);
                expect(() => readBytes(data)).toThrow(FormatError);
            }
            {
                const data = await patched(formatOffset, 1);
                expect(() => readBytes(data)).toThrow(FormatError);
            }
        });

        it('format-11', async () => {
            const score = readBytes(await patched(formatOffset, 11));
            expect(toTex(score)).toBe(toTex(readBytes(await loadHealthy())));
        });

        it('protected', async () => {
            {
                const protectedData = await patched(formatOffset, 12);
                expect(() => readBytes(protectedData)).toThrow(FormatError);
            }
            const data = await loadHealthy();
            setU32(data, 16, 1);
            expect(() => readBytes(data)).toThrow(FormatError);
            // TablEdit ignores the protection code of files older than 3.04 b6 (version 0x0304, sub-version 0xB6)
            setU16(data, 2, 0x0304);
            setU16(data, 4, 0xb5);
            expect(readBytes(data).masterBars.length).toBe(5);
            setU16(data, 4, 0xb6);
            expect(() => readBytes(data)).toThrow(FormatError);
        });

        it('newer-format', async () => {
            {
                const data = await patched(formatOffset, 13);
                expect(() => readBytes(data)).toThrow(FormatError);
            }
        });

        it('missing-blocks', async () => {
            const noMeasures = await loadHealthy();
            setU32(noMeasures, measuresPointer, 0);
            expect(() => readBytes(noMeasures)).toThrow(FormatError);
            const noInstruments = await loadHealthy();
            setU32(noInstruments, instrumentsPointer, 0);
            expect(() => readBytes(noInstruments)).toThrow(FormatError);
            const zeroMeasures = await loadHealthy();
            setU16(zeroMeasures, u32(zeroMeasures, measuresPointer) + 2, 0);
            expect(() => readBytes(zeroMeasures)).toThrow(FormatError);
            const zeroInstruments = await loadHealthy();
            setU16(zeroInstruments, u32(zeroInstruments, instrumentsPointer) + 2, 0);
            expect(() => readBytes(zeroInstruments)).toThrow(FormatError);
            const zeroStrings = await loadHealthy();
            setU16(zeroStrings, u32(zeroStrings, instrumentsPointer) + 4, 0);
            expect(() => readBytes(zeroStrings)).toThrow(FormatError);
        });

        it('offset-out-of-range', async () => {
            const data = await loadHealthy();
            setU32(data, titlePointer, data.length + 10);
            expect(() => readBytes(data)).toThrow(FormatError);
        });

        it('truncated', async () => {
            const data = await loadHealthy();
            const cut = u32(data, cellsPointer) + 5 * cellSize + 3;
            expect(() => readBytes(data.slice(0, cut))).toThrow(FormatError);
        });

        it('counts-overflow', async () => {
            const measures = await loadHealthy();
            setU16(measures, u32(measures, measuresPointer) + 2, 0xffff);
            expect(() => readBytes(measures)).toThrow(OverflowError);

            const instruments = await loadHealthy();
            setU16(instruments, u32(instruments, instrumentsPointer) + 2, 65);
            expect(() => readBytes(instruments)).toThrow(OverflowError);

            const strings = await loadHealthy();
            setU16(strings, u32(strings, instrumentsPointer) + 4, 13);
            expect(() => readBytes(strings)).toThrow(OverflowError);

            const texts = await loadData('markers-text-chords');
            setU16(texts, u32(texts, textsPointer), 5000);
            expect(() => readBytes(texts)).toThrow(OverflowError);

            const chords = await loadData('markers-text-chords');
            setU16(chords, u32(chords, chordsPointer) + 2, 5000);
            expect(() => readBytes(chords)).toThrow(OverflowError);

            const readingList = await loadData('reading-list-voltas');
            setU16(readingList, u32(readingList, readingListPointer) + 2, 5000);
            expect(() => readBytes(readingList)).toThrow(OverflowError);
        });

        it('string-length-overflow', async () => {
            const data = await loadHealthy();
            setU16(data, u32(data, titlePointer), 0xffff);
            const settings = new Settings();
            settings.importer.maxDecodingBufferSize = 1024;
            expect(() => readBytes(data, settings)).toThrow(OverflowError);
        });

        it('cell-after-last-measure', async () => {
            const data = await loadHealthy();
            const start = u32(data, cellsPointer);
            let end = start;
            while (u32(data, end) !== 0xffffffff) {
                end += cellSize;
            }
            const cells = new Uint8Array(end - start + 2 * cellSize + 4);
            cells.set(data.subarray(start, end), 0);
            const extra = end - start;
            setU32(cells, extra, 5 * 64 * stringCount * 8);
            cells[extra + 4] = 0x06;
            cells[extra + 5] = 0x46;
            setU32(cells, extra + cellSize, 0xffffffff);
            const score = readBytes(withBlock(data, cellsPointer, cells));
            expect(score.masterBars.length).toBe(5);
            expect(toTex(score)).toBe(toTex(readBytes(await loadHealthy())));
        });

        it('cell-without-fret', async () => {
            // the first byte of 1.0 s1 f0 with only the grace flag left: no fret, so no note
            const data = await loadHealthy();
            data[cellData(data, 0, 5)] = 0x40;
            expect(beats(readBytes(data), 0).map(b => b.isRest)).toEqual([true, false, false, false]);
        });

        it('large-file', async () => {
            // healthy.tef with its first bar repeated: the import time grows linearly with the bar count
            const healthy = await loadHealthy();
            const measures = u32(healthy, measuresPointer);
            const cells = u32(healthy, cellsPointer);
            const barCells: Uint8Array[] = [];
            for (let p = cells; u32(healthy, p) !== 0xffffffff; p += cellSize) {
                if (u32(healthy, p) < 64 * stringCount * 8) {
                    barCells.push(healthy.subarray(p, p + cellSize));
                }
            }
            const importTime = (bars: number) => {
                const measureBlock = new Uint8Array(8 + bars * 8);
                measureBlock.set(healthy.subarray(measures, measures + 8), 0);
                setU16(measureBlock, 2, bars);
                const cellBlock = new Uint8Array(bars * barCells.length * cellSize + 4);
                let p = 0;
                for (let bar = 0; bar < bars; bar++) {
                    measureBlock.set(healthy.subarray(measures + 8, measures + 16), 8 + bar * 8);
                    for (const cell of barCells) {
                        cellBlock.set(cell, p);
                        setU32(cellBlock, p, u32(cell, 0) + bar * 64 * stringCount * 8);
                        p += cellSize;
                    }
                }
                setU32(cellBlock, p, 0xffffffff);
                const data = withBlock(withBlock(healthy, measuresPointer, measureBlock), cellsPointer, cellBlock);
                const start = Date.now();
                const score = readBytes(data);
                const time = Date.now() - start;
                expect(score.masterBars.length).toBe(bars);
                expect(beats(score, bars - 1).length).toBe(4);
                return time;
            };
            importTime(500);
            const small = importTime(1000);
            const large = importTime(8000);
            // eight times the bars: linear time stays far below the 64 times of quadratic time
            expect(large).toBeLessThan(small * 16 + 250);
        });

        it('unknown-duration-codes', async () => {
            for (const code of [21, 24, 27, 30]) {
                const data = await loadHealthy();
                // 1.16 s4 f3
                const cell = cellData(data, 16, 4);
                data[cell + 1] = (data[cell + 1] & 0xe0) | code;
                const score = readBytes(data);
                const bar = score.tracks[0].staves[0].bars[0].voices[0].beats;
                expect(
                    bar.map(b => b.isRest),
                    `code ${code}`
                ).toEqual([false, true, false, false]);
                expect(bar.map(b => b.duration)).toEqual([
                    Duration.Quarter,
                    Duration.Quarter,
                    Duration.Quarter,
                    Duration.Quarter
                ]);
            }
        });

        it('measure-without-time-signature', async () => {
            for (const field of [4, 5]) {
                const data = await loadHealthy();
                data[u32(data, measuresPointer) + 8 + field] = 0;
                const score = readBytes(data);
                expect(score.masterBars[0].timeSignatureNumerator).toBe(4);
                expect(score.masterBars[0].timeSignatureDenominator).toBe(4);
                expect(score.tracks[0].staves[0].bars[0].voices[0].beats.length).toBe(4);
            }
        });

        it('wide-measure-records', async () => {
            const data = await loadHealthy();
            const offset = u32(data, measuresPointer);
            const count = u16(data, offset + 2);
            const block = new Uint8Array(8 + count * 12);
            block.set(data.subarray(offset, offset + 8), 0);
            setU16(block, 0, 16);
            for (let i = 0; i < count; i++) {
                block.set(data.subarray(offset + 8 + i * 8, offset + 16 + i * 8), 8 + i * 12);
            }
            const score = readBytes(withBlock(data, measuresPointer, block));
            expect(toTex(score)).toBe(toTex(readBytes(await loadHealthy())));
        });

        it('text-index-out-of-range', async () => {
            const data = await loadData('markers-text-chords');
            // text marker 'Intro' at 1.16
            setU16(data, cellData(data, 16, 0) + 1, 999);
            const score = readBytes(data);
            expect(beats(score, 0)[1].text).toBe(null);
            expect(beats(score, 0)[2].text).toBe('Bold');
        });

        it('chord-index-out-of-range', async () => {
            for (const index of [0xffff, 999]) {
                const data = await loadData('markers-text-chords');
                // chord marker Am at 1.0
                setU16(data, cellData(data, 0, 0) + 1, index);
                const score = readBytes(data);
                expect(beats(score, 0)[0].chordId, `index ${index}`).toBe(null);
                expect(beats(score, 1)[0].chord!.name).toBe('C');
            }
        });

        it('text-windows-1252', async () => {
            const data = await loadData('markers-text-chords');
            const intro = u32(data, textsPointer) + 2;
            // 'Intro' and its terminating zero
            expect(u16(data, intro)).toBe(6);
            data[intro + 2 + 4] = 0xe9;
            const score = readBytes(data);
            expect(beats(score, 0)[1].text).toBe('Intré');
        });

        it('reading-list-header', async () => {
            const data = await loadData('reading-list-voltas');
            setU16(data, u32(data, readingListPointer), 0x10);
            const score = readBytes(data);
            expect(TefReadingList.playbackOrder(score, 100)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
            expect(score.masterBars.some(m => m.isRepeatStart || m.repeatCount > 0)).toBe(false);
        });
    });

    describe('notes', () => {
        it('notes-frets-strings', async () => {
            const score = await load('notes');
            const staff = score.tracks[0].staves[0];
            expect(staff.tuning).toEqual([64, 59, 55, 50, 45, 40]);
            expect(staff.capo).toBe(0);
            expect(staff.bars.every(b => b.voices.length === 1)).toBe(true);

            const bar = beats(score, 0);
            expect(bar.length).toBe(4);
            expect(bar.every(b => b.duration === Duration.Quarter && b.dots === 0)).toBe(true);
            expect(bar.map(b => b.playbackStart)).toEqual([0, quarter, 2 * quarter, 3 * quarter]);

            expect(single(bar[0]).string).toBe(1);
            expect(single(bar[0]).fret).toBe(0);
            expect(single(bar[0]).realValue).toBe(40);
            expect(single(bar[1]).string).toBe(2);
            expect(single(bar[1]).fret).toBe(3);
            expect(single(bar[1]).realValue).toBe(48);
            expect(single(bar[2]).string).toBe(3);
            expect(single(bar[2]).fret).toBe(12);
            expect(single(bar[2]).realValue).toBe(62);
            expect(single(bar[3]).string).toBe(6);
            expect(single(bar[3]).fret).toBe(24);
            expect(single(bar[3]).realValue).toBe(88);
        });

        it('notes-accidentals', async () => {
            const score = await load('notes');
            const bar = beats(score, 1);
            expect(bar.length).toBe(4);

            expect(frets(bar[0])).toEqual(
                new Map([
                    [5, 1],
                    [4, 0],
                    [3, 2],
                    [2, 3]
                ])
            );
            expect(bar[0].notes.every(n => n.accidentalMode === NoteAccidentalMode.Default)).toBe(true);

            expect(single(bar[1]).string).toBe(4);
            expect(single(bar[1]).fret).toBe(1);
            expect(single(bar[1]).accidentalMode).toBe(NoteAccidentalMode.ForceSharp);
            expect(single(bar[2]).string).toBe(4);
            expect(single(bar[2]).fret).toBe(3);
            expect(single(bar[2]).accidentalMode).toBe(NoteAccidentalMode.ForceFlat);
            expect(single(bar[3]).string).toBe(5);
            expect(single(bar[3]).fret).toBe(1);
            expect(single(bar[3]).accidentalMode).toBe(NoteAccidentalMode.ForceNatural);
        });

        it('notes-ties-rests', async () => {
            const score = await load('notes');
            const bar3 = beats(score, 2);
            const bar4 = beats(score, 3);
            expect(bar3.length).toBe(4);
            expect(bar4.length).toBe(4);

            expect(single(bar3[0]).isTieDestination).toBe(false);
            expect(single(bar3[1]).string).toBe(6);
            expect(single(bar3[1]).isTieDestination).toBe(true);
            expect(single(bar3[1]).tieOrigin).toBe(single(bar3[0]));
            expect(single(bar3[2]).string).toBe(4);
            expect(single(bar3[2]).fret).toBe(7);
            expect(single(bar3[3]).fret).toBe(7);
            expect(single(bar3[3]).isTieDestination).toBe(false);

            expect(single(bar4[0]).string).toBe(4);
            expect(single(bar4[0]).isTieDestination).toBe(true);
            expect(single(bar4[0]).tieOrigin).toBe(single(bar3[3]));

            expect(frets(bar4[1])).toEqual(
                new Map([
                    [6, 0],
                    [5, 1]
                ])
            );
            expect(bar4[1].notes.some(n => n.isTieDestination)).toBe(false);
            expect(noteOn(bar4[2], 6).isTieDestination).toBe(true);
            expect(noteOn(bar4[2], 6).tieOrigin).toBe(noteOn(bar4[1], 6));
            expect(noteOn(bar4[2], 5).isTieDestination).toBe(true);
            expect(noteOn(bar4[2], 5).tieOrigin).toBe(noteOn(bar4[1], 5));

            expect(bar4[3].isRest).toBe(true);
            expect(bar4[3].duration).toBe(Duration.Quarter);
        });

        it('notes-dynamics', async () => {
            const score = await load('notes');
            const bar = beats(score, 4);
            expect(bar.length).toBe(8);
            expect(bar.every(b => b.duration === Duration.Eighth)).toBe(true);
            expect(bar.map(b => b.dynamics)).toEqual([
                DynamicValue.FFF,
                DynamicValue.FF,
                DynamicValue.F,
                DynamicValue.MF,
                DynamicValue.MP,
                DynamicValue.P,
                DynamicValue.PP,
                DynamicValue.F
            ]);
            expect(bar.every(b => b.showDynamics === false)).toBe(true);
            expect(frets(bar[7])).toEqual(
                new Map([
                    [6, 5],
                    [5, 6]
                ])
            );
        });
    });

    it('score-info', async () => {
        const score = await load('score-info');
        // TablEdit 3.06 stores these texts as UTF-8
        expect(score.title).toBe('Title ÄÖÜ ß');
        expect(score.subTitle).toBe('Author Name');
        expect(score.instructions).toBe('Comment line');
        expect(score.notices).toBe('Note text');
        expect(score.copyright).toBe('(c) Copyright');
        expect(score.tempo).toBe(95);
        expect(score.masterBars[0].tempoAutomations.map(a => a.value)).toEqual([95]);
        expect(score.masterBars.length).toBe(2);
        expect(single(beats(score, 0)[0]).string).toBe(6);
        expect(single(beats(score, 0)[0]).fret).toBe(0);
        expect(single(beats(score, 0)[0]).realValue).toBe(64);
    });

    it('score-info-url', async () => {
        // score-info.tef with an internet link, re-saved in TablEdit; alphaTab has no field for it
        const score = await load('score-info-url');
        expect(score.title).toBe('Title ÄÖÜ ß');
        expect(score.subTitle).toBe('Author Name');
        expect(score.instructions).toBe('Comment line');
        expect(score.notices).toBe('Note text');
        expect(score.copyright).toBe('(c) Copyright');
        expect(toTex(score)).not.toContain('example.com');
    });

    describe('durations', () => {
        it('durations-plain', async () => {
            const score = await load('durations');
            expect(timeline(score, 0)).toEqual([[1, Duration.Whole, 0, 0]]);
            expect(timeline(score, 1)).toEqual([
                [1, Duration.Half, 0, 0],
                [2, Duration.Half, 0, 1920]
            ]);
            expect(timeline(score, 2)).toEqual([
                [1, Duration.Quarter, 0, 0],
                [2, Duration.Eighth, 0, 960],
                [3, Duration.Eighth, 0, 1440],
                [4, Duration.Sixteenth, 0, 1920],
                [5, Duration.Sixteenth, 0, 2160],
                [6, Duration.Sixteenth, 0, 2400],
                [7, Duration.Sixteenth, 0, 2640],
                [8, Duration.Quarter, 0, 2880]
            ]);
            expect(timeline(score, 3)).toEqual([
                [1, Duration.ThirtySecond, 0, 0],
                [2, Duration.ThirtySecond, 0, 120],
                [3, Duration.ThirtySecond, 0, 240],
                [4, Duration.ThirtySecond, 0, 360],
                [5, Duration.SixtyFourth, 0, 480],
                [6, Duration.SixtyFourth, 0, 540],
                [7, Duration.SixtyFourth, 0, 600],
                [8, Duration.SixtyFourth, 0, 660],
                [9, Duration.Sixteenth, 0, 720],
                [10, Duration.Quarter, 0, 960],
                [11, Duration.Half, 0, 1920]
            ]);
            for (let bar = 0; bar < 4; bar++) {
                expect(beats(score, bar).every(b => single(b).string === 6)).toBe(true);
            }
        });

        it('durations-dotted', async () => {
            const score = await load('durations');
            expect(timeline(score, 4)).toEqual([
                [1, Duration.Half, 1, 0],
                [2, Duration.Quarter, 0, 2880]
            ]);
            expect(timeline(score, 5)).toEqual([
                [1, Duration.Quarter, 1, 0],
                [2, Duration.Eighth, 0, 1440],
                [3, Duration.Quarter, 1, 1920],
                [4, Duration.Eighth, 0, 3360]
            ]);
            expect(timeline(score, 6)).toEqual([
                [1, Duration.Eighth, 1, 0],
                [2, Duration.Sixteenth, 0, 720],
                [3, Duration.Sixteenth, 1, 960],
                [4, Duration.ThirtySecond, 0, 1320],
                [5, Duration.ThirtySecond, 1, 1440],
                [6, Duration.SixtyFourth, 0, 1620],
                [7, Duration.Sixteenth, 0, 1680],
                [8, Duration.Half, 0, 1920]
            ]);
            expect(score.masterBars[7].timeSignatureNumerator).toBe(6);
            expect(score.masterBars[7].timeSignatureDenominator).toBe(4);
            expect(timeline(score, 7)).toEqual([[1, Duration.Whole, 1, 0]]);
        });

        it('durations-double-dotted', async () => {
            const score = await load('durations');
            expect(timeline(score, 8)).toEqual([
                [1, Duration.Half, 2, 0],
                [2, Duration.Eighth, 0, 3360]
            ]);
            expect(timeline(score, 9)).toEqual([
                [1, Duration.Quarter, 2, 0],
                [2, Duration.Sixteenth, 0, 1680],
                [3, Duration.Quarter, 2, 1920],
                [4, Duration.Sixteenth, 0, 3600]
            ]);
            // nothing entered between the 64th ending at 24/64 and the half at 32/64
            expect(timeline(score, 10)).toEqual([
                [1, Duration.Eighth, 2, 0],
                [2, Duration.ThirtySecond, 0, 840],
                [3, Duration.Sixteenth, 2, 960],
                [4, Duration.SixtyFourth, 0, 1380],
                ['r', Duration.Eighth, 0, 1440],
                [5, Duration.Half, 0, 1920]
            ]);
        });

        it('durations-off-grid', async () => {
            const score = await load('durations');
            const bar = timeline(score, 11);
            expect(bar[0]).toEqual([1, Duration.SixtyFourth, 1, 0]);
            // a dotted 64th ends between two grid slots, a 1/128 rest fills up to the next slot (D15)
            expect(bar[1]).toEqual(['r', Duration.OneHundredTwentyEighth, 0, 90]);
            expect(bar.slice(1, bar.length - 2).every(b => b[0] === 'r')).toBe(true);
            expect(bar.slice(bar.length - 2)).toEqual([
                [2, Duration.Quarter, 0, 960],
                [3, Duration.Half, 0, 1920]
            ]);
        });
    });

    describe('tuplets', () => {
        /**
         * Asserts tuplet beats on string 6 fret 5 that start at the given exact (rational) times; alphaTab
         * truncates tuplet ticks, so each preceding member of an inexact tuplet may shift a start by one tick.
         */
        function expectTuplets(bar: Beat[], expected: ExpectedTupletBeat[]) {
            expect(bar.length).toBe(expected.length);
            for (let i = 0; i < bar.length; i++) {
                const e = expected[i];
                expect(bar[i].duration, `beat ${i}`).toBe(e.duration);
                expect(tuplet(bar[i]), `beat ${i}`).toBe(e.ratio);
                expect(Math.abs(bar[i].playbackStart - e.start), `beat ${i} start`).toBeLessThanOrEqual(e.tolerance);
                expect(single(bar[i]).string).toBe(6);
                expect(single(bar[i]).fret).toBe(5);
            }
        }

        /**
         * `shifted` = truncated tuplet beats before the group, `exact` = the members' own ticks are whole.
         */
        function group(
            duration: Duration,
            ratio: string,
            from: number,
            step: number,
            count: number,
            exact = true,
            shifted = 0
        ) {
            const result: ExpectedTupletBeat[] = [];
            for (let i = 0; i < count; i++) {
                result.push(tupletBeat(duration, ratio, from + i * step, shifted + (exact ? 0 : i)));
            }
            return result;
        }

        function tupletBeat(duration: Duration, ratio: string, start: number, tolerance: number): ExpectedTupletBeat {
            return { duration, ratio, start, tolerance };
        }

        it('tuplets-triplets', async () => {
            const score = await load('tuplets');
            expectTuplets(beats(score, 0), [
                ...group(Duration.Eighth, '3:2', 0, 320, 6),
                ...group(Duration.Quarter, '3:2', 1920, 640, 3)
            ]);
            expectTuplets(beats(score, 1), [
                ...group(Duration.Sixteenth, '3:2', 0, 160, 6),
                ...group(Duration.Quarter, '', 960, 960, 3)
            ]);
            expectTuplets(beats(score, 2), group(Duration.Half, '3:2', 0, 1280, 3));
            expectTuplets(beats(score, 3), [
                ...group(Duration.ThirtySecond, '3:2', 0, 80, 3),
                tupletBeat(Duration.Sixteenth, '', 240, 0),
                tupletBeat(Duration.Eighth, '', 480, 0),
                tupletBeat(Duration.Quarter, '', 960, 0),
                tupletBeat(Duration.Half, '', 1920, 0)
            ]);
        });

        it('tuplets-other', async () => {
            const score = await load('tuplets');
            expectTuplets(beats(score, 4), [
                ...group(Duration.Sixteenth, '5:4', 0, 192, 5),
                ...group(Duration.Sixteenth, '7:4', 960, 960 / 7, 7, false),
                tupletBeat(Duration.Quarter, '', 1920, 7),
                tupletBeat(Duration.Quarter, '', 2880, 7)
            ]);
            expectTuplets(beats(score, 5), [
                ...group(Duration.ThirtySecond, '9:8', 0, 960 / 9, 9, false),
                ...group(Duration.ThirtySecond, '10:8', 960, 96, 10, true, 9),
                tupletBeat(Duration.Half, '', 1920, 9)
            ]);
        });

        it('tuplets-whole-triplet', async () => {
            const score = await load('tuplets');
            const bar = beats(score, 6);
            // the whole triplet ends at 2560 ticks, an eighth triplet rest fills up to the quarter (D15)
            expect(bar.map(b => [b.isRest, b.duration, tuplet(b), b.playbackStart])).toEqual([
                [false, Duration.Whole, '3:2', 0],
                [true, Duration.Eighth, '3:2', 2560],
                [false, Duration.Quarter, '', 2880]
            ]);
            expect(single(bar[0]).fret).toBe(5);
            expect(single(bar[2]).fret).toBe(5);
        });

        it('tuplets-connection-number', async () => {
            const score = await load('tuplets');
            // number 6 over 24 64ths: TablEdit spreads the 16ths at 0, 4, .. 20 by 8/6 and plays them as 6:4
            const bar = beats(score, 7);
            const notes = bar.filter(b => !b.isRest);
            expect(notes.map(b => [b.duration, tuplet(b), b.playbackStart])).toEqual(
                [0, 1, 2, 3, 4, 5].map(i => [Duration.Sixteenth, '6:4', i * 320])
            );
            for (const b of notes) {
                expect(single(b).string).toBe(5);
                expect(single(b).fret).toBe(5);
            }
            expect(bar.filter(b => b.isRest && b.playbackStart < 1920).map(b => [tuplet(b), b.playbackStart])).toEqual(
                [0, 1, 2, 3, 4, 5].map(i => ['6:4', i * 320 + 160])
            );
            // the connection is a slur with a number
            expect(single(notes[0]).slurDestination).toBe(single(notes[5]));
        });

        it('tuplets-connections', async () => {
            const score = await load('connections');
            const line = (bar: number) =>
                beats(score, bar).map(
                    b => [b.isRest ? 'r' : single(b).fret, b.duration, tuplet(b), b.playbackStart] as unknown[]
                );
            // bracket with number 3 over three 8ths: drawn only
            expect(line(0)).toEqual([
                [5, Duration.Eighth, '', 0],
                [7, Duration.Eighth, '', 480],
                [8, Duration.Eighth, '', 960],
                ['r', Duration.Eighth, '', 1440],
                [5, Duration.Quarter, '', 1920],
                [5, Duration.Quarter, '', 2880]
            ]);
            expect(beats(score, 0).some(b => b.notes.some(n => n.isSlurOrigin || n.isSlurDestination))).toBe(false);

            // slur with number 3 over 8ths on the grid of 16ths (0, 4, 8; length 12): m = 4, 3:2
            expect(line(1)).toEqual([
                [5, Duration.Eighth, '3:2', 0],
                [7, Duration.Eighth, '3:2', 320],
                [8, Duration.Eighth, '3:2', 640],
                [5, Duration.Quarter, '', 960],
                [5, Duration.Quarter, '', 1920],
                [5, Duration.Quarter, '', 2880]
            ]);
            expect(single(beats(score, 1)[0]).slurDestination).toBe(single(beats(score, 1)[2]));

            // number 4 over the 16ths at 0, 4, 8, 12 (length 15): m = 4, the notes keep their place and sound half as long
            expect(line(2)).toEqual([
                [5, Duration.Sixteenth, '4:2', 0],
                ['r', Duration.Sixteenth, '4:2', 120],
                [7, Duration.Sixteenth, '4:2', 240],
                ['r', Duration.Sixteenth, '4:2', 360],
                [8, Duration.Sixteenth, '4:2', 480],
                ['r', Duration.Sixteenth, '4:2', 600],
                [7, Duration.Sixteenth, '4:2', 720],
                ['r', Duration.ThirtySecond, '', 840],
                [5, Duration.Quarter, '', 960],
                [5, Duration.Quarter, '', 1920],
                [5, Duration.Quarter, '', 2880]
            ]);
            expect(single(beats(score, 2)[0]).slurDestination).toBe(single(beats(score, 2)[6]));
        });
    });

    it('voices', async () => {
        const score = await load('voices');
        const bars = score.tracks[0].staves[0].bars;
        expect(bars.every(b => b.voices.length === 4)).toBe(true);

        const upper = (bar: number) => beats(score, bar, 0);
        const automatic = (bar: number) => beats(score, bar, 1);
        const lower = (bar: number) => beats(score, bar, 2);
        const automatic2 = (bar: number) => beats(score, bar, 3);

        // bar 1: upper quarters, lower halves
        expect(upper(0).map(b => b.duration)).toEqual([
            Duration.Quarter,
            Duration.Quarter,
            Duration.Quarter,
            Duration.Quarter
        ]);
        expect(upper(0).map(b => single(b).string)).toEqual([6, 6, 6, 6]);
        expect(upper(0).map(b => single(b).fret)).toEqual([5, 7, 8, 7]);
        expect(upper(0).every(b => b.preferredBeamDirection === BeamDirection.Up)).toBe(true);
        expect(lower(0).map(b => b.duration)).toEqual([Duration.Half, Duration.Half]);
        expect(lower(0).map(b => single(b).string)).toEqual([2, 2]);
        expect(lower(0).map(b => single(b).fret)).toEqual([3, 2]);
        expect(lower(0).every(b => b.preferredBeamDirection === BeamDirection.Down)).toBe(true);
        expect(bars[0].voices[1].isEmpty).toBe(true);
        expect(bars[0].voices[3].isEmpty).toBe(true);

        // bar 2: automatic voices from different lengths at one position
        expect(automatic(1).map(b => b.duration)).toEqual([
            Duration.Quarter,
            Duration.Quarter,
            Duration.Quarter,
            Duration.Quarter
        ]);
        expect(automatic(1).map(b => single(b).string)).toEqual([5, 5, 5, 5]);
        expect(automatic(1).map(b => single(b).fret)).toEqual([1, 3, 1, 0]);
        expect(automatic(1).every(b => b.preferredBeamDirection === null)).toBe(true);
        expect(automatic2(1).map(b => b.duration)).toEqual([Duration.Half, Duration.Half]);
        expect(automatic2(1).map(b => [single(b).string, single(b).fret])).toEqual([
            [1, 0],
            [3, 2]
        ]);
        expect(bars[1].voices[0].isEmpty).toBe(true);
        expect(bars[1].voices[2].isEmpty).toBe(true);

        // bar 3: entered rest and empty column are both rests
        expect(automatic(2).map(b => b.duration)).toEqual([
            Duration.Quarter,
            Duration.Quarter,
            Duration.Quarter,
            Duration.Quarter
        ]);
        expect(automatic(2).map(b => b.isRest)).toEqual([true, false, true, false]);
        expect(single(automatic(2)[1]).string).toBe(6);
        expect(single(automatic(2)[3]).string).toBe(6);

        // bar 4: lower voice starting with an entered rest
        expect(upper(3).length).toBe(4);
        expect(upper(3).every(b => b.duration === Duration.Quarter && single(b).string === 6)).toBe(true);
        expect(upper(3).every(b => b.preferredBeamDirection === BeamDirection.Up)).toBe(true);
        expect(lower(3).map(b => b.duration)).toEqual([Duration.Half, Duration.Half]);
        expect(lower(3)[0].isRest).toBe(true);
        expect(single(lower(3)[1]).string).toBe(2);
        expect(single(lower(3)[1]).fret).toBe(3);
        expect(lower(3).every(b => b.preferredBeamDirection === BeamDirection.Down)).toBe(true);
    });

    describe('effects', () => {
        it('effects-note', async () => {
            const score = await load('effects-note');
            for (let bar = 0; bar < 6; bar++) {
                expect(beats(score, bar).length).toBe(4);
                expect(beats(score, bar).every(b => single(b).string === 6)).toBe(true);
            }

            const bar1 = beats(score, 0).map(b => single(b));
            expect(bar1.map(n => n.fret)).toEqual([5, 7, 7, 5]);
            expect(bar1.map(n => n.isHammerPullOrigin)).toEqual([true, false, true, false]);
            expect(bar1.map(n => n.isHammerPullDestination)).toEqual([false, true, false, true]);
            expect(bar1[0].hammerPullDestination).toBe(bar1[1]);
            expect(bar1[2].hammerPullDestination).toBe(bar1[3]);

            // a slide whose target carries a pick stroke strikes the target again
            const bar2 = beats(score, 1);
            expect(bar2.map(b => single(b).fret)).toEqual([5, 7, 5, 7]);
            expect(bar2.map(b => single(b).slideOutType)).toEqual([
                SlideOutType.Legato,
                SlideOutType.None,
                SlideOutType.Shift,
                SlideOutType.None
            ]);
            expect(bar2.map(b => b.pickStroke)).toEqual([
                PickStroke.None,
                PickStroke.None,
                PickStroke.None,
                PickStroke.Down
            ]);

            // the bend amount comes from the next note on the string, here fret 9 without a tie
            const bar3 = beats(score, 2).map(b => single(b));
            expect(bar3.map(n => n.fret)).toEqual([7, 9, 7, 7]);
            expect(bar3[0].bendType).toBe(BendType.Bend);
            expect(bendPoints(bar3[0])).toEqual([
                [0, 0],
                [60, 4]
            ]);
            expect(bar3[1].isTieDestination).toBe(false);
            expect(bendPoints(bar3[1])).toBe(null);
            expect(bar3[3].isTieDestination).toBe(true);
            expect(bar3[3].tieOrigin).toBe(bar3[2]);

            const bar4 = beats(score, 3).map(b => single(b));
            expect(bar4.map(n => n.fret)).toEqual([5, 12, 5, 5]);
            // choke without an amount: a quarter tone
            expect(bendPoints(bar4[0])).toEqual([
                [0, 0],
                [60, 1]
            ]);
            expect(bar4[1].harmonicType).toBe(HarmonicType.Natural);
            expect(bar4[1].harmonicValue).toBe(12);
            expect(bar4[2].harmonicType).toBe(HarmonicType.Artificial);
            expect(bar4[2].harmonicValue).toBe(12);
            expect(bar4.map(n => n.isPalmMute)).toEqual([false, false, false, true]);

            const bar5 = beats(score, 4);
            expect(bar5.map(b => b.tap)).toEqual([true, false, false, false]);
            expect(bar5.map(b => single(b).vibrato)).toEqual([
                VibratoType.None,
                VibratoType.Slight,
                VibratoType.None,
                VibratoType.None
            ]);
            expect(bar5.map(b => b.tremoloPicking?.marks ?? 0)).toEqual([0, 0, 3, 0]);
            expect(bar5.map(b => single(b).isDead)).toEqual([false, false, false, true]);

            const bar6 = beats(score, 5);
            expectNoNoteEffect(bar6[0]);
            expectNoNoteEffect(bar6[1]);
            // a bend towards the same fret has no amount
            expect(single(bar6[2]).fret).toBe(7);
            expect(bendPoints(single(bar6[2]))).toBe(null);
            expect(single(bar6[3]).isTieDestination).toBe(true);
            expect(single(bar6[3]).tieOrigin).toBe(single(bar6[2]));
        });

        it('effects-target-fret', async () => {
            const score = await load('effects-target');
            const bar1 = beats(score, 0);
            const bar2 = beats(score, 1);
            expect([...bar1, ...bar2].map(b => single(b).fret)).toEqual([7, 9, 5, 7, 7, 4, 5, 8]);
            expect([...bar1, ...bar2].every(b => !single(b).isTieDestination)).toBe(true);
            // bend + release from fret 7 towards the next note on the string, fret 9: 2 semitones
            expect(bendPoints(single(bar1[0]))).toEqual([
                [0, 0],
                [15, 4],
                [45, 4],
                [60, 0]
            ]);
            // tremolo bar up/down towards fret 7 (from 5) and fret 4 (from 7), dive-return towards fret 8 (from 5)
            expect(whammy(bar1[2])).toEqual([
                [0, 0],
                [30, 4],
                [60, 4]
            ]);
            expect(whammy(bar2[0])).toEqual([
                [0, 0],
                [30, -6],
                [60, -6]
            ]);
            expect(whammy(bar2[2])).toEqual([
                [0, 0],
                [30, 6],
                [60, 0]
            ]);
            for (const b of [bar1[1], bar1[3], bar2[1], bar2[3]]) {
                expectNoNoteEffect(b);
            }
        });

        it('effects-b5', async () => {
            const score = await load('effects-b5');
            const bar1 = beats(score, 0);
            expect(single(bar1[0]).isLetRing).toBe(true);
            expect(bar1[1].slap).toBe(true);
            expect(single(bar1[2]).isGhost).toBe(true);
            expect(single(bar1[3]).isStaccato).toBe(true);

            // tremolo bar up/down from fret 5 towards fret 3, dive-return from fret 5 towards fret 7
            const bar2 = beats(score, 1);
            expect(bar2.map(b => single(b).fret)).toEqual([5, 3, 5, 7]);
            expect(whammy(bar2[0])).toEqual([
                [0, 0],
                [30, -4],
                [60, -4]
            ]);
            expect(whammy(bar2[2])).toEqual([
                [0, 0],
                [30, 4],
                [60, 0]
            ]);
            for (const b of [bar2[1], bar2[3]]) {
                expect(single(b).isTieDestination).toBe(false);
                expectNoNoteEffect(b);
            }

            const bar3 = beats(score, 2);
            expect(bar3[0].fade).toBe(FadeType.FadeIn);
            expect(bar3[1].fade).toBe(FadeType.FadeOut);
            // ghost combination without a primary effect
            expect(single(bar3[2]).isGhost).toBe(true);
            expect(single(bar3[2]).slideOutType).toBe(SlideOutType.None);
            expectNoNoteEffect(bar3[3]);
        });

        it('effects-combination', async () => {
            const score = await load('effects-b5');
            const combined = [...beats(score, 3), ...beats(score, 4), ...beats(score, 5).slice(0, 2)];
            expect(combined.length).toBe(10);
            for (const b of combined) {
                expect(single(b).slideOutType).toBe(SlideOutType.Legato);
            }
            const n = combined.map(b => single(b));
            expect(n[0].isHammerPullOrigin).toBe(true);
            expect(n[1].isHammerPullOrigin).toBe(true);
            expect(combined[2].brushType).toBe(BrushType.ArpeggioDown);
            expect(combined[3].brushType).toBe(BrushType.BrushDown);
            expect(n[4].harmonicType).toBe(HarmonicType.Natural);
            expect(n[4].harmonicValue).toBe(5);
            expect(n[4].realValue).toBe(64 + 24);
            expect(n[5].harmonicType).toBe(HarmonicType.Artificial);
            expect(n[5].harmonicValue).toBe(12);
            expect(n[6].isLetRing).toBe(true);
            expect(n[7].isGhost).toBe(true);
            expect(n[8].isDead).toBe(true);
            // variation (D9): nothing besides the slide
            expect(n[9].isHammerPullOrigin).toBe(false);
            expect(n[9].harmonicType).toBe(HarmonicType.None);
            expect(n[9].isGhost || n[9].isDead || n[9].isLetRing).toBe(false);
            expect(combined[9].brushType).toBe(BrushType.None);

            for (const b of beats(score, 5).slice(2)) {
                expectNoNoteEffect(b);
            }
        });

        it('effects-b5-variants', async () => {
            // synthesized: B5 bytes TablEdit offers no input for, patched into the file
            const base = await loadData('effects-b5');
            {
                // staccato on the stem (variation of staccato) at 1.48
                const data = new Uint8Array(base);
                data[cellData(data, 48, 0) + 4] = 0xb7;
                const n = single(beats(readBytes(data), 0)[3]);
                expect(n.isStaccato).toBe(true);
                expect(n.isGhost || n.isLetRing || n.isDead).toBe(false);
            }
            {
                // ghost as primary and combination effect is no effect (D12) at 2.16
                const data = new Uint8Array(base);
                data[cellData(data, 64 + 16, 0) + 4] = 0x94;
                expectNoNoteEffect(beats(readBytes(data), 1)[1]);
            }
            {
                // tremolo bars whose next note on the string is on the same fret have no amount
                const data = new Uint8Array(base);
                data[cellData(data, 64 + 16, 0)] = 0x06;
                data[cellData(data, 64 + 48, 0)] = 0x06;
                for (const b of beats(readBytes(data), 1)) {
                    expect(single(b).fret).toBe(5);
                    expectNoNoteEffect(b);
                }
            }
        });

        it('effects-chord', async () => {
            const score = await load('effects-chord');
            const cChord = new Map([
                [5, 1],
                [4, 0],
                [3, 2],
                [2, 3]
            ]);
            const all = [...beats(score, 0), ...beats(score, 1)];
            expect(all.length).toBe(8);
            for (const b of all) {
                expect(frets(b)).toEqual(cChord);
            }

            const bar1 = beats(score, 0);
            expect(bar1[0].brushType).toBe(BrushType.BrushDown);
            expect(bar1[1].brushType).toBe(BrushType.BrushUp);
            expect(bar1[2].brushType).toBe(BrushType.ArpeggioDown);
            expect(bar1[3].brushType).toBe(BrushType.ArpeggioUp);
            // no speed entered: brush speed 1, roll speed 4; 5 TablEdit ticks (20 here) per step between the 4 strings
            expect(bar1.map(b => b.brushDuration)).toEqual([60, 60, 240, 240]);

            const bar2 = beats(score, 1);
            expect(bar2[0].rasgueado).toBe(Rasgueado.Ii);
            expect(bar2[0].brushType).toBe(BrushType.None);
            expectNoNoteEffect(bar2[1]);
            // roll combination without a primary effect
            expect(bar2[2].brushType).toBe(BrushType.ArpeggioDown);
            expect(bar2[2].brushDuration).toBe(240);
            expectNoNoteEffect(bar2[3]);
        });

        it('effects-chord-anticipated-roll', async () => {
            // synthesized: TablEdit stores Shift+R as the plain roll 0x30, the anticipated roll 0x37 is patched in
            const data = await loadData('effects-chord');
            data[cellData(data, 64 + 16, 4) + 4] = 0x37;
            const beat = beats(readBytes(data), 1)[1];
            // no roll that ends on the beat in alphaTab: a plain roll from the bass (D2)
            expect(beat.brushType).toBe(BrushType.ArpeggioDown);
            expect(beat.notes.length).toBe(4);
            expect(beat.notes.some(n => n.isStaccato)).toBe(false);
        });

        it('effects-pitch-change', async () => {
            const score = await load('effects-parameters');
            const bar = beats(score, 0);
            expect(bar.map(b => single(b).fret)).toEqual([5, 5, 5, 5]);
            expect(bendPoints(single(bar[0]))).toEqual([
                [0, 2],
                [60, 2]
            ]);
            expect(bendPoints(single(bar[1]))).toEqual([
                [0, 4],
                [60, 4]
            ]);
            expect(bendPoints(single(bar[2]))).toEqual([
                [0, 6],
                [60, 6]
            ]);
            // no downward bends in alphaTab
            expect(bendPoints(single(bar[3]))).toBe(null);
        });

        it('effects-parameters', async () => {
            const score = await load('effects-parameters');

            // artificial harmonic interval 0xBn in B4, or in B5 when B4 is 0
            const bar2 = beats(score, 1);
            expect(bar2.map(b => single(b).harmonicType)).toEqual([
                HarmonicType.Artificial,
                HarmonicType.Artificial,
                HarmonicType.Artificial,
                HarmonicType.Artificial
            ]);
            expect(bar2.map(b => single(b).harmonicValue)).toEqual([3, 5, 7, 7]);

            const bar3 = beats(score, 2);
            expect(single(bar3[0]).bendType).toBe(BendType.Bend);
            expect(bendPoints(single(bar3[0]))).toEqual([
                [0, 0],
                [60, 3]
            ]);
            expect(single(bar3[1]).vibrato).toBe(VibratoType.Slight);
            expect(bar3[2].tremoloPicking!.marks).toBe(3);
            expect(bar3[3].duration).toBe(Duration.Eighth);
            expect(single(bar3[3]).slideOutType).toBe(SlideOutType.Legato);
            expect(single(bar3[4]).fret).toBe(7);

            const bar4 = beats(score, 3);
            expect(bar4.map(b => b.duration)).toEqual([Duration.Quarter, Duration.Quarter, Duration.Half]);
            expect(bar4.map(b => b.isRest)).toEqual([false, true, true]);
            expect(frets(bar4[0])).toEqual(
                new Map([
                    [5, 1],
                    [4, 0],
                    [3, 2],
                    [2, 3]
                ])
            );
            expect(bar4[0].brushType).toBe(BrushType.ArpeggioDown);
            // roll parameter 0x08: offset 8 for the symbol, speed bits 0, i.e. speed 4
            expect(bar4[0].brushDuration).toBe(240);
        });

        it('effects-speed', async () => {
            // effects-chord.tef with speed parameters, re-saved in TablEdit
            const score = await load('effects-speed');
            const bar1 = beats(score, 0);
            const bar2 = beats(score, 1);
            expect([...bar1, bar2[2]].map(b => b.brushType)).toEqual([
                BrushType.BrushDown,
                BrushType.BrushUp,
                BrushType.ArpeggioDown,
                BrushType.ArpeggioUp,
                BrushType.ArpeggioDown
            ]);
            // brush 0x20: speed 3; brush 0x00: 1; roll 0x30: 7; roll 0x50: 1 (roll speeds 1-3 follow 8);
            // roll combination 0x02: 2; 20 ticks per speed step between each of the 4 strings
            expect([...bar1, bar2[2]].map(b => b.brushDuration)).toEqual([180, 60, 420, 60, 120]);
        });
    });

    describe('grace', () => {
        it('grace-notes', async () => {
            const score = await load('grace');
            const bar1 = beats(score, 0);
            expect(bar1.length).toBe(8);
            const graces = [bar1[0], bar1[2], bar1[4], bar1[6]];
            const mains = [bar1[1], bar1[3], bar1[5], bar1[7]];
            for (const main of mains) {
                expect(main.graceType).toBe(GraceType.None);
                expect(main.duration).toBe(Duration.Quarter);
                expect(single(main).string).toBe(5);
                expect(single(main).fret).toBe(5);
                expect(single(main).realValue).toBe(64);
            }
            // the grace duration is alphaTab's own (D4)
            for (const grace of graces) {
                expect(single(grace).string).toBe(5);
                expect(single(grace).fret).toBe(3);
            }
            expect(graces.map(g => g.graceType)).toEqual([
                GraceType.OnBeat,
                GraceType.OnBeat,
                GraceType.OnBeat,
                GraceType.BeforeBeat
            ]);
            expect(single(graces[0]).isHammerPullOrigin).toBe(true);
            expect(single(graces[1]).slideOutType).toBe(SlideOutType.Legato);
            expect(single(graces[2]).bendType).toBe(BendType.Bend);
            expect(bendPoints(single(graces[2]))).toEqual([
                [0, 0],
                [60, 4]
            ]);
            expect(single(graces[3]).isHammerPullOrigin).toBe(true);

            const bar2 = beats(score, 1);
            expect(bar2.map(b => b.graceType)).toEqual([
                GraceType.OnBeat,
                GraceType.None,
                GraceType.OnBeat,
                GraceType.None,
                GraceType.None,
                GraceType.None
            ]);
            // own grace duration 1/16 (D4: not representable)
            expect(single(bar2[0]).fret).toBe(3);
            expect(single(bar2[0]).isHammerPullOrigin).toBe(true);
            // grace from string row 2: its fret is the fret on that string, slurred to the main note
            expect(single(bar2[2]).string).toBe(4);
            expect(single(bar2[2]).fret).toBe(3);
            expect(single(bar2[2]).isHammerPullOrigin).toBe(false);
            expect(single(bar2[2]).slurDestination).toBe(single(bar2[3]));
            for (const main of [bar2[1], bar2[3], bar2[4], bar2[5]]) {
                expect(main.duration).toBe(Duration.Quarter);
                expect(single(main).string).toBe(5);
                expect(single(main).fret).toBe(5);
            }
            expect(bar2[4].notes[0].isHammerPullOrigin).toBe(false);
        });

        it('grace-from-string', async () => {
            const score = await load('grace-string');
            const bar = beats(score, 0);
            // hammer-on graces (fret 3) to B-string notes (fret 5), from string 3 (G) and from string 1 (e);
            // TablEdit shows the stored fret on the other string
            expect(bar.map(b => [b.graceType, single(b).string, single(b).fret])).toEqual([
                [GraceType.OnBeat, 4, 3],
                [GraceType.None, 5, 5],
                [GraceType.None, 5, 5],
                [GraceType.OnBeat, 6, 3],
                [GraceType.None, 5, 5],
                [GraceType.None, 5, 5]
            ]);
            expect(single(bar[0]).realValue).toBe(58);
            expect(single(bar[3]).realValue).toBe(67);
            // alphaTab keeps hammer-ons on one string, the slur TablEdit draws remains
            const pairs: [Beat, Beat][] = [
                [bar[0], bar[1]],
                [bar[3], bar[4]]
            ];
            for (const [grace, main] of pairs) {
                expect(single(grace).isHammerPullOrigin).toBe(false);
                expect(single(grace).slurDestination).toBe(single(main));
                expect(single(main).isSlurDestination).toBe(true);
            }
        });

        it('grace-variants', async () => {
            const score = await load('grace-x');
            const bar1 = beats(score, 0);
            // the grace dialog's "None" removes the grace (1.0, 1.16, 1.32); a grace on fret 33 before fret 35
            expect(bar1.map(b => [b.graceType, single(b).string, single(b).fret])).toEqual([
                [GraceType.None, 5, 5],
                [GraceType.None, 5, 5],
                [GraceType.None, 5, 5],
                [GraceType.OnBeat, 5, 33],
                [GraceType.None, 5, 35]
            ]);
            expect(single(bar1[3]).isHammerPullOrigin).toBe(true);

            // mordent, double and gruppetto on fret 5 with the auxiliary fret 7 (above) and 3 (below)
            const ornaments = [...beats(score, 1), ...beats(score, 2)];
            expect(ornaments.map(b => [b.graceType, single(b).fret, single(b).ornament])).toEqual([
                [GraceType.None, 5, NoteOrnament.UpperMordent],
                [GraceType.None, 5, NoteOrnament.LowerMordent],
                [GraceType.None, 5, NoteOrnament.Turn],
                [GraceType.None, 5, NoteOrnament.InvertedTurn],
                [GraceType.None, 5, NoteOrnament.Turn],
                [GraceType.None, 5, NoteOrnament.InvertedTurn],
                [GraceType.None, 5, NoteOrnament.None],
                [GraceType.None, 5, NoteOrnament.None]
            ]);
        });

        it('grace-kind-0', async () => {
            // grace-x.tef with graces of kind 0 (no articulation), re-saved in TablEdit: fret 3, the main fret 5, fret 0
            const score = await load('grace-kind0');
            const bar1 = beats(score, 0);
            // TablEdit's notation leaves out the grace on the main fret
            expect(bar1.map(b => [b.graceType, single(b).fret])).toEqual([
                [GraceType.OnBeat, 3],
                [GraceType.None, 5],
                [GraceType.None, 5],
                [GraceType.OnBeat, 0],
                [GraceType.None, 5],
                [GraceType.OnBeat, 33],
                [GraceType.None, 35]
            ]);
            expectNoNoteEffect(bar1[0]);
            expectNoNoteEffect(bar1[3]);
        });

        it('grace-ornaments', async () => {
            const score = await load('grace');
            const bar = beats(score, 2);
            expect(bar.length).toBe(4);
            expect(bar.every(b => b.graceType === GraceType.None && b.duration === Duration.Quarter)).toBe(true);
            expect(bar.every(b => single(b).string === 5 && single(b).fret === 5)).toBe(true);
            // the mordent's auxiliary fret 3 lies below the main fret; double and gruppetto were entered with
            // the first auxiliary note below (fret 3) and the second on the main fret
            expect(single(bar[0]).ornament).toBe(NoteOrnament.LowerMordent);
            expect(single(bar[1]).ornament).toBe(NoteOrnament.InvertedTurn);
            expect(single(bar[2]).ornament).toBe(NoteOrnament.InvertedTurn);
            expect(single(bar[3]).ornament).toBe(NoteOrnament.None);
            expect(single(bar[3]).isTrill).toBe(true);
            expect(single(bar[3]).trillFret).toBe(3);
        });
    });

    it('fingering-strokes', async () => {
        const score = await load('fingering');
        const all = [0, 1, 2, 3, 4].flatMap(b => beats(score, b));
        expect(all.length).toBe(20);
        const n = all.map(b => single(b));
        expect(n.every(x => x.string === 6 && x.fret === 5)).toBe(true);

        expect(all.map(b => b.pickStroke)).toEqual([
            PickStroke.Down,
            PickStroke.Up,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.Up,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None,
            PickStroke.None
        ]);
        expect(n.map(x => x.leftHandFinger)).toEqual([
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Thumb,
            Fingers.IndexFinger,
            Fingers.MiddleFinger,
            Fingers.AnnularFinger,
            Fingers.LittleFinger,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.MiddleFinger,
            Fingers.IndexFinger,
            Fingers.Unknown,
            Fingers.IndexFinger,
            Fingers.Unknown
        ]);
        expect(n.map(x => x.rightHandFinger)).toEqual([
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Unknown,
            Fingers.Thumb,
            Fingers.IndexFinger,
            Fingers.MiddleFinger,
            Fingers.AnnularFinger,
            Fingers.LittleFinger,
            Fingers.AnnularFinger,
            Fingers.MiddleFinger,
            Fingers.Unknown,
            Fingers.IndexFinger,
            Fingers.Unknown,
            Fingers.Unknown
        ]);
    });

    it('note-attributes', async () => {
        const score = await load('attributes');
        const bar1 = beats(score, 0);
        // hidden in notation: the staff shows tablature, B5 0x0F is no effect
        expect(single(bar1[0]).isVisible).toBe(true);
        expectNoNoteEffect(bar1[0]);
        // the third beat is excluded from beaming, so neither it nor the beat before it beams on;
        // the "no stem" attribute of the second beat has no model
        expect(bar1[0].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(bar1[1].beamingMode).toBe(BeatBeamingMode.ForceSplitToNext);
        expect(bar1[2].beamingMode).toBe(BeatBeamingMode.ForceSplitToNext);
        expect(bar1[3].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(bar1.map(b => b.ottava)).toEqual([Ottavia.Regular, Ottavia.Regular, Ottavia.Regular, Ottavia._8vb]);

        const bar2 = beats(score, 1);
        expect(bar2[0].ottava).toBe(Ottavia._8va);
        // move left / right are layout offsets
        expect(bar2.map(b => b.playbackStart)).toEqual([0, quarter, 2 * quarter, 3 * quarter]);
        expect(bar2[1].ottava).toBe(Ottavia.Regular);
        expect(bar2[2].ottava).toBe(Ottavia.Regular);
        expect(bar2[3].isRest).toBe(true);
        // hidden in notation only, the tablature still shows it
        expect(bar2[3].isEmpty).toBe(false);

        const bar3 = beats(score, 2);
        expect(bar3.map(b => b.duration)).toEqual([
            Duration.Sixteenth,
            Duration.Sixteenth,
            Duration.Sixteenth,
            Duration.Sixteenth,
            Duration.Quarter,
            Duration.Half
        ]);
        expect(bar3.map(b => b.isRest)).toEqual([false, false, true, false, true, false]);
        // secondary beam break on the rest splits the secondary beam before it
        expect(bar3[1].beamingMode).toBe(BeatBeamingMode.ForceSplitOnSecondaryToNext);
        expect(bar3[0].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(bar3[3].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(bar3.some(b => b.notes.some(x => x.isStaccato))).toBe(false);
        // hidden in tablature only, the notation still shows it
        expect(bar3[4].isEmpty).toBe(false);

        // tie slur up and down are layout only
        const bar4 = beats(score, 3);
        expect(bar4.map(b => [b.duration, single(b).string, single(b).fret])).toEqual([
            [Duration.Quarter, 6, 5],
            [Duration.Quarter, 6, 5],
            [Duration.Quarter, 6, 5],
            [Duration.Quarter, 6, 5]
        ]);
        expect(bar4.map(b => single(b).isTieDestination)).toEqual([false, true, false, true]);
        expect(single(bar4[1]).tieOrigin).toBe(single(bar4[0]));
        expect(single(bar4[3]).tieOrigin).toBe(single(bar4[2]));
        for (const b of bar4) {
            expect(single(b).isVisible).toBe(true);
            expect(b.isEmpty).toBe(false);
            expect(b.beamingMode).toBe(BeatBeamingMode.Auto);
            expect(b.ottava).toBe(Ottavia.Regular);
            expectNoNoteEffect(b);
        }
    });

    describe('instruments', () => {
        it('instruments-midi', async () => {
            const score = await load('instruments');
            expect(score.tracks.length).toBe(2);
            const lead = score.tracks[0];
            const clarinet = score.tracks[1];
            expect(lead.name).toBe('Lead Guitar');
            // entered as "Lead Guitar^Ld"
            expect(lead.shortName).toBe('Ld');
            // module 2 was added as a copy of module 1 and renamed, its abbreviation removed
            expect(clarinet.name).toBe('Clarinet');
            // no abbreviation: alphaTab's own short name
            expect(clarinet.shortName).toBe('Clarinet');
            for (const track of score.tracks) {
                expect(track.playbackInfo.program).toBe(29);
                expect(track.playbackInfo.bank).toBe(0);
                // pan and volume not entered: TablEdit's centre pan 7 of 0-15 and no attenuation
                expect(track.playbackInfo.balance).toBe(7);
                expect(track.playbackInfo.volume).toBe(16);
                const staff = track.staves[0];
                // the capo is folded into the stored tuning
                expect(staff.capo).toBe(2);
                expect(staff.tuning).toEqual([64, 59, 55, 50, 45, 40]);
            }

            const leadBar = lead.staves[0].bars[0].voices[0].beats;
            expect(leadBar.map(b => b.isRest).slice(0, 2)).toEqual([false, false]);
            expect(leadBar.slice(2).every(b => b.isRest)).toBe(true);
            expect(single(leadBar[0]).string).toBe(1);
            expect(single(leadBar[0]).fret).toBe(0);
            expect(single(leadBar[0]).realValue).toBe(42);
            expect(single(leadBar[1]).string).toBe(6);
            expect(single(leadBar[1]).fret).toBe(0);
            expect(single(leadBar[1]).realValue).toBe(66);
            expect(leadBar[1].playbackStart).toBe(quarter);

            // the strings of module 2 follow the six strings of module 1
            const clarinetBar = clarinet.staves[0].bars[0].voices[0].beats;
            expect(single(clarinetBar[0]).string).toBe(6);
            expect(single(clarinetBar[0]).fret).toBe(3);
            expect(clarinetBar.slice(1).every(b => b.isRest)).toBe(true);

            // the Let Ring option of the module rings every note
            for (const track of score.tracks) {
                for (const bar of track.staves[0].bars) {
                    for (const b of bar.voices[0].beats) {
                        expect(b.notes.every(n => n.isLetRing)).toBe(true);
                    }
                }
            }
        });

        it('instruments-notation', async () => {
            const score = await load('instruments');
            const lead = score.tracks[0];
            const clarinet = score.tracks[1];
            // guitar: written an octave higher; middle C standard and B flat: written a major second higher
            expect(lead.staves[0].displayTranspositionPitch).toBe(-12);
            expect(clarinet.staves[0].displayTranspositionPitch).toBe(-2);
            for (const track of score.tracks) {
                expect(track.staves[0].showTablature).toBe(true);
                expect(track.staves[0].showStandardNotation).toBe(true);
            }
            // key +1 in bar 1; the B flat instrument shows two sharps more (D11)
            expect(lead.staves[0].bars.map(b => b.keySignature)).toEqual([1, 0]);
            expect(clarinet.staves[0].bars.map(b => b.keySignature)).toEqual([3, 2]);

            // the text was entered on module 2 only
            const texts = (track: number) =>
                score.tracks[track].staves[0].bars.flatMap(b => b.voices[0].beats.map(x => x.text));
            expect(texts(0).every(t => t === null)).toBe(true);
            const clarinetBar = clarinet.staves[0].bars[0].voices[0].beats;
            expect(clarinetBar[1].playbackStart).toBe(quarter);
            expect(clarinetBar[1].text).toBe('Second');
            expect(clarinetBar.map(b => b.text).filter(t => t !== null).length).toBe(1);
        });

        it('instruments-clefs', async () => {
            const score = await load('instruments-patched');
            expect(score.tracks.length).toBe(10);
            // auto, G, F, baritone F, tenor C, alto C, mezzo-soprano C, soprano C (nearest alphaTab clefs),
            // auto on a bass tuning, and clef 2 with bit 4 set
            expect(score.tracks.map(t => t.staves[0].bars[0].clef)).toEqual([
                Clef.G2,
                Clef.G2,
                Clef.F4,
                Clef.F4,
                Clef.C4,
                Clef.C3,
                Clef.C3,
                Clef.C3,
                Clef.F4,
                Clef.F4
            ]);
            for (const track of score.tracks) {
                const first = track.staves[0].bars[0].voices[0].beats[0];
                expect(single(first).string).toBe(1);
                expect(single(first).fret).toBe(0);
            }
        });

        it('instruments-tuning', async () => {
            const score = await load('instruments-patched');
            const tuning = (track: number) => score.tracks[track].staves[0].tuning;
            const lowest = (track: number) => single(score.tracks[track].staves[0].bars[0].voices[0].beats[0]);
            expect(tuning(0)).toEqual([64, 59, 55, 50, 45, 40]);
            expect(lowest(0).realValue).toBe(40);
            // drop D
            expect(tuning(1)).toEqual([64, 59, 55, 50, 45, 38]);
            expect(lowest(1).realValue).toBe(38);
            expect(tuning(8)).toEqual([43, 38, 33, 28, 23, 18]);
            expect(lowest(8).realValue).toBe(18);
            for (const track of [2, 3, 4, 5, 6, 7, 9]) {
                expect(tuning(track)).toEqual([64, 59, 55, 50, 45, 40]);
            }
        });

        it('instruments-dulcimer', async () => {
            // notes.tef with the module renamed "Dulcimer", re-saved in TablEdit: TablEdit shows the stored frets
            // 0, 3, 12, 24 as the dulcimer frets 0, 1+, 7, 14, so they are semitones
            const score = await load('notes-dulcimer');
            expect(score.tracks[0].name).toBe('Dulcimer');
            expect(beats(score, 0).map(b => [single(b).string, single(b).fret, single(b).realValue])).toEqual([
                [1, 0, 40],
                [2, 3, 48],
                [3, 12, 62],
                [6, 24, 88]
            ]);
        });

        it('drums', async () => {
            const score = await load('drums');
            const staff = score.tracks[0].staves[0];
            expect(staff.isPercussion).toBe(true);
            expect(staff.bars[0].clef).toBe(Clef.Neutral);
            const bar = beats(score, 0);
            expect(bar.map(b => [b.isRest, b.duration, b.playbackStart])).toEqual([
                [false, Duration.Quarter, 0],
                [false, Duration.Quarter, quarter],
                [false, Duration.Quarter, 2 * quarter],
                // the drum event marker plays a key of its own, no note
                [true, Duration.Quarter, 3 * quarter]
            ]);
            // GM key = 96 - tuning byte of the line + fret: lines 0, 2 and 4 are 35, 42, 39
            const key = (b: Beat) =>
                score.tracks[0].percussionArticulations[single(b).percussionArticulation].outputMidiNumber;
            expect(bar.slice(0, 3).map(key)).toEqual([61, 54, 60]);
        });
    });

    it('drums-grace', async () => {
        // drums.tef (8 lines) with a grace on fret 2 before its first note: a flam on the same drum line
        const data = await loadData('drums');
        let p = u32(data, cellsPointer);
        while ((data[p + 4] & 0x3f) === 0 || (data[p + 4] & 0x3f) >= 0x33) {
            p += cellSize;
        }
        data[p + 4] |= 0x40;
        data[p + 7] = 0x02;
        const line = Math.floor(u32(data, p) / 8) % 8;
        // GM key = 96 - tuning byte of the line + fret
        const pitch = 96 - data[u32(data, instrumentsPointer) + 4 + 20 + line];
        const score = readBytes(data);
        const grace = beats(score, 0)[0];
        expect(grace.graceType).toBe(GraceType.OnBeat);
        const note = single(grace);
        expect(score.tracks[0].percussionArticulations[note.percussionArticulation].outputMidiNumber).toBe(pitch + 2);
    });

    describe('bars', () => {
        it('bars-time-key', async () => {
            const score = await load('bars');
            expect(score.masterBars.map(m => [m.timeSignatureNumerator, m.timeSignatureDenominator])).toEqual([
                [4, 4],
                [3, 4],
                [6, 8],
                [2, 2],
                [5, 4],
                [3, 8],
                [17, 4]
            ]);
            const bars = score.tracks[0].staves[0].bars;
            expect(bars.map(b => b.keySignature)).toEqual([0, 3, -2, -1, 7, -7, 0]);
            expect(bars.map(b => b.keySignatureType)).toEqual([
                KeySignatureType.Major,
                KeySignatureType.Major,
                KeySignatureType.Minor,
                KeySignatureType.Major,
                KeySignatureType.Major,
                KeySignatureType.Minor,
                KeySignatureType.Major
            ]);
            expect(score.masterBars[2].tripletFeel).toBe(TripletFeel.NoTripletFeel);
            for (const bar of bars) {
                const first = bar.voices[0].beats[0];
                expect(first.duration).toBe(Duration.Quarter);
                expect(single(first).string).toBe(6);
                expect(single(first).fret).toBe(0);
                expect(bar.voices[0].beats.slice(1).every(b => b.isRest)).toBe(true);
                const m = bar.masterBar;
                expect(bar.calculateDuration()).toBe(
                    (m.timeSignatureNumerator * 4 * quarter) / m.timeSignatureDenominator
                );
            }
            expect(bars[6].calculateDuration()).toBe(17 * quarter);
        });

        it('bars-pickup', async () => {
            const score = await load('bars-flags');
            expect(score.masterBars[0].isAnacrusis).toBe(true);
            const pickup = beats(score, 0);
            expect(pickup.length).toBe(1);
            expect(pickup[0].duration).toBe(Duration.Quarter);
            expect(single(pickup[0]).string).toBe(6);
            expect(single(pickup[0]).fret).toBe(0);
            expect(beats(score, 1)[0].absolutePlaybackStart).toBe(quarter);
            expect(score.masterBars.slice(1).some(m => m.isAnacrusis)).toBe(false);
        });

        it('bars-pickup-trailing-rests', async () => {
            // healthy.tef with bar 1 a pick-up and its notes at 1.32 and 1.48 turned into rests: the pick-up
            // lasts from 1.0 to the end of the quarter at 1.16
            const data = await loadHealthy();
            data[u32(data, measuresPointer) + 8] |= 0x08;
            data[cellData(data, 32, 3)] = 0x33;
            data[cellData(data, 48, 0)] = 0x33;
            const score = readBytes(data);
            expect(timeline(score, 0)).toEqual([
                [0, Duration.Quarter, 0, 0],
                [3, Duration.Quarter, 0, quarter]
            ]);
            expect(beats(score, 1)[0].absolutePlaybackStart).toBe(2 * quarter);
        });

        it('bars-flags', async () => {
            const score = await load('bars-flags');
            // hidden time signature: still read
            expect(score.masterBars[3].timeSignatureNumerator).toBe(3);
            expect(score.masterBars[3].timeSignatureDenominator).toBe(4);
            expect(beats(score, 3).length).toBe(3);

            // free bar: eighths beamed over the whole bar
            expect(score.masterBars[4].beamingRules!.groups.get(Duration.Eighth)).toEqual([8]);
            for (const index of [1, 2, 3, 5, 6, 7]) {
                expect(score.masterBars[index].beamingRules, `bar ${index}`).toBeUndefined();
            }

            const bars = score.tracks[0].staves[0].bars;
            for (let i = 1; i < 8; i++) {
                expect(score.masterBars[i].isFreeTime).toBe(false);
                expect(bars[i].barLineLeft).toBe(BarLineStyle.Automatic);
                expect(bars[i].barLineRight).toBe(BarLineStyle.Automatic);
                const bar = beats(score, i);
                expect(bar.length).toBe(i === 3 ? 3 : 4);
                expect(bar.every(b => b.duration === Duration.Quarter && single(b).fret === 5)).toBe(true);
            }
        });
    });

    describe('markers', () => {
        it('markers-text', async () => {
            const score = await load('markers-text-chords');
            const text = (bar: number) => beats(score, bar).map(b => b.text);
            expect(text(0)).toEqual([null, 'Intro', 'Bold', null]);
            // % and 0x texts are commands
            expect(text(1).every(t => t === null)).toBe(true);
            // a text starting with > is lyrics from its beat on
            // two texts on one beat (rows 0 and 2)
            expect(text(2)).toEqual([null, 'One Two', null, null]);
            expect(beats(score, 2).map(b => b.lyrics)).toEqual([null, null, ['la'], ['la']]);
            // a marker between two beats belongs to the beat before it
            expect(text(3)).toEqual(['Mid', null, null, null]);
        });

        it('markers-chords', async () => {
            const score = await load('markers-text-chords');
            const staff = score.tracks[0].staves[0];
            expect(staff.chords!.size).toBe(3);

            const am = beats(score, 0)[0];
            expect(am.chord!.name).toBe('Am');
            expect(am.chord!.strings).toEqual([0, 1, 2, 2, 0, -1]);
            expect(am.chord!.firstFret).toBe(1);
            expect(frets(am)).toEqual(
                new Map([
                    [5, 1],
                    [4, 2],
                    [3, 2],
                    [2, 0]
                ])
            );

            const c = beats(score, 1)[0];
            expect(c.chord!.name).toBe('C');
            expect(c.chord!.strings).toEqual([0, 1, 0, 2, 3, -1]);
            expect(c.chord!.firstFret).toBe(1);

            const xpos = beats(score, 2)[0];
            expect(xpos.chord!.name).toBe('Xpos');
            expect(xpos.chord!.strings).toEqual([5, 6, 6, 6, 5, 0]);
            expect(xpos.chord!.firstFret).toBe(5);

            for (let bar = 0; bar < 4; bar++) {
                expect(
                    beats(score, bar)
                        .slice(1)
                        .every(b => b.chordId === null)
                ).toBe(true);
            }
            expect(beats(score, 3)[0].chordId).toBe(null);
        });

        it('markers-line-breaks', async () => {
            const score = await load('markers-layout');
            // line breaks after bars 2, 4 (with page break) and 6 (with double bar); the one in the last bar has no effect
            expect(Array.from(score.tracks[0].lineBreaks!).sort()).toEqual([2, 4, 6]);
            expect(score.masterBars.map(m => m.isDoubleBar)).toEqual([
                false,
                false,
                false,
                false,
                false,
                true,
                false,
                false,
                false
            ]);
        });

        it('markers-measures-per-line', async () => {
            const score = await load('markers-layout-mpl');
            // as markers-layout plus a line break with 2 measures per line in bar 7; bars 8 and 9 then form the
            // last line, so the break of bar 7 is the only one the setting adds here
            expect(Array.from(score.tracks[0].lineBreaks!).sort()).toEqual([2, 4, 6, 7]);
            expect(score.masterBars.map(m => m.isDoubleBar)).toEqual([
                false,
                false,
                false,
                false,
                false,
                true,
                false,
                false,
                false
            ]);
            for (let bar = 0; bar < 9; bar++) {
                const b = beats(score, bar);
                expect(b.length).toBe(4);
                const markerBar = bar === 1 || bar === 3 || bar === 5 || bar === 6 || bar === 8;
                expect(single(b[0]).string).toBe(markerBar ? 5 : 6);
                expect(b.every(x => single(x).fret === 5)).toBe(true);
            }
        });

        it('markers-dynamics', async () => {
            const score = await load('markers-playback');
            const bar1 = beats(score, 0);
            const bar2 = beats(score, 1);
            for (const b of [...bar1, ...bar2]) {
                expect(b.duration).toBe(Duration.Eighth);
                expect(single(b).fret).toBe(5);
            }
            // accent at 1.8
            expect(bar1.map(b => single(b).accentuated)).toEqual([
                AccentuationType.None,
                AccentuationType.Normal,
                AccentuationType.None,
                AccentuationType.None,
                AccentuationType.None,
                AccentuationType.None,
                AccentuationType.None,
                AccentuationType.None
            ]);
            expect(bar2.every(b => single(b).accentuated === AccentuationType.None)).toBe(true);
            // crescendo 1.16 for 16/64, decrescendo 2.0 for 32/64
            expect(bar1.map(b => b.crescendo)).toEqual([
                CrescendoType.None,
                CrescendoType.None,
                CrescendoType.Crescendo,
                CrescendoType.Crescendo,
                CrescendoType.None,
                CrescendoType.None,
                CrescendoType.None,
                CrescendoType.None
            ]);
            expect(bar2.map(b => b.crescendo)).toEqual([
                CrescendoType.Decrescendo,
                CrescendoType.Decrescendo,
                CrescendoType.Decrescendo,
                CrescendoType.Decrescendo,
                CrescendoType.None,
                CrescendoType.None,
                CrescendoType.None,
                CrescendoType.None
            ]);
        });

        it('markers-upper-voice', async () => {
            // the notes of bar 2 forced into the upper voice: its markers and lyrics stay on its beats, and the
            // other bars keep theirs on the automatic voice, which follows the upper one; alphaTab puts the initial
            // instrument on the first beat of the first voice
            const markersOf = (b: Beat) =>
                `${b.text}|${b.chord ? b.chord.name : ''}|${b.lyrics ? b.lyrics.join('/') : ''}|${b.crescendo}|` +
                `${b.fermata !== null}|${b.pickStroke}|` +
                `${b.voice.bar.index > 0 ? b.automations.map(a => a.value).join(',') : ''}|` +
                b.notes.map(n => `${n.accentuated}:${n.isSlurOrigin}:${n.isSlurDestination}`).join(',');
            for (const name of ['markers-text-chords', 'markers-playback', 'lyrics', 'fermata']) {
                const original = readBytes(await loadData(name));
                const upper = readBytes(withUpperVoice(await loadData(name), 1));
                for (let bar = 0; bar < original.masterBars.length; bar++) {
                    expect(beats(upper, bar, bar === 1 ? 0 : 1).map(markersOf), `${name} bar ${bar}`).toEqual(
                        beats(original, bar).map(markersOf)
                    );
                }
            }
        });

        it('markers-across-barlines', async () => {
            // healthy.tef: a slur at 1.48 over 32 64ths and a crescendo at 1.32 over 64 64ths
            const score = readBytes(
                withCells(await loadHealthy(), [
                    [48, 1, [0x3d, 31]],
                    [32, 1, [0x38, 0, 64, 0, 0, 0, 16]]
                ])
            );
            const bar1 = beats(score, 0);
            const bar2 = beats(score, 1);
            expect(single(bar1[3]).slurDestination!.beat).toBe(bar2[0]);
            expect(bar1.map(b => b.crescendo)).toEqual([
                CrescendoType.None,
                CrescendoType.None,
                CrescendoType.Crescendo,
                CrescendoType.Crescendo
            ]);
            expect(bar2.map(b => b.crescendo)).toEqual([
                CrescendoType.Crescendo,
                CrescendoType.Crescendo,
                CrescendoType.None,
                CrescendoType.None
            ]);
        });

        it('markers-tempo-at-start', async () => {
            // healthy.tef with a tempo marker of 90 at 1.0: it replaces the header tempo
            const score = readBytes(withCells(await loadHealthy(), [[0, 1, [0xfe, 90, 0, 0]]]));
            expect(score.masterBars[0].tempoAutomations.map(a => [a.value, a.ratioPosition] as number[])).toEqual([
                [90, 0]
            ]);
            expect(score.tempo).toBe(90);
        });

        it('markers-tempo-ramp-from-pickup', async () => {
            // healthy.tef with bar 1 a pick-up from 1.32 (its notes at 1.0 and 1.16 turned into rests) and a tempo
            // marker at 1.48 going from 120 to 160 within four quarters
            const data = await loadHealthy();
            data[u32(data, measuresPointer) + 8] |= 0x08;
            data[cellData(data, 0, 5)] = 0x33;
            data[cellData(data, 16, 4)] = 0x33;
            const score = readBytes(withCells(data, [[48, 1, [0xfe, 160, 0, 4]]]));
            const tempo = (bar: number) =>
                score.masterBars[bar].tempoAutomations.map(a => [a.value, a.ratioPosition] as number[]);
            expect(tempo(0)).toEqual([
                [120, 0],
                [130, 0.5]
            ]);
            expect(tempo(1)).toEqual([
                [140, 0],
                [150, 0.25],
                [160, 0.5]
            ]);
        });

        it('markers-tempo', async () => {
            const score = await load('markers-playback');
            const tempo = (bar: number) =>
                score.masterBars[bar].tempoAutomations.map(a => [a.value, a.ratioPosition, a.isVisible] as unknown[]);
            // header tempo 120
            expect(score.tempo).toBe(120);
            expect(tempo(0)).toEqual([[120, 0, true]]);
            expect(tempo(1).length).toBe(0);
            expect(tempo(2)).toEqual([
                [80, 0, true],
                [120, 0.5, true]
            ]);
            // 120 to 60 within two quarters, 60 to 100 within four quarters: one hidden step per quarter
            expect(tempo(3)).toEqual([
                [90, 0, true],
                [60, 0.25, false]
            ]);
            expect(tempo(4)).toEqual([
                [70, 0, true],
                [80, 0.25, false],
                [90, 0.5, false],
                [100, 0.75, false]
            ]);
            for (let bar = 5; bar < 14; bar++) {
                expect(tempo(bar).length, `bar ${bar}`).toBe(0);
            }
        });

        it('markers-syncopation', async () => {
            const expected = (header: TripletFeel) => [
                header,
                header,
                header,
                header,
                header,
                // +1, +3, -2
                TripletFeel.Triplet8th,
                TripletFeel.Dotted8th,
                TripletFeel.Scottish8th,
                // +2 in 6/8: no swing in compound metres, it carries on in the 4/4 bars after it
                TripletFeel.NoTripletFeel,
                TripletFeel.Triplet8th,
                TripletFeel.Triplet8th,
                TripletFeel.Triplet8th,
                TripletFeel.Triplet8th,
                TripletFeel.Triplet8th
            ];
            const score = await load('markers-playback');
            expect(score.masterBars[8].timeSignatureNumerator).toBe(6);
            expect(score.masterBars[8].timeSignatureDenominator).toBe(8);
            expect(beats(score, 8).map(b => b.duration)).toEqual([
                Duration.Quarter,
                Duration.Quarter,
                Duration.Quarter
            ]);
            expect(score.masterBars.map(m => m.tripletFeel)).toEqual(expected(TripletFeel.NoTripletFeel));
            // header syncopation +1
            const syncope = await load('markers-playback-syncope');
            expect(syncope.masterBars.map(m => m.tripletFeel)).toEqual(expected(TripletFeel.Triplet8th));
        });

        it('markers-patch', async () => {
            const score = await load('markers-playback');
            const automations = (bar: number) =>
                beats(score, bar).map(b => b.automations.map(a => [a.type as number, a.value] as number[]));
            expect(automations(10)).toEqual([[[AutomationType.Instrument, 29]], [], [], []]);
            expect(single(beats(score, 10)[0]).string).toBe(5);
            expect(automations(0)[0]).toEqual([[AutomationType.Instrument, 25]]);
            for (const bar of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13]) {
                expect(
                    automations(bar).every(a => a.length === 0),
                    `bar ${bar}`
                ).toBe(true);
            }
        });

        it('markers-symbols-connections', async () => {
            const score = await load('markers-playback');
            // a musical symbol other than the fermata
            expect(beats(score, 11).every(b => b.fermata === null)).toBe(true);
            expect(single(beats(score, 11)[1]).string).toBe(5);

            // slur connection at 13.0 over 40/64: from the first note of 13.0 to the note at 13.32
            const bar13 = beats(score, 12);
            const origin = single(bar13[0]);
            const destination = single(bar13[2]);
            expect(origin.string).toBe(5);
            expect(destination.string).toBe(6);
            expect(origin.isSlurOrigin).toBe(true);
            expect(origin.slurDestination).toBe(destination);
            expect(destination.isSlurDestination).toBe(true);
            expect(destination.slurOrigin).toBe(origin);
            expect(single(bar13[1]).isSlurOrigin || single(bar13[1]).isSlurDestination).toBe(false);
            expect(single(bar13[3]).isSlurOrigin || single(bar13[3]).isSlurDestination).toBe(false);

            for (const bar of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13]) {
                for (const b of beats(score, bar)) {
                    expect(
                        b.notes.some(n => n.isSlurOrigin || n.isSlurDestination),
                        `bar ${bar}`
                    ).toBe(false);
                }
            }
        });

        it('markers-fermata', async () => {
            const score = await load('fermata');
            // symbols 0x6B and 0x6C of the Musical Symbols list at 1.16 and 1.48
            expect(beats(score, 0).map(b => (b.fermata ? b.fermata.type : null) as FermataType | null)).toEqual([
                null,
                FermataType.Medium,
                null,
                FermataType.Medium
            ]);
            expect(beats(score, 1).every(b => b.fermata === null)).toBe(true);
        });

        it('markers-line-break-options', async () => {
            // line break at 2.0 with truncate, time signature, indent 2 and spacing; one with justify, which TablEdit
            // stores on the last 64th of its bar (3.63)
            const score = await load('line-breaks');
            expect(Array.from(score.tracks[0].lineBreaks!).sort()).toEqual([2, 3]);
            expect(score.masterBars.map(m => m.timeSignatureNumerator)).toEqual([4, 4, 4, 4]);
            expect(score.masterBars.every(m => !m.isDoubleBar)).toBe(true);
            for (let bar = 0; bar < 4; bar++) {
                expect(timeline(score, bar)).toEqual([[5, Duration.Whole, 0, 0]]);
            }
        });

        it('markers-patched', async () => {
            // byte patches of TablEdit-made accents, re-saved in TablEdit
            const score = await load('markers-patched');
            const bar1 = beats(score, 0);
            const bar2 = beats(score, 1);
            for (const b of [...bar1, ...bar2]) {
                expect(single(b).fret).toBe(5);
                expect(b.duration).toBe(Duration.Quarter);
                expect(b.notes[0].accentuated).toBe(AccentuationType.None);
                expect(b.text).toBe(null);
                expect(b.beamingMode).toBe(BeatBeamingMode.Auto);
            }
            // 1.0 standalone down stroke
            expect(bar1.map(b => b.pickStroke)).toEqual([
                PickStroke.Down,
                PickStroke.None,
                PickStroke.None,
                PickStroke.None
            ]);
            // 1.16 scale diagram, 1.32 beam break, 1.48 stem length, 2.0 special character: not read
            expect(bar1.slice(1).every(b => b.fermata === null && b.chordId === null)).toBe(true);
            // 2.16 fermata held for 32 64ths: the hold is not read (D7)
            expect(bar2.map(b => (b.fermata ? b.fermata.type : null) as FermataType | null)).toEqual([
                null,
                FermataType.Medium,
                null,
                null
            ]);

            // 3.0 grace with a choke on its main note; the choke amount 3 comes from the extension record
            const bar3 = beats(score, 2);
            expect(bar3[0].graceType).toBe(GraceType.OnBeat);
            expect(single(bar3[0]).fret).toBe(3);
            expect(bendPoints(single(bar3[1]))).toEqual([
                [0, 0],
                [60, 3]
            ]);
            // 3.32 spacing record: not read
            expect(timeline(score, 2).slice(2)).toEqual([
                [5, Duration.Quarter, 0, 960],
                [5, Duration.Quarter, 0, 1920],
                [5, Duration.Quarter, 0, 2880]
            ]);
        });

        it('markers-layout', async () => {
            const score = await load('markers-layout');
            for (let bar = 0; bar < 9; bar++) {
                const b = beats(score, bar);
                expect(b.length).toBe(4);
                expect(b.every(x => x.duration === Duration.Quarter && single(x).fret === 5)).toBe(true);
                const markerBar = bar === 1 || bar === 3 || bar === 5 || bar === 8;
                expect(single(b[0]).string).toBe(markerBar ? 5 : 6);
                expect(b.every(x => x.text === null && x.chordId === null)).toBe(true);
                expect(b.map(x => x.automations.map(a => [a.type, a.value]))).toEqual(
                    bar === 0 ? [[[AutomationType.Instrument, 25]], [], [], []] : [[], [], [], []]
                );
            }
        });
    });

    it('lyrics', async () => {
        const score = await load('lyrics');
        const lyrics = (bar: number) => beats(score, bar).map(b => b.lyrics);
        expect(lyrics(0)).toEqual([['Hel-', 'Verse'], ['lo', 'two'], ['my-'], ['world']]);
        // rest and tie destination get no syllable
        expect(lyrics(1)).toEqual([['New York'], ['a'], null, null]);
        expect(beats(score, 1)[2].isRest).toBe(true);
        expect(single(beats(score, 1)[3]).isTieDestination).toBe(true);
        // grace beat first, then the main note
        expect(beats(score, 2)[0].graceType).toBe(GraceType.OnBeat);
        expect(lyrics(2)).toEqual([null, ['gain'], ['sec-'], ['ond'], ['']]);
        expect(lyrics(3)).toEqual([['line'], null, null, null]);

        const chord = beats(score, 2)[2].chord!;
        expect(chord.name).toBe('C');
        expect(chord.showDiagram).toBe(false);
    });

    it('lyrics-sections', async () => {
        // lyrics.tef with two sections for the module ("One two", then "Five six seven"), re-saved in TablEdit,
        // which shows only the first
        const score = await load('lyrics-sections2');
        expect(beats(score, 0).map(b => b.lyrics)).toEqual([['One'], ['two'], null, null]);
        for (let bar = 1; bar < 4; bar++) {
            expect(beats(score, bar).every(b => b.lyrics === null)).toBe(true);
        }
    });

    describe('reading-list', () => {
        it('reading-list-voltas', async () => {
            const score = await load('reading-list-voltas');
            expect([0, 1, 2, 3, 4, 5, 6, 7].map(b => single(beats(score, b)[0]).fret)).toEqual([
                1, 2, 3, 4, 5, 6, 7, 8
            ]);
            expect(TefReadingList.playbackOrder(score, 100)).toEqual([0, 1, 2, 3, 4, 5, 1, 2, 3, 6, 7]);
            expect(score.masterBars.map(m => m.isRepeatStart)).toEqual([
                false,
                true,
                false,
                false,
                false,
                false,
                false,
                false
            ]);
            expect(score.masterBars.map(m => m.repeatCount)).toEqual([0, 0, 0, 0, 0, 2, 0, 0]);
            expect(score.masterBars.map(m => m.alternateEndings)).toEqual([0, 0, 0, 0, 1, 1, 2, 2]);
            expect(score.masterBars.every(m => !m.directions || m.directions.size === 0)).toBe(true);
        });

        /**
         * A reading list block with the given 1-based entries.
         */
        function readingListBlock(entries: [number, number][]): Uint8Array {
            const recordSize = 32;
            const block = new Uint8Array(4 + entries.length * recordSize);
            setU16(block, 0, recordSize);
            setU16(block, 2, entries.length);
            for (let i = 0; i < entries.length; i++) {
                const p = 4 + i * recordSize;
                setU16(block, p, entries[i][0]);
                setU16(block, p + 2, entries[i][1]);
            }
            return block;
        }

        async function withReadingList(entries: [number, number][]): Promise<Score> {
            return readBytes(
                withBlock(await loadData('reading-list-voltas'), readingListPointer, readingListBlock(entries))
            );
        }

        it('reading-list-labels', async () => {
            const score = await load('reading-list');
            expect(
                [0, 1, 2, 3, 4, 5, 6, 7].map(b => {
                    const beat = beats(score, b);
                    return [beat.length, beat[0].duration, single(beat[0]).fret];
                })
            ).toEqual([1, 2, 3, 4, 5, 6, 7, 8].map(f => [1, Duration.Whole, f]));
            const items = [
                [1, 2],
                [3, 4],
                [5, 6],
                [7, 7],
                [8, 8]
            ].map(range => {
                const item = new TefReadingListItem();
                item.first = range[0] - 1;
                item.last = range[1] - 1;
                return item;
            });
            expect(TefReadingList.verify(score, items)).toBe(true);
            // a label starting with a space is hidden
            expect(score.masterBars.map(m => m.section?.text ?? null)).toEqual([
                'Intro',
                null,
                'Verse',
                null,
                null,
                null,
                'Outro',
                null
            ]);
            expect(TefReadingList.playbackOrder(score, 100)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
            expect(score.masterBars.some(m => m.isRepeatStart || m.repeatCount > 0 || m.alternateEndings > 0)).toBe(
                false
            );
        });

        it('reading-list-label-before-first-bar', async () => {
            // the first entry of reading-list.tef, labelled 'Intro', moved to the non-existing bar 0: the list
            // stops before it and the label is not shown
            const data = await loadData('reading-list');
            setU16(data, u32(data, readingListPointer) + 4, 0);
            const score = readBytes(data);
            expect(score.masterBars.map(m => m.section?.text ?? null)).toEqual([
                null,
                null,
                'Verse',
                null,
                null,
                null,
                'Outro',
                null
            ]);
            expect(TefReadingList.playbackOrder(score, 100)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
        });

        it('reading-guides-no-list', async () => {
            const data = await loadData('reading-guides');
            setU16(data, u32(data, readingListPointer) + 2, 0);
            const score = readBytes(data);
            expect(score.masterBars.map(m => m.isRepeatStart)).toEqual([
                true,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false
            ]);
            expect(score.masterBars.map(m => m.repeatCount)).toEqual([0, 0, 2, 0, 0, 0, 0, 0, 0]);
            expect(score.masterBars.map(m => m.alternateEndings)).toEqual([0, 0, 0b01, 0b10, 0, 0, 0, 0, 0]);
            expect(score.masterBars.map(m => directionsOf(m))).toEqual([
                [],
                [],
                [],
                [],
                [Direction.TargetSegno],
                [Direction.TargetFine],
                [Direction.JumpDaCoda],
                [Direction.JumpDalSegno],
                [Direction.TargetCoda]
            ]);
        });

        it('reading-guides-linear-list', async () => {
            // with a reading list TablEdit plays the list, the guides are display only (D3)
            const score = await load('reading-guides');
            expect(
                [0, 1, 2, 3, 4, 5, 6, 7, 8].map(b => {
                    const beat = beats(score, b);
                    return [beat.length, beat[0].duration, single(beat[0]).string, single(beat[0]).fret];
                })
            ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9].map(f => [1, Duration.Whole, 5, f]));
            expect(TefReadingList.playbackOrder(score, 100)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
            expect(
                score.masterBars.some(
                    m => m.isRepeatStart || m.repeatCount > 0 || m.alternateEndings > 0 || (m.directions?.size ?? 0) > 0
                )
            ).toBe(false);
        });

        it('reading-list-second-segno', async () => {
            // 1-4, 3-4, 5-6, 3-4, 7-10, 8-9, 12-14 over 14 bars
            const score = await load('reading-list-segno');
            const order = [0, 1, 2, 3, 2, 3, 4, 5, 2, 3, 6, 7, 8, 9, 7, 8, 11, 12, 13];
            expect(TefReadingList.playbackOrder(score, 100)).toEqual(order);
            const directions = new Map<number, Direction[]>([
                [2, [Direction.TargetSegno]],
                [3, [Direction.JumpDaCoda]],
                [5, [Direction.JumpDalSegnoAlCoda]],
                [6, [Direction.TargetCoda]],
                [7, [Direction.TargetSegnoSegno]],
                [8, [Direction.JumpDaDoubleCoda]],
                [9, [Direction.JumpDalSegnoSegnoAlDoubleCoda]],
                [11, [Direction.TargetDoubleCoda]]
            ]);
            for (const m of score.masterBars) {
                expect(directionsOf(m), `bar ${m.index}`).toEqual(directions.get(m.index) ?? []);
                expect(m.isRepeatStart, `bar ${m.index}`).toBe(m.index === 2);
                expect(m.repeatCount, `bar ${m.index}`).toBe(m.index === 3 ? 2 : 0);
            }
        });

        const range = (from: number, to: number) => {
            const result: number[] = [];
            for (let i = from; i <= to; i++) {
                result.push(i);
            }
            return result;
        };

        const structures: Record<string, ReadingListStructure> = {
            'S1 repeat': {
                list: [
                    [1, 2],
                    [1, 2],
                    [3, 8]
                ],
                tablEdit: [0, 1, 0, 1, ...range(2, 7)],
                repeatStart: [0],
                repeatCount: [[1, 2]]
            },
            'S2 repeat three times at the end': {
                list: [
                    [1, 6],
                    [7, 8],
                    [7, 8],
                    [7, 8]
                ],
                tablEdit: [...range(0, 7), 6, 7, 6, 7],
                repeatStart: [6],
                repeatCount: [[7, 3]]
            },
            'S3 three passes before contiguous bars': {
                list: [
                    [1, 2],
                    [1, 2],
                    [1, 2],
                    [3, 8]
                ],
                tablEdit: [0, 1, 0, 1, 0, 1, ...range(2, 7)],
                repeatStart: [0],
                repeatCount: [[1, 3]]
            },
            'S4 repeat not at bar 1': {
                list: [
                    [1, 3],
                    [2, 8]
                ],
                tablEdit: [0, 1, 2, 1, 2, ...range(3, 7)],
                repeatStart: [1],
                repeatCount: [[2, 2]]
            },
            'S5 two repeats': {
                list: [
                    [1, 3],
                    [2, 5],
                    [4, 8]
                ],
                tablEdit: [0, 1, 2, 1, 2, 3, 4, 3, 4, 5, 6, 7],
                repeatStart: [1, 3],
                repeatCount: [
                    [2, 2],
                    [4, 2]
                ]
            },
            'S6 alternate endings': {
                list: [
                    [1, 6],
                    [2, 4],
                    [7, 8]
                ],
                tablEdit: [0, 1, 2, 3, 4, 5, 1, 2, 3, 6, 7],
                repeatStart: [1],
                repeatCount: [[5, 2]],
                endings: [
                    [4, 1],
                    [5, 1],
                    [6, 2],
                    [7, 2]
                ]
            },
            'S7 da capo al coda': {
                list: [
                    [1, 2],
                    [1, 2],
                    [3, 4],
                    [1, 2],
                    [5, 8]
                ],
                tablEdit: [0, 1, 0, 1, 2, 3, 0, 1, 4, 5, 6, 7],
                repeatStart: [0],
                repeatCount: [[1, 2]],
                directions: [
                    [1, [Direction.JumpDaCoda]],
                    [3, [Direction.JumpDaCapoAlCoda]],
                    [4, [Direction.TargetCoda]]
                ]
            },
            'S8 da capo al fine': {
                list: [
                    [1, 2],
                    [1, 2],
                    [3, 8],
                    [1, 2]
                ],
                tablEdit: [0, 1, 0, 1, ...range(2, 7), 0, 1],
                repeatStart: [0],
                repeatCount: [[1, 2]],
                directions: [
                    [1, [Direction.TargetFine]],
                    [7, [Direction.JumpDaCapoAlFine]]
                ]
            },
            'S9 dal segno al coda': {
                list: [
                    [1, 3],
                    [2, 3],
                    [4, 5],
                    [2, 3],
                    [6, 8]
                ],
                tablEdit: [0, 1, 2, 1, 2, 3, 4, 1, 2, 5, 6, 7],
                repeatStart: [1],
                repeatCount: [[2, 2]],
                directions: [
                    [1, [Direction.TargetSegno]],
                    [2, [Direction.JumpDaCoda]],
                    [4, [Direction.JumpDalSegnoAlCoda]],
                    [5, [Direction.TargetCoda]]
                ]
            },
            'S10 dal segno al fine': {
                list: [
                    [1, 3],
                    [2, 3],
                    [4, 8],
                    [2, 4]
                ],
                tablEdit: [0, 1, 2, 1, 2, ...range(3, 7), 1, 2, 3],
                repeatStart: [1],
                repeatCount: [[2, 2]],
                directions: [
                    [1, [Direction.TargetSegno]],
                    [3, [Direction.TargetFine]],
                    [7, [Direction.JumpDalSegnoAlFine]]
                ]
            },
            'S11 last bar beyond the piece': {
                list: [
                    [1, 2],
                    [1, 2],
                    [3, 99]
                ],
                tablEdit: [0, 1, 0, 1, ...range(2, 7)],
                repeatStart: [0],
                repeatCount: [[1, 2]]
            },
            'S12 skipped bar': {
                list: [
                    [1, 2],
                    [4, 8]
                ],
                tablEdit: [0, 1, ...range(3, 7)],
                alphaTab: range(0, 7)
            },
            'S13 late start': {
                list: [[2, 8]],
                tablEdit: range(1, 7),
                alphaTab: range(0, 7)
            },
            'S14 early stop': {
                list: [[1, 4]],
                tablEdit: range(0, 3),
                alphaTab: range(0, 7)
            },
            'S15 invalid entry ends the list': {
                list: [
                    [1, 2],
                    [1, 2],
                    [0, 0],
                    [3, 8]
                ],
                tablEdit: [0, 1, 0, 1],
                alphaTab: [0, 1, 0, 1, ...range(2, 7)],
                repeatStart: [0],
                repeatCount: [[1, 2]]
            },
            'S16 linear': {
                list: [[1, 8]],
                tablEdit: range(0, 7)
            }
        };

        it('reading-list-structures', async () => {
            for (const [name, s] of Object.entries(structures)) {
                const score = await withReadingList(s.list);
                const items = s.list.map(entry => {
                    const item = new TefReadingListItem();
                    item.first = entry[0] - 1;
                    item.last = entry[1] - 1;
                    return item;
                });
                expect(TefReadingList.playbackOrder(score, 100), name).toEqual(s.alphaTab ?? s.tablEdit);
                expect(TefReadingList.verify(score, items), name).toBe(s.alphaTab === undefined);

                const repeatCount = s.repeatCount ? new Map(s.repeatCount) : new Map<number, number>();
                const endings = s.endings ? new Map(s.endings) : new Map<number, number>();
                const directions = s.directions ? new Map(s.directions) : new Map<number, Direction[]>();
                for (const m of score.masterBars) {
                    const label = `${name} bar ${m.index}`;
                    expect(m.isRepeatStart, label).toBe((s.repeatStart ?? []).includes(m.index));
                    expect(m.repeatCount, label).toBe(repeatCount.get(m.index) ?? 0);
                    expect(m.alternateEndings, label).toBe(endings.get(m.index) ?? 0);
                    expect(directionsOf(m).sort(), label).toEqual((directions.get(m.index) ?? []).slice().sort());
                }
            }
        });
    });
});
