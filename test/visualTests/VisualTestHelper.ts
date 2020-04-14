import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { Score } from '@src/model/Score';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import pixelmatch from 'pixelmatch';
import { AlphaTabApi } from '@src/platform/javaScript/AlphaTabApi';
import { CoreSettings, Environment } from '@src/alphatab';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';

export class VisualTestHelper {
    public static async runVisualTest(inputFile: string, settings?: Settings, tracks?: number[]): Promise<void> {
        try {
            if (!settings) {
                settings = new Settings();
            }
            if (!tracks) {
                tracks = [0];
            }

            settings.core.fontDirectory = CoreSettings.ensureFullUrl('/base/font/bravura/');
            settings.core.engine = 'html5';
            settings.core.enableLazyLoading = false;

            const inputFileData = await TestPlatform.loadFile(`test-data/visual-tests/${inputFile}`);
            const referenceFileName = TestPlatform.changeExtension(inputFile, '.png');
            const referenceFileData = await TestPlatform.loadFile(`test-data/visual-tests/${referenceFileName}`);
            let score: Score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

            const renderElement = document.createElement('div');
            renderElement.style.width = '1300px';
            renderElement.style.position = 'absolute';
            renderElement.style.visibility = 'hidden';
            document.body.appendChild(renderElement);

            // here we need to trick a little bit, normally SVG does not require the font to be loaded
            // before rendering starts, but in our case we need it to convert it later for diffing to raster.
            // so we initiate the bravura load and wait for it before proceeding with rendering.
            Environment.createStyleElement(document, settings.core.fontDirectory);
            await Promise.race([
                new Promise<void>((resolve, reject) => {
                    if (Environment.bravuraFontChecker.isFontLoaded) {
                        resolve();
                    } else {
                        Environment.bravuraFontChecker.fontLoaded.on(() => {
                            resolve();
                        });
                        Environment.bravuraFontChecker.checkForFontAvailability();
                    }
                }),
                new Promise<void>((_, reject) => {
                    setTimeout(() => {
                        reject(new Error('Font loading did not complete in time'));
                    }, 2000);
                })
            ]);

            let result: RenderFinishedEventArgs[] = [];
            let totalWidth: number = 0;
            let totalHeight: number = 0;
            let render = new Promise<void>((resolve, reject) => {
                const api = new AlphaTabApi(renderElement, settings);
                api.renderer.partialRenderFinished.on(e => {
                    if (e) {
                        result.push(e);
                    }
                });
                api.renderer.renderFinished.on(e => {
                    totalWidth = e.totalWidth;
                    totalHeight = e.totalHeight;
                    result.push(e);
                    resolve();
                });
                api.error.on((s, e) => {
                    reject(`Failed to render image: ${s},${e}`);
                });
                api.renderScore(score, new Int32Array(tracks!));
            });

            await Promise.race([
                render,
                new Promise<void>((_, reject) => {
                    setTimeout(() => {
                        reject(new Error('Rendering did not complete in time'));
                    }, 2000);
                })
            ]);

            await VisualTestHelper.compareVisualResult(
                totalWidth,
                totalHeight,
                result,
                referenceFileName,
                referenceFileData
            );
        } catch (e) {
            fail(`Failed to run visual test ${e}`);
        }
    }

    private static convertPngToCanvas(
        data: Uint8Array,
        filename: string,
        className: string
    ): Promise<HTMLCanvasElement> {
        return new Promise<HTMLCanvasElement>((resolve, reject) => {
            const img = new Image();
            img.src = 'data:image/png;base64,' + btoa(String.fromCharCode.apply(null, data as any));
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.classList.add(className);
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.dataset.filename = filename.split('/').slice(-1)[0];
                const context = canvas.getContext('2d')!;
                context.drawImage(img, 0, 0);

                resolve(canvas);
            };
            img.onerror = function (e) {
                reject(e);
            };
        });
    }

    private static convertSvgToImage(svg: string): Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(svg);
            img.onload = function () {
                resolve(img);
            };
            img.onerror = function (e) {
                reject(e);
            };
        });
    }

    public static async compareVisualResult(
        totalWidth: number,
        totalHeight: number,
        result: RenderFinishedEventArgs[],
        referenceFileName: string,
        referenceFileData: Uint8Array
    ): Promise<void> {
        // create final full image
        const actual = document.createElement('canvas');
        actual.classList.add('actual-image');
        actual.width = totalWidth;
        actual.height = totalHeight;
        const actualImageContext = actual.getContext('2d')!;

        const point = {
            x: 0,
            y: 0
        };
        let rowHeight = 0;
        for (const partialResult of result) {
            const partialCanvas = partialResult.renderResult;

            let imageSource: CanvasImageSource | null = null;
            if (partialCanvas instanceof HTMLCanvasElement) {
                imageSource = partialCanvas;
            } else if (typeof partialCanvas === 'string') {
                imageSource = await VisualTestHelper.convertSvgToImage(partialCanvas);
            }

            if (imageSource) {
                actualImageContext.drawImage(imageSource, point.x, point.y);

                if (partialResult.height > rowHeight) {
                    rowHeight = partialResult.height;
                }

                point.x += partialResult.width;

                if (point.x >= totalWidth) {
                    point.x = 0;
                    point.y += rowHeight | 0;
                    rowHeight = 0;
                }
            }
        }

        // convert reference image to canvas
        const expected = await VisualTestHelper.convertPngToCanvas(
            referenceFileData,
            referenceFileName,
            'expected-image'
        );

        jasmine.addMatchers({
            toEqualVisually: VisualTestHelper.toEqualVisually
        });

        (expect(actual) as any).toEqualVisually(expected);
    }

    private static toEqualVisually(
        _utils: jasmine.MatchersUtil,
        _customEqualityTesters: ReadonlyArray<jasmine.CustomEqualityTester>
    ): jasmine.CustomMatcher {
        return {
            compare(actual: HTMLCanvasElement, expected: HTMLCanvasElement): jasmine.CustomMatcherResult {
                const actualImageData = actual.getContext('2d')!.getImageData(0, 0, actual.width, actual.height);

                const expectedImageData = expected
                    .getContext('2d')!
                    .getImageData(0, 0, expected.width, expected.height);

                // do visual comparison
                const diff = document.createElement('canvas');
                diff.width = expected.width;
                diff.height = expected.height;
                const diffContext = diff.getContext('2d')!;
                const diffImageData = diffContext.createImageData(diff.width, diff.height);
                const result: jasmine.CustomMatcherResult = {
                    pass: true,
                    message: ''
                };
                try {
                    let differentPixels = pixelmatch(
                        new Uint8Array(expectedImageData.data.buffer),
                        new Uint8Array(actualImageData.data.buffer),
                        new Uint8Array(diffImageData.data.buffer),
                        expected.width,
                        expected.height,
                        {
                            threshold: 0.1,
                            includeAA: false,
                            diffMask: true,
                            alpha: 1
                        }
                    );

                    diffContext.putImageData(diffImageData, 0, 0);

                    result.pass = differentPixels <= 100;

                    if (!result.pass) {
                        let totalPixels = expected.width * expected.height;
                        let percentDifference = ((differentPixels / totalPixels) * 100).toFixed(2);
                        result.message = `Difference between original and new image is too big: ${differentPixels}/${totalPixels} (${percentDifference}%)`;
                    }
                } catch (e) {
                    result.pass = false;
                    result.message = `Error comparing images: ${e}`;
                }

                const jasmineRequire = (globalThis as any).jasmineRequire;
                if (!result.pass && jasmineRequire.html) {
                    const dom = document.createElement('div');
                    dom.innerHTML = `
                        <strong>Error:</strong> ${result.message}<br/>
                        <strong>Expected:</strong> 
                        <div class="expected" style="border: 1px solid #000"></div>
                        <strong>Actual:</strong> 
                        <div class="actual" style="border: 1px solid #000"></div>
                        <strong>Diff:</strong> 
                        <div class="diff" style="border: 1px solid #000"></div>
                    `;

                    actual.ondblclick = () => {
                        const a = document.createElement('a');
                        a.href = actual.toDataURL('image/png');
                        a.download = expected.dataset.filename ?? 'reference.png';
                        document.body.appendChild(a);
                        a.click();
                    };

                    dom.querySelector('.expected')!.appendChild(expected);
                    dom.querySelector('.actual')!.appendChild(actual);
                    dom.querySelector('.diff')!.appendChild(diff);
                    (dom as any).toString = function () {
                        return result.message;
                    };
                    (result as any).message = dom;
                }

                return result;
            }
        };
    }
}
