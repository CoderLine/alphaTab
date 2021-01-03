import { Gp7Importer } from '@src/importer/Gp7Importer';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import { Gp7Exporter } from '@src/exporter/Gp7Exporter';
import { JsonConverter } from '@src/model/JsonConverter';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { ComparisonHelpers } from '@test/model/ComparisonHelpers';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';

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

    const testRoundTripEqual: (name: string, ignoreKeys: string[] | null) => Promise<void> = async (name: string, ignoreKeys: string[] | null = null): Promise<void> => {
        try {
            const expected = await loadScore(name);
            if (!expected) {
                return;
            }

            const fileName = name.substr(name.lastIndexOf('/') + 1);
            const exported = exportGp7(expected);
            const actual = prepareGp7ImporterWithBytes(exported).readScore();

            const expectedJson = JsonConverter.scoreToJsObject(expected);
            const actualJson = JsonConverter.scoreToJsObject(actual)

            if (!ComparisonHelpers.expectJsonEqual(expectedJson, actualJson, '<' + fileName + '>', ignoreKeys)) {
                await TestPlatform.saveFile(fileName, exported);
            }
        } catch (e) {
            fail(e);
        }
    };

    const testRoundTripFolderEqual: (name: string) => Promise<void> = async (name: string): Promise<void> => {
        const files: string[] = await TestPlatform.listDirectory(`test-data/${name}`);
        for (const file of files) {
            await testRoundTripEqual(`${name}/${file}`, null);
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

    it('gp5-to-gp7', async () => {
        await testRoundTripEqual(`conversion/full-song.gp5`, [
            'accidentalMode', // gets upgraded from default
            'percussionArticulations', // gets added
            'automations' // volume automations are not yet supported in gpif
        ]);
    });

    it('gp6-to-gp7', async () => {
        await testRoundTripEqual(`conversion/full-song.gpx`, [
            'accidentalMode', // gets upgraded from default
            'percussionArticulations', // gets added
            'percussionArticulation', // gets added
        ]);
    });

    it('alphatex-to-gp7', () => {
        const tex = `\\title "Canon Rock"
        \\subtitle "JerryC"
        \\tempo 90
        .
        :2 19.2{v f} 17.2{v f} | 
        15.2{v f} 14.2{v f}| 
        12.2{v f} 10.2{v f}| 
        12.2{v f} 14.2{v f}.4 :8 15.2 17.2 |
        14.1.2 :8 17.2 15.1 14.1{h} 17.2 | 
        15.2{v d}.4 :16 17.2{h} 15.2 :8 14.2 14.1 17.1{b(0 4 4 0)}.4 |
        15.1.8 :16 14.1{tu 3} 15.1{tu 3} 14.1{tu 3} :8 17.2 15.1 14.1 :16 12.1{tu 3} 14.1{tu 3} 12.1{tu 3} :8 15.2 14.2 | 
        12.2 14.3 12.3 15.2 :32 14.2{h} 15.2{h} 14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}
        `;

        const importer = new AlphaTexImporter();
        importer.init(TestPlatform.createStringReader(tex), new Settings());
        const expected = importer.readScore();
        const exported = exportGp7(expected);

        const actual = prepareGp7ImporterWithBytes(exported).readScore();

        const expectedJson = JsonConverter.scoreToJsObject(expected);
        const actualJson = JsonConverter.scoreToJsObject(actual)

        ComparisonHelpers.expectJsonEqual(expectedJson, actualJson, '<alphatex>', ['accidentalMode']);
    });
});
