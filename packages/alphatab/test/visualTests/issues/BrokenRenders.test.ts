import { TestPlatform } from 'test/TestPlatform';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from '../VisualTestHelper';
import { Settings } from '@coderline/alphatab/Settings';
import { XmlDocument } from '@coderline/alphatab/xml/XmlDocument';
import { expect } from 'chai';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import type { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';

describe('BrokenRendersTests', () => {
    it('let-ring-empty-voice', async () => {
        await VisualTestHelper.runVisualTest('issues/let-ring-empty-voice.gp');
    });

    it('bottom-effect-band', async () => {
        await VisualTestHelper.runVisualTestTex(`
            \\lyrics "Do Re Mi Fa So"
            C4 {tr 16} C4 C4 C4 | C4 c4`,
            'test-data/visual-tests/issues/bottom-effect-band.png'
        );
    });


    it('whammy-resize-wrap', async () => {
        const score = ScoreLoader.loadAlphaTex(`
            \\staff {tabs}
                7.3.4
                8.3
                10.3.4
                12.3.4{tbe (dip default 0 0 15 -4 30 0) beam Down} 
            |  
                5.3{nh}.4{tbe (dive default 0 0 30.599999999999998 8) beam Down}  
                5.3
                5.3`);
        await VisualTestHelper.runVisualTestFull(
            new VisualTestOptions(score, [
                new VisualTestRun(600, 'test-data/visual-tests/issues/whammy-resize-wrap-600.png'),
                new VisualTestRun(400, 'test-data/visual-tests/issues/whammy-resize-wrap-400.png'),
                // 431
                new VisualTestRun(380, 'test-data/visual-tests/issues/whammy-resize-wrap-380.png'),
                new VisualTestRun(500, 'test-data/visual-tests/issues/whammy-resize-wrap-500.png')
            ], new Settings())
        );
    });

    it('valid-svg', async () => {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = false;

        const inputFileData = await TestPlatform.loadFile('test-data/visual-tests/layout/page-layout.gp');
        const score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

        const api = new ScoreRenderer(settings);
        const results: RenderFinishedEventArgs[] = [];
        let error: Error | null = null;
        api.preRender.on(_ => {});
        api.partialRenderFinished.on(e => {
            results.push(e);
        });
        api.renderFinished.on(e => {
            results.push(e);
        });
        api.error.on(e => {
            error = e;
        });

        api.width = 1300;
        api.renderScore(score, [0]);

        // https://github.com/microsoft/TypeScript/issues/61313
        error = error as Error | null;
        if (error != null) {
            throw error;
        }

        for (const r of results) {
            if (r.renderResult !== null) {
                const xml = new XmlDocument();
                xml.parse(r.renderResult as string);

                expect(xml.firstElement).to.be.ok;
                expect(xml.firstElement!.localName).to.equal('svg');
            }
        }
    });
});
