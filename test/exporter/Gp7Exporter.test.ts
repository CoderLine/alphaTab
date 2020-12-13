import { Gp7Importer } from '@src/importer/Gp7Importer';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import { Gp7Exporter } from '@src/exporter/Gp7Exporter';
import { JsonConverter } from '@src/model/JsonConverter';

describe('Gp7ExporterTest', () => {
    const prepareGp7ImporterWithFile: (name: string) => Promise<Gp7Importer> = async (name: string): Promise<Gp7Importer> => {
        const data = await TestPlatform.loadFile('test-data/' + name);
        return prepareGp7ImporterWithBytes(data);
    };

    const prepareGp7ImporterWithBytes: (buffer: Uint8Array) => Gp7Importer = (buffer: Uint8Array): Gp7Importer => {
        let readerBase: Gp7Importer = new Gp7Importer();
        readerBase.init(ByteBuffer.fromBuffer(buffer), new Settings());
        return readerBase;
    };

    const exportGp7: (score: Score) => Uint8Array = (score: Score): Uint8Array => {
        return new Gp7Exporter().export(score, null);
    };

    function expectJsonEqual(expected: any, actual: any, path: string) {
        const expectedType = typeof expected;
        const actualType = typeof actual;

        expect(actualType).withContext(`Type Mismatch on hierarchy: ${path}`).toEqual(expectedType);

        switch (actualType) {
            case 'boolean':
                expect(actual).withContext(`Boolean mismatch on hierarchy: ${path}`).toEqual(expected);
                break;
            case 'number':
                expect(actual).withContext(`Number mismatch on hierarchy: ${path}`).toBeCloseTo(expected);
                break;
            case 'object':
                expect(Array.isArray(actual)).withContext(`Array Type Mismatch on hierarchy: ${path}`).toEqual(Array.isArray(expected));
                expect(actual === null).withContext(`Null Mismatch on hierarchy: ${path}`).toEqual(expected === null);
                if (actual) {
                    if (Array.isArray(expected) && Array.isArray(actual)) {
                        expect(actual.length).withContext(`Array Length Mismatch on hierarchy: ${path}`).toEqual(expected.length);
                        for (let i = 0; i < actual.length; i++) {
                            expectJsonEqual(expected[i], actual[i], `${path}[${i}]`);
                        }
                    } else {
                        const expectedKeys = Object.keys(expected);
                        const actualKeys = Object.keys(actual);
                        expectedKeys.sort();
                        actualKeys.sort();
                        expect(actualKeys.join(',')).withContext(`Object Keys Mismatch on hierarchy: ${path}`).toEqual(expectedKeys.join(','));

                        for (const key of actualKeys) {
                            switch (key) {
                                // some ignored keys
                                case 'id':
                                case 'hammerPullOriginId':
                                case 'hammerPullDestinationId':
                                case 'tieOriginId':
                                case 'tieDestinationId':
                                    break;
                                default:
                                    expectJsonEqual(expected[key], actual[key], `${path}.${key}`);
                                    break;
                            }
                        }
                    }
                }
                break;
            case 'string':
                expect(actual).withContext(`String mismatch on hierarchy: ${path}`).toEqual(expected);
                break;
            case 'undefined':
                expect(actual).withContext(`null mismatch on hierarchy: ${path}`).toEqual(expected);
                break;
        }
    }

    const testRoundTripEqual: (name: string) => Promise<void> = async (name: string): Promise<void> => {
        const expected = (await prepareGp7ImporterWithFile(name)).readScore();
        const exported = exportGp7(expected);
        const actual = prepareGp7ImporterWithBytes(exported).readScore();

        const expectedJson = JsonConverter.scoreToJsObject(expected);
        const actualJson = JsonConverter.scoreToJsObject(actual)

        expectJsonEqual(expectedJson, actualJson, "<root>");
    };

    it('score-info', async () => {
        await testRoundTripEqual('guitarpro7/score-info.gp');
    });

    it('notes', async () => {
        await testRoundTripEqual('guitarpro7/notes.gp');
    });

    it('time-signatures', async () => {
        await testRoundTripEqual('guitarpro7/time-signatures.gp');
    });

    it('dead', async () => {
        await testRoundTripEqual('guitarpro7/dead.gp');
    });

    it('grace', async () => {
        await testRoundTripEqual('guitarpro7/grace.gp');
    });

    it('accentuations', async () => {
        await testRoundTripEqual('guitarpro7/accentuations.gp');
    });

    it('harmonics', async () => {
        await testRoundTripEqual('guitarpro7/harmonics.gp');
    });

    it('hammer', async () => {
        await testRoundTripEqual('guitarpro7/hammer.gp');
    });

    it('bend', async () => {
        await testRoundTripEqual('guitarpro7/bends.gp');
    });

    it('bends-advanced', async () => {
        await testRoundTripEqual('guitarpro7/bends-advanced.gp');
    });

    it('whammy-advanced', async () => {
        await testRoundTripEqual('guitarpro7/whammy-advanced.gp');
    });

    it('tremolo', async () => {
        await testRoundTripEqual('guitarpro7/tremolo.gp');
    });

    it('slides', async () => {
        await testRoundTripEqual('guitarpro7/slides.gp');
    });

    it('vibrato', async () => {
        await testRoundTripEqual('guitarpro7/vibrato.gp');
    });

    it('trills', async () => {
        await testRoundTripEqual('guitarpro7/trills.gp');
    });

    it('other-effects', async () => {
        await testRoundTripEqual('guitarpro7/other-effects.gp');
    });

    it('fingering', async () => {
        await testRoundTripEqual('guitarpro7/fingering.gp');
    });

    it('stroke', async () => {
        await testRoundTripEqual('guitarpro7/strokes.gp');
    });

    it('tuplets', async () => {
        await testRoundTripEqual('guitarpro7/tuplets.gp');
    });

    it('ranges', async () => {
        await testRoundTripEqual('guitarpro7/ranges.gp');
    });

    it('effects', async () => {
        await testRoundTripEqual('guitarpro7/effects.gp');
    });

    it('serenade', async () => {
        await testRoundTripEqual('guitarpro7/serenade.gp');
    });

    it('strings', async () => {
        await testRoundTripEqual('guitarpro7/strings.gp');
    });

    it('key-signatures', async () => {
        await testRoundTripEqual('guitarpro7/key-signatures.gp');
    });

    it('chords', async () => {
        await testRoundTripEqual('guitarpro7/chords.gp');
    });

    it('colors', async () => {
        await testRoundTripEqual('guitarpro7/colors.gp');
    });

    it('tremolo-vibrato', async () => {
        await testRoundTripEqual('guitarpro7/tremolo-vibrato.gp');
    });

    it('ottavia', async () => {
        await testRoundTripEqual('guitarpro7/ottavia.gp');
    });

    it('simile-mark', async () => {
        await testRoundTripEqual('guitarpro7/simile-mark.gp');
    });

    it('anacrusis', async () => {
        await testRoundTripEqual('guitarpro7/anacrusis.gp');
    });

    it('left-hand-tap', async () => {
        await testRoundTripEqual('guitarpro7/left-hand-tap.gp');
    });

    it('fermata', async () => {
        await testRoundTripEqual('guitarpro7/fermata.gp');
    });

    it('pick-slide', async () => {
        await testRoundTripEqual('guitarpro7/pick-slide.gp');
    });

    it('beat-lyrics', async () => {
        await testRoundTripEqual('guitarpro7/beat-lyrics.gp');
    });
});
