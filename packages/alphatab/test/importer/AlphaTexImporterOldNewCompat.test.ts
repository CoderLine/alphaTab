import { AlphaTexExporter } from '@src/exporter/AlphaTexExporter';
import { AlphaTexErrorWithDiagnostics, AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import type { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { AlphaTexExporterOld } from '@test/exporter/AlphaTexExporterOld';
import { AlphaTexError, AlphaTexImporterOld } from '@test/importer/AlphaTexImporterOld';
import { ComparisonHelpers } from '@test/model/ComparisonHelpers';
import { TestPlatform } from '@test/TestPlatform';
import { assert } from 'chai';

describe('AlphaTexImporterOldNewCompat', () => {
    async function loadScore(name: string): Promise<Score | null> {
        const data = await TestPlatform.loadFile(`test-data/${name}`);
        try {
            return ScoreLoader.loadScoreFromBytes(data);
        } catch {
            return null;
        }
    }

    async function readAndCompare(
        name: string,
        ignoreKeys: string[] | null,
        tex: string,
        settings: Settings
    ): Promise<void> {
        const fileName = name.substring(name.lastIndexOf('/') + 1);
        const lines = tex.split('\n');

        let oldScore: Score;
        let newScore: Score;

        try {
            const oldImporter = new AlphaTexImporterOld();
            oldImporter.initFromString(tex, settings);
            oldScore = oldImporter.readScore();
            ComparisonHelpers.alphaTexExportRoundtripPrepare(oldScore);
        } catch (e) {
            let errorLine = '';
            const error = e as Error;
            if (error.cause instanceof AlphaTexError) {
                const alphaTexError = error.cause as AlphaTexError;
                errorLine = `Error Line: ${lines[alphaTexError.line - 1]}\n`;
            }

            assert.fail(`<${fileName}>${e}\n${errorLine}${error.stack}\n Tex:\n${tex}`);
        }

        try {
            const newImporter = new AlphaTexImporter();
            newImporter.initFromString(tex, settings);
            newScore = newImporter.readScore();
            ComparisonHelpers.alphaTexExportRoundtripPrepare(newScore);
        } catch (e) {
            let errorDetails = '';
            const error = e as Error;
            if (error instanceof AlphaTexErrorWithDiagnostics) {
                errorDetails = (error as AlphaTexErrorWithDiagnostics).toString();
            } else if (error.cause instanceof AlphaTexErrorWithDiagnostics) {
                errorDetails = (error.cause as AlphaTexErrorWithDiagnostics).toString();
            }
            assert.fail(`<${fileName}>${e}\n${errorDetails}${error.stack}\n Tex:\n${tex}`);
        }

        ComparisonHelpers.alphaTexExportRoundtripEqual(fileName, oldScore, newScore, ignoreKeys);
    }

    async function testRoundTripEqual(name: string, ignoreKeys: string[] | null = null): Promise<void> {
        const settings = new Settings();
        const expected = await loadScore(name);
        if (!expected) {
            return;
        }

        ComparisonHelpers.alphaTexExportRoundtripPrepare(expected);

        // use exporters to create alphaTex code for comparison test

        const exportedOld = new AlphaTexExporterOld().exportToString(expected, settings);
        await readAndCompare(name, ignoreKeys, exportedOld, settings);

        // old importer cannot load new alphaTex
        // const exportedNew = new AlphaTexExporter().exportToString(expected, settings);
        // await readAndCompare(name, ignoreKeys, exportedNew, settings);
    }

    async function testRoundTripFolderEqual(name: string): Promise<void> {
        const files: string[] = await TestPlatform.listDirectory(`test-data/${name}`);
        for (const file of files.filter(f => !f.endsWith('.png'))) {
            await testRoundTripEqual(`${name}/${file}`, null);
        }
    }

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
