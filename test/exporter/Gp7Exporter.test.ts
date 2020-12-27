import { Gp7Importer } from '@src/importer/Gp7Importer';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import { Gp7Exporter } from '@src/exporter/Gp7Exporter';
import { JsonConverter } from '@src/model/JsonConverter';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { ComparisonHelpers } from '@test/model/ComparisonHelpers';

describe('Gp7ExporterTest', () => {
    const loadScore: (name: string) => Promise<Score | null> = async (name: string): Promise<Score | null> => {
        const data = await TestPlatform.loadFile('test-data/' + name);
        try {
            return ScoreLoader.loadScoreFromBytes(data);
        }
        catch (e) {
            return null;
        }
    };

    const prepareGp7ImporterWithBytes: (buffer: Uint8Array) => Gp7Importer = (buffer: Uint8Array): Gp7Importer => {
        let readerBase: Gp7Importer = new Gp7Importer();
        readerBase.init(ByteBuffer.fromBuffer(buffer), new Settings());
        return readerBase;
    };

    const exportGp7: (score: Score) => Uint8Array = (score: Score): Uint8Array => {
        return new Gp7Exporter().export(score, null);
    };

    const testRoundTripEqual: (name: string) => Promise<void> = async (name: string): Promise<void> => {
        try {
            const expected = await loadScore(name);
            if (!expected) {
                return;
            }

            const fileName = name.substr(name.lastIndexOf('/') + 1);
            const exported = exportGp7(expected);

            await TestPlatform.saveFile(fileName, exported);

            const actual = prepareGp7ImporterWithBytes(exported).readScore();

            const expectedJson = JsonConverter.scoreToJsObject(expected);
            const actualJson = JsonConverter.scoreToJsObject(actual)

            ComparisonHelpers.expectJsonEqual(expectedJson, actualJson, '<' + fileName + '>');
        } catch (e) {
            fail(e);
        }
    };

    const testRoundTripFolderEqual: (name: string) => Promise<void> = async (name: string): Promise<void> => {
        const files: string[] = await TestPlatform.listDirectory(`test-data/${name}`);
        for (const file of files) {
            await testRoundTripEqual(`${name}/${file}`);
        }
    };

    // Note: we just test all our importer and visual tests to cover all features

    it('importer', async () => {
        await testRoundTripFolderEqual('guitarpro7');
    });

    it('visual-effects-and-annotations', async () => {
        await testRoundTripFolderEqual('visual-tests/effects-and-annotations');
    });

    it('visual-general', async () => {
        await testRoundTripFolderEqual('visual-tests/general');
    });

    it('visual-guitar-tabs', async () => {
        await testRoundTripFolderEqual('visual-tests/guitar-tabs');
    });

    it('visual-layout', async () => {
        await testRoundTripFolderEqual('visual-tests/layout');
    });

    it('visual-music-notation', async () => {
        await testRoundTripFolderEqual('visual-tests/music-notation');
    });

    it('visual-notation-legend', async () => {
        await testRoundTripFolderEqual('visual-tests/notation-legend');
    });

    it('visual-special-notes', async () => {
        await testRoundTripFolderEqual('visual-tests/special-notes');
    });

    it('visual-special-tracks', async () => {
        await testRoundTripFolderEqual('visual-tests/special-tracks');
    });
});
