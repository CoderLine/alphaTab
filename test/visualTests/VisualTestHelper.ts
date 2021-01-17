import { ScoreLoader } from '@src/importer/ScoreLoader';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import { AlphaTabApi } from '@src/platform/javascript/AlphaTabApi';
import { CoreSettings } from '@src/CoreSettings';
import { Environment } from '@src/Environment';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { PixelMatch } from './PixelMatch';
import { JsonConverter } from '@src/model/JsonConverter';

/**
 * @partial
 * @target web
 */
export class VisualTestHelper {
    public static async runVisualTest(
        inputFile: string,
        settings?: Settings,
        tracks?: number[],
        message?: string
    ): Promise<void> {
        try {
            const inputFileData = await TestPlatform.loadFile(`test-data/visual-tests/${inputFile}`);
            const referenceFileName = TestPlatform.changeExtension(inputFile, '.png');
            let score: Score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

            await VisualTestHelper.runVisualTestScore(score, referenceFileName, settings, tracks, message);
        } catch (e) {
            fail(`Failed to run visual test ${e}`);
        }
    }

    public static async runVisualTestTex(
        tex: string,
        referenceFileName: string,
        settings?: Settings,
        tracks?: number[],
        message?: string
    ): Promise<void> {
        try {
            if (!settings) {
                settings = new Settings();
            }

            const importer = new AlphaTexImporter();
            importer.init(ByteBuffer.fromString(tex), settings);
            let score: Score = importer.readScore();

            await VisualTestHelper.runVisualTestScore(score, referenceFileName, settings, tracks, message);
        } catch (e) {
            fail(`Failed to run visual test ${e}`);
        }
    }

    public static async runVisualTestScore(
        score: Score,
        referenceFileName: string,
        settings?: Settings,
        tracks?: number[],
        message?: string
    ): Promise<void> {
        try {
            if (!settings) {
                settings = new Settings();
            }
            if (!tracks) {
                tracks = [0];
            }

            settings.core.fontDirectory = CoreSettings.ensureFullUrl('/base/font/bravura/');
            settings.core.engine = 'html5';
            Environment.HighDpiFactor = 1; // test data is in scale 1
            settings.core.enableLazyLoading = false;

            let referenceFileData: Uint8Array;
            try {
                referenceFileData = await TestPlatform.loadFile(`test-data/visual-tests/${referenceFileName}`);
            } catch (e) {
                referenceFileData = new Uint8Array(0);
            }

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
                    }, 2000);
                })
            ]);

            await VisualTestHelper.compareVisualResult(
                totalWidth,
                totalHeight,
                result,
                referenceFileName,
                referenceFileData,
                message
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
            if (data.length === 0) {
                const canvas = document.createElement('canvas');
                canvas.classList.add(className);
                canvas.width = 1;
                canvas.height = 1;
                canvas.dataset.filename = filename.split('/').slice(-1)[0];
                resolve(canvas);
            } else {
                const img = new Image();
                img.src = 'data:image/png;base64,' + btoa(data.reduce((p, d) => p + String.fromCharCode(d), ''));
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
            }
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
        referenceFileData: Uint8Array,
        message?: string
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

        jasmine.addAsyncMatchers({
            toEqualVisually: VisualTestHelper.toEqualVisually
        });

        await (expectAsync(actual) as any).toEqualVisually(expected, referenceFileName, message);
    }

    private static toEqualVisually(
        _utils: jasmine.MatchersUtil,
        _customEqualityTesters: ReadonlyArray<jasmine.CustomEqualityTester>
    ): jasmine.CustomAsyncMatcher {
        return {
            async compare(
                actual: HTMLCanvasElement,
                expected: HTMLCanvasElement,
                expectedFileName: string,
                message?: string
            ): Promise<jasmine.CustomMatcherResult> {
                const sizeMismatch = expected.width !== actual.width || expected.height !== actual.height;
                const oldActual = actual;
                if (sizeMismatch) {
                    const newActual = document.createElement('canvas');
                    newActual.width = expected.width;
                    newActual.height = expected.height;

                    const newActualContext = newActual.getContext('2d')!;
                    newActualContext.drawImage(actual, 0, 0);
                    newActualContext.strokeStyle = 'red';
                    newActualContext.lineWidth = 2;
                    newActualContext.strokeRect(0, 0, newActual.width, newActual.height);

                    actual = newActual;
                }

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
                    let match = PixelMatch.match(
                        new Uint8Array(expectedImageData.data.buffer),
                        new Uint8Array(actualImageData.data.buffer),
                        new Uint8Array(diffImageData.data.buffer),
                        expected.width,
                        expected.height,
                        {
                            threshold: 0.3,
                            includeAA: false,
                            diffMask: true,
                            alpha: 1
                        }
                    );

                    diffContext.putImageData(diffImageData, 0, 0);

                    // only pixels that are not transparent are relevant for the diff-ratio
                    let totalPixels = match.totalPixels - match.transparentPixels;
                    let percentDifference = (match.differentPixels / totalPixels) * 100;
                    result.pass = percentDifference < 1;
                    // result.pass = match.differentPixels < 5;

                    if (!result.pass) {
                        let percentDifferenceText = percentDifference.toFixed(2);
                        result.message = `Difference between original and new image is too big: ${match.differentPixels}/${totalPixels} (${percentDifferenceText}%)`;
                        await VisualTestHelper.saveFiles(expectedFileName, expected, oldActual, diff);
                    } else if (sizeMismatch) {
                        result.message = `Image sizes do not match: ${expected.width}/${expected.height} vs ${oldActual.width}/${oldActual.height}`;
                        result.pass = false;
                    }
                } catch (e) {
                    result.pass = false;
                    result.message = `Error comparing images: ${e}, ${message}`;
                }

                const jasmineRequire = Environment.globalThis.jasmineRequire;
                if (!result.pass && jasmineRequire.html) {
                    const errorMessage = `${result.message} (${message})`;
                    const dom = document.createElement('div');
                    dom.innerHTML = `
                        <strong>Error:</strong> ${errorMessage}<br/>
                        <div class="comparer" style="border: 1px solid #000">
                            <div class="expected"></div>
                            <div class="actual"></div>
                            <div class="diff"></div>
                        </div>
                    `;
                    actual.ondblclick = () => {
                        const a = document.createElement('a');
                        a.href = oldActual.toDataURL('image/png');
                        a.download = expected.dataset.filename ?? 'reference.png';
                        document.body.appendChild(a);
                        a.click();
                    };

                    dom.querySelector('.expected')!.appendChild(expected);
                    dom.querySelector('.actual')!.appendChild(actual);
                    dom.querySelector('.diff')!.appendChild(diff);
                    VisualTestHelper.initComparer(dom.querySelector('.comparer'));

                    (dom as any).toString = function () {
                        return errorMessage;
                    };
                    (dom as any)[Symbol.toPrimitive] = function() { 
                        return errorMessage;
                    };

                    (result as any).message = dom;
                }

                return result;
            }
        };
    }

    private static initComparer(el: HTMLElement | null) {
        if (!el) {
            return;
        }
        const ex = el.querySelector('.expected') as HTMLDivElement;
        const ac = el.querySelector('.actual') as HTMLDivElement;
        const df = el.querySelector('.diff') as HTMLDivElement;

        const exCanvas = ex.querySelector('canvas')!;
        const acCanvas = ac.querySelector('canvas')!;

        const width = Math.max(exCanvas.width, acCanvas.width);
        const height = Math.max(exCanvas.height, acCanvas.height);

        const controlsHeight = 60;

        el.style.width = width + 'px';
        el.style.height = height + controlsHeight + 'px';
        el.style.position = 'relative';

        ex.style.width = width + 'px';
        ex.style.height = height + 'px';
        ex.style.background = '#FFF';
        ex.style.position = 'absolute';
        ex.style.left = '0';
        ex.style.top = controlsHeight + 'px';

        ac.style.width = width / 2 + 'px';
        ac.style.height = height + 'px';
        ac.style.background = '#FFF';
        ac.style.position = 'absolute';
        ac.style.right = '0';
        ac.style.top = controlsHeight + 'px';
        ac.style.boxShadow = '-7px 0 10px -5px rgba(0,0,0,.5)';
        ac.style.overflow = 'hidden';
        acCanvas.style.position = 'absolute';
        acCanvas.style.right = '0';
        acCanvas.style.top = '0';

        df.style.display = 'none';
        df.style.width = width + 'px';
        df.style.height = height + 'px';
        df.style.background = '#FFF';
        df.style.position = 'absolute';
        df.style.left = '0';
        df.style.top = controlsHeight + 'px';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '1';
        slider.step = '0.001';
        slider.value = '0.5';
        slider.style.position = 'absolute';
        slider.style.top = '30px';
        slider.style.right = '0';
        slider.style.left = '0';
        slider.style.width = '100%';
        slider.oninput = () => {
            ac.style.width = width * (1 - parseFloat(slider.value)) + 'px';
        };
        el.appendChild(slider);

        const diffToggleLabel = document.createElement('label');
        diffToggleLabel.style.position = 'absolute';
        diffToggleLabel.style.left = '0';
        diffToggleLabel.style.top = '0';

        const diffToggle = document.createElement('input');
        diffToggle.type = 'checkbox';
        diffToggleLabel.appendChild(diffToggle);
        diffToggleLabel.appendChild(document.createTextNode('Show Diff'));
        diffToggle.onchange = () => {
            if (diffToggle.checked) {
                df.style.display = 'block';
            } else {
                df.style.display = 'none';
            }
        };
        el.appendChild(diffToggleLabel);
    }

    static async saveFiles(
        name: string,
        expected: HTMLCanvasElement,
        actual: HTMLCanvasElement,
        diff: HTMLCanvasElement
    ): Promise<void> {
        const expectedData = await VisualTestHelper.toPngBlob(expected);
        const actualData = await VisualTestHelper.toPngBlob(actual);
        const diffData = await VisualTestHelper.toPngBlob(diff);

        return new Promise((resolve, reject) => {
            let x: XMLHttpRequest = new XMLHttpRequest();
            x.open('POST', 'http://localhost:8090/save-visual-error/', true);
            x.onload = () => {
                resolve();
            };
            x.onerror = () => {
                reject();
            };
            const data = new FormData();
            data.append('name', name);
            data.append('expected', expectedData, VisualTestHelper.createFileName(name, 'expected'));
            data.append('actual', actualData, VisualTestHelper.createFileName(name, ''));
            data.append('diff', diffData, VisualTestHelper.createFileName(name, 'diff'));
            x.send(data);
        });
    }

    static async toPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject();
                }
            }, 'image/png');
        });
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

    static base64ArrayBuffer(bytes: Uint8Array) {
        let base64 = '';
        const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        const byteLength = bytes.byteLength;
        const byteRemainder = byteLength % 3;
        const mainLength = byteLength - byteRemainder;

        let a;
        let b;
        let c;
        let d;
        let chunk;

        // Main loop deals with bytes in chunks of 3
        for (let i = 0; i < mainLength; i += 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
            d = chunk & 63; // 63       = 2^6 - 1

            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }

        // Deal with the remaining bytes and padding
        if (byteRemainder === 1) {
            chunk = bytes[mainLength];

            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4; // 3   = 2^2 - 1

            base64 += `${encodings[a]}${encodings[b]}==`;
        } else if (byteRemainder === 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

            a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2; // 15    = 2^4 - 1

            base64 += `${encodings[a]}${encodings[b]}${encodings[c]}=`;
        }

        return base64;
    }
}
