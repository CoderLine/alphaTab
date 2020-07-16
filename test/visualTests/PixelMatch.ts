/**
 * Based on https://github.com/mapbox/pixelmatch
 * ISC License
 * Copyright (c) 2019, Mapbox
 * 
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 * THIS SOFTWARE.
 */
'use strict';

interface Options {
    /**
     * Matching threshold, ranges from 0 to 1. Smaller values make the comparison more sensitive.
     * @default 0.1
     */
    readonly threshold?: number;
    /**
     * If true, disables detecting and ignoring anti-aliased pixels.
     * @default false
     */
    readonly includeAA?: boolean;
    /**
     * Blending factor of unchanged pixels in the diff output.
     * Ranges from 0 for pure white to 1 for original brightness
     * @default 0.1
     */
    alpha?: number;
    /**
     * The color of anti-aliased pixels in the diff output.
     * @default [255, 255, 0]
     */
    aaColor?: number[];
    /**
     * The color of differing pixels in the diff output.
     * @default [255, 0, 0]
     */
    diffColor?: number[];
    /**
     * An alternative color to use for dark on light differences to differentiate between "added" and "removed" parts.
     * If not provided, all differing pixels use the color specified by `diffColor`.
     * @default null
     */
    diffColorAlt?: number[];
    /**
     * Draw the diff over a transparent background (a mask), rather than over the original image.
     * Will not draw anti-aliased pixels (if detected)
     * @default false
     */
    diffMask?: boolean;
}

interface Result {
    readonly totalPixels: number;
    readonly differentPixels: number;
    readonly transparentPixels: number;
}

/**
 * @target web
 */
export class PixelMatch {
    static defaultOptions: Options = {
        threshold: 0.1, // matching threshold (0 to 1); smaller is more sensitive
        includeAA: false, // whether to skip anti-aliasing detection
        alpha: 0.1, // opacity of original image in diff ouput
        aaColor: [255, 255, 0], // color of anti-aliased pixels in diff output
        diffColor: [255, 0, 0], // color of different pixels in diff output
        diffMask: false // draw the diff over a transparent background (a mask)
    };

    static match(img1: Uint8Array, img2: Uint8Array, output: Uint8Array, width: number, height: number, options: Options): Result {
        if (
            !PixelMatch.isPixelData(img1) ||
            !PixelMatch.isPixelData(img2) ||
            (output && !PixelMatch.isPixelData(output))
        ) {
            throw new Error('Image data: Uint8Array, Uint8ClampedArray or Buffer expected.');
        }

        if (img1.length !== img2.length || (output && output.length !== img1.length)) {
            throw new Error('Image sizes do not match.');
        }

        if (img1.length !== width * height * 4) throw new Error('Image data size does not match width/height.');

        options = Object.assign({}, PixelMatch.defaultOptions, options);

        // check if images are identical
        const len = width * height;
        const a32 = new Uint32Array(img1.buffer, img1.byteOffset, len);
        const b32 = new Uint32Array(img2.buffer, img2.byteOffset, len);
        let identical = true;
        let transparentPixels = 0;

        for (let i = 0; i < len; i++) {
            if (a32[i] !== b32[i]) {
                identical = false;
                break;
            }
            if ((a32[i] & 0xff000000) === 0xff000000) {
                transparentPixels++;
            }
        }
        if (identical) {
            // fast path if identical
            if (output && !options.diffMask) {
                for (let i = 0; i < len; i++) PixelMatch.drawGrayPixel(img1, 4 * i, options.alpha!, output);
            }
            return {
                totalPixels: len,
                differentPixels: 0,
                transparentPixels: transparentPixels
            };
        }

        transparentPixels = 0;

        // maximum acceptable square distance between two colors;
        // 35215 is the maximum possible value for the YIQ difference metric
        const maxDelta = 35215 * options.threshold! * options.threshold!;

        let diff = 0;
        const [aaR, aaG, aaB] = options.aaColor!;
        const [diffR, diffG, diffB] = options.diffColor!;

        // compare each pixel of one image against the other one
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pos = (y * width + x) * 4;

                if (img1[pos + 3] === 0) {
                    transparentPixels++;
                }
                // squared YUV distance between colors at this pixel position
                const delta = PixelMatch.colorDelta(img1, img2, pos, pos);

                // the color difference is above the threshold
                if (delta > maxDelta) {
                    // check it's a real rendering difference or just anti-aliasing
                    if (
                        !options.includeAA &&
                        (PixelMatch.antialiased(img1, x, y, width, height, img2) ||
                            PixelMatch.antialiased(img2, x, y, width, height, img1))
                    ) {
                        // one of the pixels is anti-aliasing; draw as yellow and do not count as difference
                        // note that we do not include such pixels in a mask
                        if (output && !options.diffMask) PixelMatch.drawPixel(output, pos, aaR, aaG, aaB);
                    } else {
                        // found substantial difference not caused by anti-aliasing; draw it as red
                        if (output) PixelMatch.drawPixel(output, pos, diffR, diffG, diffB);
                        diff++;
                    }
                } else if (output) {
                    // pixels are similar; draw background as grayscale image blended with white
                    if (!options.diffMask) PixelMatch.drawGrayPixel(img1, pos, options.alpha!, output);
                }
            }
        }

        // return the number of different pixels
        return {
            totalPixels: len,
            transparentPixels: transparentPixels,
            differentPixels: diff
        };
    }

    static isPixelData(arr: object) {
        // work around instanceof Uint8Array not working properly in some Jest environments
        return ArrayBuffer.isView(arr) && (arr.constructor as any).BYTES_PER_ELEMENT === 1;
    }

    // check if a pixel is likely a part of anti-aliasing;
    // based on "Anti-aliased Pixel and Intensity Slope Detector" paper by V. Vysniauskas, 2009

    static antialiased(img: Uint8Array, x1: number, y1: number, width: number, height: number, img2: Uint8Array) {
        const distance = 1;
        const x0 = Math.max(x1 - distance, 0);
        const y0 = Math.max(y1 - distance, 0);
        const x2 = Math.min(x1 + distance, width - 1);
        const y2 = Math.min(y1 + distance, height - 1);
        const pos = (y1 * width + x1) * 4;
        let zeroes = x1 === x0 || x1 === x2 || y1 === y0 || y1 === y2 ? 1 : 0;
        let min = 0;
        let max = 0;
        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;

        // go through 8 adjacent pixels
        for (let x = x0; x <= x2; x++) {
            for (let y = y0; y <= y2; y++) {
                if (x === x1 && y === y1) continue;

                // brightness delta between the center pixel and adjacent one
                const delta = PixelMatch.colorDelta(img, img, pos, (y * width + x) * 4, true);

                // count the number of equal, darker and brighter adjacent pixels
                if (delta === 0) {
                    zeroes++;
                    // if found more than 2 equal siblings, it's definitely not anti-aliasing
                    if (zeroes > 2) return false;

                    // remember the darkest pixel
                } else if (delta < min) {
                    min = delta;
                    minX = x;
                    minY = y;

                    // remember the brightest pixel
                } else if (delta > max) {
                    max = delta;
                    maxX = x;
                    maxY = y;
                }
            }
        }

        // if there are no both darker and brighter pixels among siblings, it's not anti-aliasing
        if (min === 0 || max === 0) return false;

        // if either the darkest or the brightest pixel has 3+ equal siblings in both images
        // (definitely not anti-aliased), this pixel is anti-aliased
        return (
            (PixelMatch.hasManySiblings(img, minX, minY, width, height) &&
                PixelMatch.hasManySiblings(img2, minX, minY, width, height)) ||
            (PixelMatch.hasManySiblings(img, maxX, maxY, width, height) &&
                PixelMatch.hasManySiblings(img2, maxX, maxY, width, height))
        );
    }

    // check if a pixel has 3+ adjacent pixels of the same color.
    static hasManySiblings(img: Uint8Array, x1: number, y1: number, width: number, height: number) {
        const distance = 1;
        const x0 = Math.max(x1 - distance, 0);
        const y0 = Math.max(y1 - distance, 0);
        const x2 = Math.min(x1 + distance, width - 1);
        const y2 = Math.min(y1 + distance, height - 1);
        const pos = (y1 * width + x1) * 4;
        let zeroes = x1 === x0 || x1 === x2 || y1 === y0 || y1 === y2 ? 1 : 0;

        // go through 8 adjacent pixels
        for (let x = x0; x <= x2; x++) {
            for (let y = y0; y <= y2; y++) {
                if (x === x1 && y === y1) continue;

                const pos2 = (y * width + x) * 4;
                if (
                    img[pos] === img[pos2] &&
                    img[pos + 1] === img[pos2 + 1] &&
                    img[pos + 2] === img[pos2 + 2] &&
                    img[pos + 3] === img[pos2 + 3]
                ) {
                    zeroes++;
                }

                if (zeroes > 2) return true;
            }
        }

        return false;
    }

    // calculate color difference according to the paper "Measuring perceived color difference
    // using YIQ NTSC transmission color space in mobile applications" by Y. Kotsarenko and F. Ramos

    static colorDelta(img1: Uint8Array, img2: Uint8Array, k: number, m: number, yOnly: boolean = false) {
        let r1 = img1[k + 0];
        let g1 = img1[k + 1];
        let b1 = img1[k + 2];
        let a1 = img1[k + 3];

        let r2 = img2[m + 0];
        let g2 = img2[m + 1];
        let b2 = img2[m + 2];
        let a2 = img2[m + 3];

        if (a1 === a2 && r1 === r2 && g1 === g2 && b1 === b2) return 0;

        if (a1 < 255) {
            a1 /= 255;
            r1 = PixelMatch.blend(r1, a1);
            g1 = PixelMatch.blend(g1, a1);
            b1 = PixelMatch.blend(b1, a1);
        }

        if (a2 < 255) {
            a2 /= 255;
            r2 = PixelMatch.blend(r2, a2);
            g2 = PixelMatch.blend(g2, a2);
            b2 = PixelMatch.blend(b2, a2);
        }

        const y = PixelMatch.rgb2y(r1, g1, b1) - PixelMatch.rgb2y(r2, g2, b2);

        if (yOnly) return y; // brightness difference only

        const i = PixelMatch.rgb2i(r1, g1, b1) - PixelMatch.rgb2i(r2, g2, b2);
        const q = PixelMatch.rgb2q(r1, g1, b1) - PixelMatch.rgb2q(r2, g2, b2);

        return 0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q;
    }

    static rgb2y(r: number, g: number, b: number) {
        return r * 0.29889531 + g * 0.58662247 + b * 0.11448223;
    }
    static rgb2i(r: number, g: number, b: number) {
        return r * 0.59597799 - g * 0.2741761 - b * 0.32180189;
    }
    static rgb2q(r: number, g: number, b: number) {
        return r * 0.21147017 - g * 0.52261711 + b * 0.31114694;
    }

    // blend semi-transparent color with white
    static blend(c: number, a: number) {
        return 255 + (c - 255) * a;
    }

    static drawPixel(output: Uint8Array, pos: number, r: number, g: number, b: number) {
        output[pos + 0] = r;
        output[pos + 1] = g;
        output[pos + 2] = b;
        output[pos + 3] = 255;
    }

    static drawGrayPixel(img: Uint8Array, i: number, alpha: number, output: Uint8Array) {
        const r = img[i + 0];
        const g = img[i + 1];
        const b = img[i + 2];
        const val = PixelMatch.blend(PixelMatch.rgb2y(r, g, b), (alpha * img[i + 3]) / 255);
        PixelMatch.drawPixel(output, i, val, val, val);
    }
}
