import { MusicXmlImporter } from '@coderline/alphatab/importer/MusicXmlImporter';
import { UnsupportedFormatError } from '@coderline/alphatab/importer/UnsupportedFormatError';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { Bar } from '@coderline/alphatab/model/Bar';
import { Beat } from '@coderline/alphatab/model/Beat';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { MasterBar } from '@coderline/alphatab/model/MasterBar';
import { Note } from '@coderline/alphatab/model/Note';
import type { Score } from '@coderline/alphatab/model/Score';
import { Staff } from '@coderline/alphatab/model/Staff';
import { Track } from '@coderline/alphatab/model/Track';
import { Voice } from '@coderline/alphatab/model/Voice';
import { Settings } from '@coderline/alphatab/Settings';
import { assert } from 'chai';
import { ComparisonHelpers } from 'test/model/ComparisonHelpers';
import { TestPlatform } from 'test/TestPlatform';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from 'test/visualTests/VisualTestHelper';

/**
 * @internal
 */
export class MusicXmlImporterTestHelper {
    public static async loadFile(file: string): Promise<Score> {
        const fileData = await TestPlatform.loadFile(file);
        const reader: MusicXmlImporter = new MusicXmlImporter();
        reader.init(ByteBuffer.fromBuffer(fileData), new Settings());
        return reader.readScore();
    }

    public static prepareImporterWithBytes(buffer: Uint8Array, settings?: Settings): MusicXmlImporter {
        const readerBase: MusicXmlImporter = new MusicXmlImporter();
        readerBase.init(ByteBuffer.fromBuffer(buffer), settings ?? new Settings());
        return readerBase;
    }

    public static async testReferenceFile(
        file: string,
        render: boolean = true,
        renderAllTracks: boolean = true,
        prepare: ((settings: Settings) => void) | null = null
    ): Promise<Score> {
        const fileData = await TestPlatform.loadFile(file);
        let score: Score;
        const settings = new Settings();
        try {
            const importer: MusicXmlImporter = MusicXmlImporterTestHelper.prepareImporterWithBytes(fileData, settings);
            score = importer.readScore();
        } catch (e) {
            if (e instanceof UnsupportedFormatError) {
                assert.fail(`Failed to load file ${file}: ${e}`);
            }
            throw e;
        }

        // send it to serializer once and check equality
        try {
            const expectedJson = JsonConverter.scoreToJsObject(score);

            const deserialized = JsonConverter.jsObjectToScore(expectedJson, settings);
            const actualJson = JsonConverter.scoreToJsObject(deserialized);

            ComparisonHelpers.expectJsonEqual(expectedJson, actualJson, `<${file}>`, null);
        } catch (e) {
            assert.fail((e as Error).message + (e as Error).stack);
        }

        if (render) {
            settings.display.justifyLastSystem = score.masterBars.length > 4;
            if (score.tracks.some(t => t.systemsLayout.length > 0)) {
                settings.display.layoutMode = LayoutMode.Parchment;
            }

            prepare?.(settings);
            const testOptions = new VisualTestOptions(
                score,
                [new VisualTestRun(1300, TestPlatform.changeExtension(file, '.png'))],
                settings
            );

            if (renderAllTracks) {
                testOptions.tracks = score.tracks.map(t => t.index);
            }

            await VisualTestHelper.runVisualTestFull(testOptions);
        }

        return score;
    }

    protected static getHierarchy(node: unknown): string {
        const note: Note | null = node instanceof Note ? node : null;
        if (note) {
            return `${MusicXmlImporterTestHelper.getHierarchy(note.beat)}Note[${note.index}]`;
        }
        const beat: Beat | null = node instanceof Beat ? node : null;
        if (beat) {
            return `${MusicXmlImporterTestHelper.getHierarchy(beat.voice)}Beat[${beat.index}]`;
        }
        const voice: Voice | null = node instanceof Voice ? node : null;
        if (voice) {
            return `${MusicXmlImporterTestHelper.getHierarchy(voice.bar)}Voice[${voice.index}]`;
        }
        const bar: Bar | null = node instanceof Bar ? node : null;
        if (bar) {
            return `${MusicXmlImporterTestHelper.getHierarchy(bar.staff)}Bar[${bar.index}]`;
        }
        const staff: Staff | null = node instanceof Staff ? node : null;
        if (staff) {
            return `${MusicXmlImporterTestHelper.getHierarchy(staff.track)}Staff[${staff.index}]`;
        }
        const track: Track | null = node instanceof Track ? node : null;
        if (track) {
            return `Track[${track.index}]`;
        }
        const mb: MasterBar | null = node instanceof MasterBar ? node : null;
        if (mb) {
            return `MasterBar[${mb.index}]`;
        }
        return 'unknown';
    }
}
