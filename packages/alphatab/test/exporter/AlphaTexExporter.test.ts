import { AlphaTexExporter } from '@src/exporter/AlphaTexExporter';
import { AlphaTexErrorWithDiagnostics } from '@src/importer/AlphaTexImporter';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import type { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { ComparisonHelpers } from '@test/model/ComparisonHelpers';
import { TestPlatform } from '@test/TestPlatform';
import { assert } from 'chai';

describe('AlphaTexExporterTest', () => {
    async function loadScore(name: string): Promise<Score | null> {
        const data = await TestPlatform.loadFile(`test-data/${name}`);
        try {
            return ScoreLoader.loadScoreFromBytes(data);
        } catch {
            return null;
        }
    }

    function exportAlphaTex(score: Score, settings: Settings | null = null): string {
        return new AlphaTexExporter().exportToString(score, settings);
    }

    async function testRoundTripEqual(name: string, ignoreKeys: string[] | null = null): Promise<void> {
        const fileName = name.substring(name.lastIndexOf('/') + 1);

        let exported: string = '';
        try {
            const expected = await loadScore(name);
            if (!expected) {
                return;
            }

            ComparisonHelpers.alphaTexExportRoundtripPrepare(expected);

            exported = exportAlphaTex(expected);
            const actual = ScoreLoader.loadAlphaTex(exported);

            ComparisonHelpers.alphaTexExportRoundtripEqual(fileName, actual, expected, ignoreKeys);
        } catch (e) {
            const errorLines: string[] = [];

            const error = e as Error;
            const unwrapped = error.cause instanceof AlphaTexErrorWithDiagnostics ? error.cause : error;
            if (unwrapped instanceof AlphaTexErrorWithDiagnostics) {
                const withDiag = unwrapped as AlphaTexErrorWithDiagnostics;
                const lines = exported.split('\n');
                for (const d of withDiag.iterateDiagnostics()) {
                    errorLines.push(`Error Line ${lines[d.start!.line - 1]}`);
                }
            }

            assert.fail(`<${fileName}>${unwrapped.toString()}\n${errorLines.join('\n')}${error.stack}\n Tex:\n${exported}`);
        }
    }

    async function testRoundTripFolderEqual(name: string): Promise<void> {
        const files: string[] = await TestPlatform.listDirectory(`test-data/${name}`);
        for (const file of files.filter(f => !f.endsWith('.png'))) {
            await testRoundTripEqual(`${name}/${file}`, null);
        }
    }

    it('notation-legend-roundtrip', async () => {
        const score = (await loadScore('visual-tests/notation-legend/notation-legend.gp'))!;
        // fill some more details to cover all features
        score.title = 'Notation Legend';
        score.subTitle = 'for test suite';
        score.artist = 'alphaTab';

        const settings = new Settings();
        settings.exporter.comments = true;
        settings.exporter.indent = 2;

        ComparisonHelpers.alphaTexExportRoundtripPrepare(score);
        const exported = exportAlphaTex(score!, settings);

        const reimportedScore = ScoreLoader.loadAlphaTex(exported);
        ComparisonHelpers.alphaTexExportRoundtripPrepare(reimportedScore);

        ComparisonHelpers.alphaTexExportRoundtripEqual('export-roundtrip', reimportedScore, score);
    });

    it('exact-contents-formatted', async () => {
        const score = (await loadScore('visual-tests/notation-legend/notation-legend.gp'))!;

        // fill some more details to cover all features
        score.title = 'Notation Legend';
        score.subTitle = 'for test suite';
        score.artist = 'alphaTab';

        const settings = new Settings();
        settings.exporter.comments = true;
        settings.exporter.indent = 2;

        let data = exportAlphaTex(score!, settings);
        let expected = await TestPlatform.loadFileAsString('test-data/exporter/notation-legend-formatted.atex');

        data = data.replaceAll('\r', '').trim();
        expected = expected.replaceAll('\r', '').trim();

        const expectedLines = expected.split('\n');
        const actualLines = data.split('\n');
        const lines = Math.min(expectedLines.length, actualLines.length);
        const errors: string[] = [];

        if (expectedLines.length !== actualLines.length) {
            errors.push(`Expected ${expectedLines.length} lines, but only got ${actualLines.length}`);
        }

        for (let i = 0; i < lines; i++) {
            if (actualLines[i].trimEnd() !== expectedLines[i].trimEnd()) {
                errors.push(`Error on line ${i + 1}: `);
                errors.push(`+ ${actualLines[i]}`);
                errors.push(`- ${expectedLines[i]}`);
            }
        }

        if (errors.length > 0) {
            await TestPlatform.saveFileAsString('test-data/exporter/notation-legend-formatted.atex.new', data);
            assert.fail(errors.join('\n'));
        } else {
            await TestPlatform.deleteFile('test-data/exporter/notation-legend-formatted.atex.new');
        }
    });

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

    it('gp5-to-alphaTex', async () => {
        await testRoundTripEqual(`conversion/full-song.gp5`);
    });

    it('gp6-to-alphaTex', async () => {
        await testRoundTripEqual(`conversion/full-song.gpx`);
    });

    it('gp7-to-alphaTex', async () => {
        await testRoundTripEqual(`conversion/full-song.gp`);
    });
});
