import { ScoreLoader } from '@src/importer/ScoreLoader';
import type { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import { Environment } from '@src/Environment';
import type { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { PixelMatch, PixelMatchOptions } from '@test/visualTests/PixelMatch';
import { JsonConverter } from '@src/model/JsonConverter';
import { AlphaTabApiBase } from '@src/AlphaTabApiBase';
import { TestUiFacade } from './TestUiFacade';
import * as alphaSkiaModule from '@coderline/alphaskia';
import { AlphaSkiaCanvas, AlphaSkiaImage } from '@coderline/alphaskia';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';

export class VisualTestRun {
    public width: number;
    public referenceFileName: string;
    public constructor(width: number, referenceFileName: string) {
        this.width = width === -1 ? 1300 : width;
        this.referenceFileName = referenceFileName;
    }
}

export class VisualTestOptions {
    public score: Score;
    public runs: VisualTestRun[];
    public settings?: Settings;
    public tracks?: number[];
    public tolerancePercent?: number;
    public prepareFullImage?: (run: VisualTestRun, api: AlphaTabApiBase<unknown>, fullImage: AlphaSkiaCanvas) => void;

    public constructor(score: Score, runs: VisualTestRun[], settings?: Settings) {
        this.score = score;
        this.runs = runs;
        this.settings = settings;
    }

    public static async file(inputFile: string, runs: VisualTestRun[], settings?: Settings) {
        if (!settings) {
            settings = new Settings();
        }

        const inputFileData = await TestPlatform.loadFile(`test-data/visual-tests/${inputFile}`);
        const score: Score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

        return new VisualTestOptions(score, runs, settings);
    }

    public static tex(tex: string, referenceFileName: string, settings?: Settings) {
        if (!settings) {
            settings = new Settings();
        }

        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), settings);
        const score: Score = importer.readScore();

        const o = new VisualTestOptions(score, [new VisualTestRun(1300, referenceFileName)], settings);
        return o;
    }
}

/**
 * @partial
 */
export class VisualTestHelper {
    public static async runVisualTest(
        inputFile: string,
        settings?: Settings,
        configure?: (o: VisualTestOptions) => void
    ): Promise<void> {
        inputFile = `test-data/visual-tests/${inputFile}`;
        const inputFileData = await TestPlatform.loadFile(inputFile);
        const referenceFileName = TestPlatform.changeExtension(inputFile, '.png');
        const score: Score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

        const o = new VisualTestOptions(score, [new VisualTestRun(-1, referenceFileName)], settings);
        if (configure) {
            configure(o);
        }

        await VisualTestHelper.runVisualTestFull(o);
    }

    public static runVisualTestTex(tex: string, referenceFileName: string, settings?: Settings): Promise<void> {
        return VisualTestHelper.runVisualTestFull(VisualTestOptions.tex(tex, referenceFileName, settings));
    }

    public static async runVisualTestFull(options: VisualTestOptions): Promise<void> {
        const settings = options.settings ?? new Settings();
        const tracks = options.tracks ?? [0];
        const runs = options.runs;
        let runIndex = 0;

        await VisualTestHelper.prepareAlphaSkia();
        VisualTestHelper.prepareSettingsForTest(settings!);

        const referenceFileData: Uint8Array[] = [];
        for (const run of runs) {
            try {
                referenceFileData.push(await TestPlatform.loadFile(run.referenceFileName));
            } catch (e) {
                referenceFileData.push(new Uint8Array(0));
            }
        }

        const results: RenderFinishedEventArgs[][] = [];
        const totalWidths: number[] = [];
        const totalHeights: number[] = [];
        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = runs[runIndex++].width;

        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);

        const render = new Promise<void>((resolve, reject) => {
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
                if (runIndex < runs.length) {
                    uiFacade.rootContainer.width = runs[runIndex++].width;
                    // @ts-ignore
                    api.triggerResize();
                } else {
                    resolve();
                }
            });
            api.error.on(e => {
                reject(
                    new AlphaTabError(AlphaTabErrorType.General, `Failed to render image (${e.message} ${e.stack})`, e)
                );
            });

            // NOTE: on some platforms we serialize/deserialize the score objects
            // this logic does the same just to ensure we get the right result
            const renderScore = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(options.score), settings);
            api.renderScore(renderScore, tracks);
        });

        const timeout = 2000 * runs.length;
        await Promise.race([
            render,
            new Promise<void>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Rendering did not complete after ${timeout}ms`));
                }, timeout);
            })
        ] as Promise<void>[]);

        try {
            const errors: Error[] = [];
            for (let i = 0; i < results.length; i++) {
                try {
                    await VisualTestHelper.compareVisualResult(
                        runs[i],
                        totalWidths[i],
                        totalHeights[i],
                        results[i],
                        referenceFileData[i]!,
                        api,
                        options
                    );
                } catch (e) {
                    if (e instanceof Error) {
                        errors.push(e);
                    } else {
                        throw e;
                    }
                }
            }

            if (errors.length === 1) {
                throw errors[0];
            }
            if (errors.length > 0) {
                const errorMessages = errors.map(e => e.message ?? 'Unknown error').join('\n');
                throw new Error(errorMessages);
            }
        } finally {
            api.destroy();
        }
    }

    private static _alphaSkiaPrepared: boolean = false;

    static async prepareAlphaSkia() {
        if (VisualTestHelper._alphaSkiaPrepared) {
            return;
        }

        const bravura: ArrayBuffer = (await TestPlatform.loadFile('font/bravura/Bravura.otf')).buffer as ArrayBuffer;
        VisualTestHelper.enableAlphaSkia(bravura);

        const fonts = [
            'font/noto-sans/NotoSans-Regular.otf',
            'font/noto-sans/NotoSans-Italic.otf',
            'font/noto-sans/NotoSans-Bold.otf',
            'font/noto-sans/NotoSans-BoldItalic.otf',
            'font/noto-serif/NotoSerif-Regular.otf',
            'font/noto-serif/NotoSerif-Italic.otf',
            'font/noto-serif/NotoSerif-Bold.otf',
            'font/noto-serif/NotoSerif-BoldItalic.otf',
            'font/noto-music/NotoMusic-Regular.otf',
            'font/noto-color-emoji/NotoColorEmoji_WindowsCompatible.ttf',
        ];

        for (const font of fonts) {
            Environment.registerAlphaSkiaCustomFont(await TestPlatform.loadFile(font));
        }

        VisualTestHelper._alphaSkiaPrepared = true;
    }

    /**
     * @target web
     * @partial
     */
    static enableAlphaSkia(bravura: ArrayBuffer) {
        alphaSkiaModule.AlphaSkiaCanvas.switchToFreeTypeFonts();
        Environment.enableAlphaSkia(bravura, alphaSkiaModule);
    }

    static prepareSettingsForTest(settings: Settings) {
        settings.core.engine = 'skia';
        Environment.HighDpiFactor = 1; // test data is in scale 1
        settings.core.enableLazyLoading = false;

        settings.display.resources.copyrightFont.families = ['Noto Sans', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.titleFont.families = ['Noto Serif', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.subTitleFont.families = ['Noto Serif', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.wordsFont.families = ['Noto Serif', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.effectFont.families = ['Noto Serif', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.timerFont.families = ['Noto Serif', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.fretboardNumberFont.families = ['Noto Sans', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.tablatureFont.families = ['Noto Sans', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.graceFont.families = ['Noto Sans', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.barNumberFont.families = ['Noto Sans', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.fingeringFont.families = ['Noto Serif', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.inlineFingeringFont.families = ['Noto Serif', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.markerFont.families = ['Noto Serif', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.directionsFont.families = ['Noto Serif', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.numberedNotationFont.families = ['Noto Sans', 'Noto Music', 'Noto Color Emoji'];
        settings.display.resources.numberedNotationGraceFont.families = ['Noto Sans', 'Noto Music', 'Noto Color Emoji'];
    }

    public static async compareVisualResult(
        run: VisualTestRun,
        totalWidth: number,
        totalHeight: number,
        result: RenderFinishedEventArgs[],
        referenceFileData: Uint8Array,
        api: AlphaTabApiBase<unknown>,
        options: VisualTestOptions
    ): Promise<void> {
        // create final full image
        using actual = new AlphaSkiaCanvas();
        actual.beginRender(totalWidth, totalHeight);
        for (const partialResult of result) {
            if (partialResult.renderResult) {
                using partialCanvas = partialResult.renderResult as AlphaSkiaImage;
                actual.drawImage(
                    partialCanvas,
                    partialResult.x,
                    partialResult.y,
                    partialResult.width,
                    partialResult.height
                );
            }
        }

        if (options.prepareFullImage) {
            options.prepareFullImage!(run, api, actual);
        }

        // convert reference image to canvas
        if (referenceFileData.length > 0) {
            using expected = AlphaSkiaImage.decode(referenceFileData.buffer as ArrayBuffer);
            await VisualTestHelper.expectToEqualVisuallyAsync(
                actual.endRender()!,
                run.referenceFileName,
                expected,
                options
            );
        } else {
            await VisualTestHelper.expectToEqualVisuallyAsync(
                actual.endRender()!,
                run.referenceFileName,
                undefined,
                options
            );
        }
    }

    private static async expectToEqualVisuallyAsync(
        actual: AlphaSkiaImage,
        expectedFileName: string,
        expected: AlphaSkiaImage | undefined,
        options: VisualTestOptions
    ): Promise<void> {
        let pass = false;
        let errorMessage = '';
        const oldActual = actual;

        const tolerancePercent = options.tolerancePercent ?? 1;

        if (expected) {
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
            errorMessage = '';

            try {
                const pixelMatchOptions = new PixelMatchOptions();
                pixelMatchOptions.threshold = 0.3;
                pixelMatchOptions.includeAA = false;
                pixelMatchOptions.diffMask = true;
                pixelMatchOptions.alpha = 1;

                const match = PixelMatch.match(
                    new Uint8Array(expectedImageData),
                    new Uint8Array(actualImageData),
                    new Uint8Array(diffImageData),
                    expected.width,
                    expected.height,
                    pixelMatchOptions
                );

                // only pixels that are not transparent are relevant for the diff-ratio
                const totalPixels = match.totalPixels - match.transparentPixels;
                const percentDifference = (match.differentPixels / totalPixels) * 100;

                pass = percentDifference <= tolerancePercent;
                // result.pass = match.differentPixels === 0;
                errorMessage = '';

                if (!pass) {
                    const percentDifferenceText = percentDifference.toFixed(2);
                    errorMessage = `Difference between original and new image is too big: ${match.differentPixels}/${totalPixels} (${percentDifferenceText}%)`;

                    using diffPng = AlphaSkiaImage.fromPixels(actual.width, actual.height, diffImageData)!;

                    await VisualTestHelper.saveFiles(expectedFileName, oldActual, diffPng);
                }

                if (sizeMismatch) {
                    errorMessage += `Image sizes do not match: expected ${expected.width}x${expected.height} but got ${oldActual.width}x${oldActual.height}`;
                    pass = false;
                }
            } catch (e) {
                pass = false;
                errorMessage = `Error comparing images: ${e}`;
            }
        } else {
            pass = false;
            errorMessage = `Missing reference image file${expectedFileName}`;
            await VisualTestHelper.saveFiles(expectedFileName, oldActual, undefined);
        }

        if (!pass) {
            throw new Error(errorMessage);
        }
        await VisualTestHelper.deleteFiles(expectedFileName);
    }

    static async saveFiles(
        expectedFilePath: string,
        actual: AlphaSkiaImage,
        diff: AlphaSkiaImage | undefined
    ): Promise<void> {
        if (diff) {
            const diffData = diff.toPng()!;

            const diffFileName = TestPlatform.changeExtension(expectedFilePath, '.diff.png');
            await TestPlatform.saveFile(diffFileName, new Uint8Array(diffData));
        }

        const actualData = actual.toPng()!;
        const actualFile = TestPlatform.changeExtension(expectedFilePath, '.new.png');
        await TestPlatform.saveFile(actualFile, new Uint8Array(actualData));
    }

    static async deleteFiles(expectedFilePath: string): Promise<void> {
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
