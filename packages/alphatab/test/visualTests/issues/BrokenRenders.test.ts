import { describe, expect, it } from 'vitest';
import { TestPlatform } from 'test/TestPlatform';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from '../VisualTestHelper';
import { Settings } from '@coderline/alphatab/Settings';
import { XmlDocument } from '@coderline/alphatab/xml/XmlDocument';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import type { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { Logger } from '@coderline/alphatab/Logger';
import { LogLevel } from '@coderline/alphatab/LogLevel';

describe('BrokenRendersTests', () => {
    it('let-ring-empty-voice', async () => {
        await VisualTestHelper.runVisualTest('issues/let-ring-empty-voice.gp');
    });

    it('bottom-effect-band', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
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
            new VisualTestOptions(
                score,
                [
                    new VisualTestRun(600, 'test-data/visual-tests/issues/whammy-resize-wrap-600.png'),
                    new VisualTestRun(400, 'test-data/visual-tests/issues/whammy-resize-wrap-400.png'),
                    // 431
                    new VisualTestRun(380, 'test-data/visual-tests/issues/whammy-resize-wrap-380.png'),
                    new VisualTestRun(500, 'test-data/visual-tests/issues/whammy-resize-wrap-500.png')
                ],
                new Settings()
            )
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

                expect(xml.firstElement).toBeTruthy();
                expect(xml.firstElement!.localName).toBe('svg');
            }
        }
    });

    // https://github.com/CoderLine/alphaTab/issues/2904
    const squeezedLegatoTex = `
        \\staff {score tabs}
        \\tuning e4 b3 g3 d3 a2 e2
        \\ts 4 4
        (14.1{sl} 11.3{sl}).16 (16.1 13.3).16 (16.1 13.3).16 (16.1 13.3).16
        (16.1 13.3).16 (16.1 13.3).16 (16.1 13.3).16 (16.1 13.3).16
        (16.1 13.3).16 (16.1 13.3).16 (16.1 13.3).16 (16.1 13.3).16
        (16.1 13.3).16 (16.1 13.3).16 (16.1 13.3).16 (16.1 13.3).16 |
    `;

    it('squeezed-legato-slur', () => {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = false;

        const score = ScoreLoader.loadAlphaTex(squeezedLegatoTex);

        for (const width of [400, 300]) {
            const api = new ScoreRenderer(settings);
            const results: string[] = [];
            api.partialRenderFinished.on(e => {
                if (e.renderResult !== null) {
                    results.push(e.renderResult as string);
                }
            });
            api.width = width;
            api.renderScore(score, [0]);

            expect(results.length).toBeGreaterThan(0);
            for (const r of results) {
                expect(r.includes('NaN'), `NaN in SVG at width ${width}`).toBe(false);
            }
        }
    });

    it('squeezed-bar-warning', () => {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = false;
        const score = ScoreLoader.loadAlphaTex(squeezedLegatoTex);

        const warnings: string[] = [];
        const originalLogger = Logger.log;
        const originalLogLevel = Logger.logLevel;
        Logger.logLevel = LogLevel.Warning;
        Logger.log = {
            debug: () => {},
            info: () => {},
            error: () => {},
            warning: (_category: string, msg: string) => {
                warnings.push(msg);
            }
        };
        try {
            const render = (width: number) => {
                warnings.length = 0;
                const api = new ScoreRenderer(settings);
                api.width = width;
                api.renderScore(score, [0]);
                return warnings.filter(w => w.includes('not fit into the available width'));
            };

            const narrow = render(400);
            expect(narrow.length).toBe(1);
            expect(narrow[0]).toContain('Bar 1 does not fit');

            expect(render(1200).length).toBe(0);
        } finally {
            Logger.log = originalLogger;
            Logger.logLevel = originalLogLevel;
        }
    });

    describe('no-label-padding-left', () => {
        it('no-padding', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                \\track "T1"
                C4 * 4
                `,
                'test-data/visual-tests/issues/no-label-padding-left-no-padding.png'
            );
        });

        it('with-label', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                \\track "T1"
                C4 * 4
                `,
                'test-data/visual-tests/issues/no-label-padding-left-with-label.png',
                undefined,
                o => {
                    o.settings.display.systemLabelPaddingLeft = 100;
                }
            );
        });

        it('without-label', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                \\track
                C4 * 4
                `,
                'test-data/visual-tests/issues/no-label-padding-left-without-label.png',
                undefined,
                o => {
                    o.settings.display.systemLabelPaddingLeft = 100;
                }
            );
        });
    });
});
