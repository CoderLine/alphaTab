import { ScoreLoader } from '@src/importer/ScoreLoader';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import { Environment } from '@src/Environment';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { PixelMatch, PixelMatchOptions } from '@test/visualTests/PixelMatch';
import { JsonConverter } from '@src/model/JsonConverter';
import { assert } from 'chai';
import { AlphaTabApiBase } from '@src/AlphaTabApiBase';
import { TestUiFacade } from './TestUiFacade';
import * as alphaSkiaModule from '@coderline/alphaskia';
import { AlphaSkiaCanvas, AlphaSkiaImage } from '@coderline/alphaskia';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';

/**
 * @partial
 */
export class VisualTestHelper {
    public static async runVisualTest(
        inputFile: string,
        settings?: Settings,
        tracks?: number[],
        message?: string,
        tolerancePercent: number = 0.000,
        triggerResize: boolean = false
    ): Promise<void> {
        const inputFileData = await TestPlatform.loadFile(`test-data/visual-tests/${inputFile}`);
        const referenceFileName = TestPlatform.changeExtension(inputFile, '.png');
        let score: Score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

        await VisualTestHelper.runVisualTestScore(
            score,
            referenceFileName,
            settings,
            tracks,
            message,
            tolerancePercent,
            triggerResize
        );
    }

    public static async runVisualTestWithResize(
        inputFile: string,
        widths: number[],
        referenceImages: string[],
        settings?: Settings,
        tracks?: number[],
        message?: string,
        tolerancePercent: number = 0.000
    ): Promise<void> {
        try {
            const inputFileData = await TestPlatform.loadFile(`test-data/visual-tests/${inputFile}`);
            let score: Score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

            await VisualTestHelper.runVisualTestScoreWithResize(
                score,
                widths,
                referenceImages,
                settings,
                tracks,
                message,
                tolerancePercent
            );
        } catch (e) {
            assert.fail(`Failed to run visual test ${e}`);
        }
    }

    public static async runVisualTestTex(
        tex: string,
        referenceFileName: string,
        settings?: Settings,
        tracks?: number[],
        message?: string,
        tolerancePercent: number = 0.000
    ): Promise<void> {
        try {
            if (!settings) {
                settings = new Settings();
            }

            const importer = new AlphaTexImporter();
            importer.init(ByteBuffer.fromString(tex), settings);
            let score: Score = importer.readScore();

            await VisualTestHelper.runVisualTestScore(score, referenceFileName, settings, tracks, message, tolerancePercent);
        } catch (e) {
            assert.fail(`Failed to run visual test ${e}`);
        }
    }

    public static async runVisualTestScore(
        score: Score,
        referenceFileName: string,
        settings?: Settings,
        tracks?: number[],
        message?: string,
        tolerancePercent: number = 0.000,
        triggerResize: boolean = false
    ): Promise<void> {
        const widths = [1300];
        if (triggerResize) {
            widths.push(widths[0]);
        }

        const referenceImages: (string | null)[] = [referenceFileName];
        if (triggerResize) {
            referenceImages.unshift(null);
        }

        await VisualTestHelper.runVisualTestScoreWithResize(
            score,
            widths,
            referenceImages,
            settings,
            tracks,
            message,
            tolerancePercent
        );
    }

    public static async runVisualTestScoreWithResize(
        score: Score,
        widths: number[],
        referenceImages: (string | null)[],
        settings?: Settings,
        tracks?: number[],
        message?: string,
        tolerancePercent: number = 0.000
    ): Promise<void> {
        if (!settings) {
            settings = new Settings();
        }
        if (!tracks) {
            tracks = [0];
        }

        await VisualTestHelper.prepareAlphaSkia();
        VisualTestHelper.prepareSettingsForTest(settings);

        let referenceFileData: (Uint8Array | null)[] = [];
        for (const img of referenceImages) {
            try {
                if (img !== null) {
                    referenceFileData.push(await TestPlatform.loadFile(`test-data/visual-tests/${img}`));
                } else {
                    referenceFileData.push(null);
                }
            } catch (e) {
                referenceFileData.push(new Uint8Array(0));
            }
        }

        let results: RenderFinishedEventArgs[][] = [];
        let totalWidths: number[] = [];
        let totalHeights: number[] = [];
        const uiFacade = new TestUiFacade();
        const widthCount = widths.length;
        uiFacade.rootContainer.width = widths.shift()!;

        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);

        let render = new Promise<void>((resolve, reject) => {
            api.renderStarted.on(_ => {
                results.push([]);
                totalWidths.push(0);
                totalHeights.push(0);
            });
            api.renderer.partialRenderFinished.on(e => {
                if (e) {
                    results[results.length - 1].push(e);
                }
            });
            api.renderer.renderFinished.on(e => {
                totalWidths[totalWidths.length - 1] = e.totalWidth;
                totalHeights[totalHeights.length - 1] = e.totalHeight;
                results[results.length - 1].push(e);
            });
            api.renderer.postRenderFinished.on(() => {
                if (widths.length > 0) {
                    uiFacade.rootContainer.width = widths.shift()!;
                    // @ts-ignore
                    api.triggerResize();
                } else {
                    resolve();
                }
            });
            api.error.on(e => {
                reject(new AlphaTabError(AlphaTabErrorType.General, 'Failed to render image', e));
            });

            // NOTE: on some platforms we serialize/deserialize the score objects
            // this logic does the same just to ensure we get the right result
            const renderScore = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), settings);
            api.renderScore(renderScore, tracks);
        });

        const timeout = 2000 * widthCount;
        await Promise.race([
            render,
            new Promise<void>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Rendering did not complete after ${timeout}ms`));
                }, timeout);
            })
        ] as Promise<void>[]);

        api.destroy();

        for (let i = 0; i < results.length; i++) {
            if (referenceImages[i] !== null) {
                await VisualTestHelper.compareVisualResult(
                    totalWidths[i],
                    totalHeights[i],
                    results[i],
                    referenceImages[i]!,
                    referenceFileData[i]!,
                    message,
                    tolerancePercent
                );
            }
        }
    }

    private static _alphaSkiaPrepared: boolean = false;


    static async prepareAlphaSkia() {
        if (VisualTestHelper._alphaSkiaPrepared) {
            return;
        }

        const bravura: ArrayBuffer = (await TestPlatform.loadFile('font/bravura/Bravura.ttf')).buffer;
        VisualTestHelper.enableAlphaSkia(bravura);

        const fonts = [
            'font/roboto/Roboto-Regular.ttf',
            'font/roboto/Roboto-Italic.ttf',
            'font/roboto/Roboto-Bold.ttf',
            'font/roboto/Roboto-BoldItalic.ttf',
            'font/ptserif/PTSerif-Regular.ttf',
            'font/ptserif/PTSerif-Italic.ttf',
            'font/ptserif/PTSerif-Bold.ttf',
            'font/ptserif/PTSerif-BoldItalic.ttf',
        ];

        for (const font of fonts) {
            Environment.registerAlphaSkiaCustomFont((await TestPlatform.loadFile(font)));
        }

        VisualTestHelper._alphaSkiaPrepared = true;
    }

    /**
     * @target web
     * @partial
     */
    static enableAlphaSkia(bravura: ArrayBuffer) {
        Environment.enableAlphaSkia(
            bravura,
            alphaSkiaModule
        );
    }

    static prepareSettingsForTest(settings: Settings) {
        /**@target web*/
        settings.core.fontDirectory = 'font/bravura/';
        settings.core.engine = 'skia';
        Environment.HighDpiFactor = 1; // test data is in scale 1
        settings.core.enableLazyLoading = false;

        settings.display.resources.copyrightFont.families = ['Roboto'];
        settings.display.resources.titleFont.families = ['PT Serif'];
        settings.display.resources.subTitleFont.families = ['PT Serif'];
        settings.display.resources.wordsFont.families = ['PT Serif'];
        settings.display.resources.effectFont.families = ['PT Serif'];
        settings.display.resources.fretboardNumberFont.families = ['Roboto'];
        settings.display.resources.tablatureFont.families = ['Roboto'];
        settings.display.resources.graceFont.families = ['Roboto'];
        settings.display.resources.barNumberFont.families = ['Roboto'];
        settings.display.resources.fingeringFont.families = ['PT Serif'];
        settings.display.resources.markerFont.families = ['PT Serif'];
    }

    public static async compareVisualResult(
        totalWidth: number,
        totalHeight: number,
        result: RenderFinishedEventArgs[],
        referenceFileName: string,
        referenceFileData: Uint8Array,
        message?: string,
        tolerancePercent: number = 0.000
    ): Promise<void> {
        // create final full image
        using actual = new AlphaSkiaCanvas();
        actual.beginRender(totalWidth, totalHeight);
        for (const partialResult of result) {
            if (partialResult.renderResult) {
                const partialCanvas = partialResult.renderResult as AlphaSkiaImage;
                actual.drawImage(partialCanvas, partialResult.x, partialResult.y, partialResult.width, partialResult.height);
            }
        }

        // convert reference image to canvas
        if(referenceFileData.length > 0) {
            using expected = AlphaSkiaImage.decode(referenceFileData.buffer);
            await VisualTestHelper.expectToEqualVisuallyAsync(actual.endRender()!, referenceFileName, expected, message, tolerancePercent);
        } else {
            await VisualTestHelper.expectToEqualVisuallyAsync(actual.endRender()!, referenceFileName, undefined, message, tolerancePercent);
        }
    }

    private static async expectToEqualVisuallyAsync(
        actual: AlphaSkiaImage,
        expectedFileName: string,
        expected: AlphaSkiaImage|undefined,
        message?: string,
        tolerancePercent: number = 0.000
    ): Promise<void> {
        let pass = false;
        let errorMessage = '';
        const oldActual = actual;

        if(expected) {
            const sizeMismatch = expected.width !== actual.width || expected.height !== actual.height;
            if (sizeMismatch) {
                using newActual = new AlphaSkiaCanvas();
                newActual.beginRender(expected.width, expected.height);
                newActual.drawImage(actual, 0, 0, expected.width, expected.height);
                newActual.color = AlphaSkiaCanvas.rgbaToColor(255, 0, 0, 255);
                newActual.lineWidth = 2;
                newActual.strokeRect(0, 0, expected.width, expected.height);
    
                actual = newActual.endRender()!;
            }
    
            const actualImageData = actual.readPixels()!;
            const expectedImageData = expected.readPixels()!;
    
            // do visual comparison
            const diffImageData = new ArrayBuffer(actualImageData.byteLength);
            pass = true;
            errorMessage = "";
    
            try {
                const options = new PixelMatchOptions();
                options.threshold = 0.3;
                options.includeAA = false;
                options.diffMask = true;
                options.alpha = 1;
    
                let match = PixelMatch.match(
                    new Uint8Array(expectedImageData),
                    new Uint8Array(actualImageData),
                    new Uint8Array(diffImageData),
                    expected.width,
                    expected.height,
                    options
                );
    
                // only pixels that are not transparent are relevant for the diff-ratio
                let totalPixels = match.totalPixels - match.transparentPixels;
                let percentDifference = (match.differentPixels / totalPixels) * 100;
                pass = percentDifference <= tolerancePercent;
                // result.pass = match.differentPixels === 0;
                errorMessage = '';
    
                if (!pass) {
                    let percentDifferenceText = percentDifference.toFixed(2);
                    errorMessage = `Difference between original and new image is too big: ${match.differentPixels}/${totalPixels} (${percentDifferenceText}%)`;
    
                    using diffPng = AlphaSkiaImage.fromPixels(
                        actual.width,
                        actual.height,
                        diffImageData)!;
    
                    await VisualTestHelper.saveFiles(expectedFileName, oldActual, diffPng);
                }
    
                if (sizeMismatch) {
                    errorMessage += `Image sizes do not match: expected ${expected.width}x${expected.height} but got ${oldActual.width}x${oldActual.height}`;
                    pass = false;
                }
            } catch (e) {
                pass = false;
                errorMessage = `Error comparing images: ${e}, ${message}`;
            }
        }
       else {
        pass = false;
        errorMessage = 'Missing reference image file' + expectedFileName;
        await VisualTestHelper.saveFiles(expectedFileName, oldActual, undefined);
       }

        if (!pass) {
            throw new Error(errorMessage);
        } else {
            await VisualTestHelper.deleteFiles(expectedFileName);
        }
    }

    static async saveFiles(
        expectedFilePath: string,
        actual: AlphaSkiaImage,
        diff: AlphaSkiaImage | undefined
    ): Promise<void> {
        expectedFilePath = TestPlatform.joinPath(
            'test-data',
            'visual-tests',
            expectedFilePath
        );
        if(diff) {
            const diffData = diff.toPng()!;

            const diffFileName = TestPlatform.changeExtension(expectedFilePath, '.diff.png');
            await TestPlatform.saveFile(diffFileName, new Uint8Array(diffData));
        }

        const actualData = actual.toPng()!;
        const actualFile = TestPlatform.changeExtension(expectedFilePath, '.new.png');
        await TestPlatform.saveFile(actualFile, new Uint8Array(actualData));
    }

    static async deleteFiles(expectedFilePath: string): Promise<void> {
        expectedFilePath = TestPlatform.joinPath(
            'test-data',
            'visual-tests',
            expectedFilePath
        );

        const diffFileName = TestPlatform.changeExtension(expectedFilePath, '.diff.png');
        await TestPlatform.deleteFile(diffFileName);

        const actualFile = TestPlatform.changeExtension(expectedFilePath, '.new.png');
        await TestPlatform.deleteFile(actualFile);
    }

    static createFileName(oldName: string, part: string) {
        oldName = oldName.split('\\').join('/');
        let i = oldName.lastIndexOf('/');
        if (i >= 0) {
            oldName = oldName.substr(i + 1);
        }

        if (part.length > 0) {
            part = `-${part}`;
        }

        i = oldName.lastIndexOf('.');
        if (i >= 0) {
            oldName = oldName.substr(0, i) + part + oldName.substr(i);
        } else {
            oldName += part;
        }
        return oldName;
    }
}
