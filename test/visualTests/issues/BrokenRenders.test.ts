import { TestPlatform } from '@test/TestPlatform';
import { VisualTestHelper } from '../VisualTestHelper';
import { Settings } from '@src/Settings';
import { XmlDocument } from '@src/xml/XmlDocument';
import { expect } from 'chai';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import type { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';

describe('BrokenRendersTests', () => {
    it('let-ring-empty-voice', async () => {
        await VisualTestHelper.runVisualTest('issues/let-ring-empty-voice.gp');
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
