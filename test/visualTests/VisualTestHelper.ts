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
import * as path from 'path';
import * as alphaSkia from '@coderline/alphaskia';

export class VisualTestHelper {
    public static async runVisualTest(
        inputFile: string,
        settings?: Settings,
        tracks?: number[],
        message?: string,
        tolerancePercent: number = 1,
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
        tolerancePercent: number = 1
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
        tolerancePercent: number = 1
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
        tolerancePercent: number = 1,
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
        tolerancePercent: number = 1
    ): Promise<void> {
        if (!settings) {
            settings = new Settings();
        }
        if (!tracks) {
            tracks = [0];
        }

        await VisualTestHelper.prepareAlphaSkia();
        await VisualTestHelper.prepareSettingsForTest(settings);

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
                reject(`Failed to render image: ${e}`);
            });

            // NOTE: on some platforms we serialize/deserialize the score objects
            // this logic does the same just to ensure we get the right result
            const renderScore = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), settings);
            api.renderScore(renderScore, tracks);
        });

        await Promise.race([
            render,
            new Promise<void>((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Rendering did not complete in time'));
                }, 2000 * widths.length);
            })
        ]);

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

        /**
         * @target web
         */
        Environment.enableAlphaSkia(
            (await TestPlatform.loadFile('font/bravura/Bravura.ttf')).buffer,
            Environment.MusicFontSize,
            alphaSkia
        );

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
            Environment.registerAlphaSkiaCustomFont((await TestPlatform.loadFile(font)).buffer);
        }

        VisualTestHelper._alphaSkiaPrepared = true;
    }

    static async prepareSettingsForTest(settings: Settings) {
        /**
         * @target web
         */
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
        tolerancePercent: number = 1
    ): Promise<void> {
        // create final full image
        using actual = new alphaSkia.AlphaSkiaCanvas();
        actual.beginRender(totalWidth, totalHeight);
        for (const partialResult of result) {
            if (partialResult.renderResult) {
                const partialCanvas = partialResult.renderResult as alphaSkia.AlphaSkiaImage;
                actual.drawImage(partialCanvas, partialResult.x, partialResult.y, partialResult.width, partialResult.height);
            }
        }

        // convert reference image to canvas
        using expected = alphaSkia.AlphaSkiaImage.decode(referenceFileData.buffer);
        await VisualTestHelper.expectToEqualVisuallyAsync(actual.endRender()!, expected!, referenceFileName, message, tolerancePercent);
    }

    private static async expectToEqualVisuallyAsync(
        actual: alphaSkia.AlphaSkiaImage,
        expected: alphaSkia.AlphaSkiaImage,
        expectedFileName: string,
        message?: string,
        tolerancePercent: number = 1
    ): Promise<void> {
        const sizeMismatch = expected.width !== actual.width || expected.height !== actual.height;
        const oldActual = actual;
        if (sizeMismatch) {
            using newActual = new alphaSkia.AlphaSkiaCanvas();
            newActual.beginRender(expected.width, expected.height);
            newActual.drawImage(actual, 0, 0, expected.width, expected.height);
            newActual.color = alphaSkia.AlphaSkiaCanvas.rgbaToColor(255, 0, 0, 255);
            newActual.lineWidth = 2;
            newActual.strokeRect(0, 0, expected.width, expected.height);

            actual = newActual.endRender()!;
        }

        const actualImageData = actual.readPixels()!;
        const expectedImageData = expected.readPixels()!;

        // do visual comparison
        const diffImageData = new ArrayBuffer(actualImageData.byteLength);
        const result = {
            pass: true,
            message: ''
        };

        try {
            let match = PixelMatch.match(
                new Uint8Array(expectedImageData),
                new Uint8Array(actualImageData),
                new Uint8Array(diffImageData),
                expected.width,
                expected.height,
                {
                    threshold: 0.3,
                    includeAA: false,
                    diffMask: true,
                    alpha: 1
                } as PixelMatchOptions
            );

            // only pixels that are not transparent are relevant for the diff-ratio
            let totalPixels = match.totalPixels - match.transparentPixels;
            let percentDifference = (match.differentPixels / totalPixels) * 100;
            result.pass = percentDifference < tolerancePercent;
            // result.pass = match.differentPixels === 0;
            result.message = '';

            if (!result.pass) {
                let percentDifferenceText = percentDifference.toFixed(2);
                result.message = `Difference between original and new image is too big: ${match.differentPixels}/${totalPixels} (${percentDifferenceText}%)`;

                using diffPng = alphaSkia.AlphaSkiaImage.fromPixels(
                    actual.width,
                    actual.height,
                    diffImageData)!;

                await VisualTestHelper.saveFiles(expectedFileName, oldActual, diffPng);
            }

            if (sizeMismatch) {
                result.message += `Image sizes do not match: expected ${expected.width}x${expected.height} but got ${oldActual.width}x${oldActual.height}`;
                result.pass = false;
            }
        } catch (e) {
            result.pass = false;
            result.message = `Error comparing images: ${e}, ${message}`;
        }

        if (!result.pass) {
            throw new Error(result.message);
        } else {
            await VisualTestHelper.deleteFiles(expectedFileName);
        }
    }

    static async saveFiles(
        expectedFilePath: string,
        actual: alphaSkia.AlphaSkiaImage,
        diff: alphaSkia.AlphaSkiaImage
    ): Promise<void> {
        expectedFilePath = path.join(
            'test-data',
            'visual-tests',
            ...expectedFilePath.split(/[\\\/]/)
        );

        const actualData = actual.toPng()!;
        const diffData = diff.toPng()!;

        const diffFileName = path.format({ ...path.parse(expectedFilePath), base: '', ext: '.diff.png' });
        await TestPlatform.saveFile(diffFileName, new Uint8Array(diffData));

        const actualFile = path.format({ ...path.parse(expectedFilePath), base: '', ext: '.new.png' });
        await TestPlatform.saveFile(actualFile, new Uint8Array(actualData));
    }

    static async deleteFiles(expectedFilePath: string): Promise<void> {
        expectedFilePath = path.join(
            'test-data',
            'visual-tests',
            ...expectedFilePath.split(/[\\\/]/)
        );

        const diffFileName = path.format({ ...path.parse(expectedFilePath), base: '', ext: '.diff.png' });
        await TestPlatform.deleteFile(diffFileName);

        const actualFile = path.format({ ...path.parse(expectedFilePath), base: '', ext: '.new.png' });
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
