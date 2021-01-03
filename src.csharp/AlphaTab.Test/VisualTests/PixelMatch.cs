using System;
using System.Data;
using SkiaSharp;

namespace AlphaTab.VisualTests
{
    // Based on MapBox PixelMatch: https://github.com/mapbox/pixelmatch

    // ISC License

    // Copyright(c) 2018, Mapbox

    // Permission to use, copy, modify, and/or distribute this software for any purpose
    // with or without fee is hereby granted, provided that the above copyright notice
    // and this permission notice appear in all copies.


    // THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    // REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
    // FITNESS.IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    // INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
    // OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
    // TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
    // THIS SOFTWARE.

    internal class PixelMatch
    {
        public static unsafe PixelMatchResult Run(SKBitmap img1, SKBitmap img2,
            PixelMatchOptions options)
        {
            var result = new PixelMatchResult();

            if (img1.Width == img2.Width && img1.Height == img2.Height)
            {
                result.SizesMatch = true;
            }
            else
            {
                result.SizesMatch = false;
                return result;
            }

            var threshold = options.Threshold;
            // maximum acceptable square distance between two colors;
            // 35215 is the maximum possible value for the YIQ difference metric
            var maxDelta = 35215 * threshold * threshold;
            var diff = 0;

            var width = img1.Width;
            var height = img1.Height;

            var img1Raw = (byte*) img1.GetPixels().ToPointer();
            var img2Raw = (byte*) img2.GetPixels().ToPointer();
            byte* outputRaw = null;

            // compare each pixel of one image against the other one
            if (options.CreateOutputImage)
            {
                result.Output =
                    new SKBitmap(new SKImageInfo(width, height, SKImageInfo.PlatformColorType,
                        SKAlphaType.Premul));
                outputRaw = (byte*) result.Output.GetPixels().ToPointer();
            }

            var totalPixels = 0;

            for (var y = 0; y < height; y++)
            {
                for (var x = 0; x < width; x++)
                {
                    var pos = (y * width + x) * 4;
                    // squared YUV distance between colors at this pixel position
                    var delta = ColorDelta(img1Raw, img2Raw, pos, pos, false,
                        out var wasTransparent);

                    if (wasTransparent && options.IgnoreTransparent)
                    {
                        continue;
                    }

                    totalPixels++;

                    // the color difference is above the threshold
                    if (delta > maxDelta)
                    {
                        // check it's a real rendering difference or just anti-aliasing
                        if (!options.IncludeAntiAlias &&
                            (AntiAliased(img1Raw, x, y, width, height, img2Raw) ||
                             AntiAliased(img2Raw, x, y, width, height, img1Raw)))
                        {
                            // one of the pixels is anti-aliasing; draw as yellow and do not count as difference
                            if (options.CreateOutputImage)
                            {
                                DrawPixel(outputRaw, pos, 255, 255, 0);
                            }
                        }
                        else
                        {
                            // found substantial difference not caused by anti-aliasing; draw it as red
                            if (options.CreateOutputImage)
                            {
                                DrawPixel(outputRaw, pos, 255, 0, 0);
                            }

                            diff++;
                        }
                    }
                    else if (options.CreateOutputImage)
                    {
                        // pixels are similar; draw background as grayscale image blended with white
                        var val = (byte) Blend(GrayPixel(img1Raw, pos), 0.1);
                        DrawPixel(outputRaw, pos, val, val, val);
                    }
                }
            }

            result.DifferentPixels = diff;
            result.TotalPixels = totalPixels;
            return result;
        }

        private static unsafe bool AntiAliased(byte* img, int x1, int y1, int width, int height,
            byte* img2 = null)
        {
            var x0 = Math.Max(x1 - 1, 0);
            var y0 = Math.Max(y1 - 1, 0);
            var x2 = Math.Min(x1 + 1, width - 1);
            var y2 = Math.Min(y1 + 1, height - 1);
            var pos = (y1 * width + x1) * 4;
            var zeroes = 0;
            double min = 0;
            double max = 0;

            var minX = 0;
            var minY = 0;
            var maxX = 0;
            var maxY = 0;

            // go through 8 adjacent pixels
            for (var x = x0; x <= x2; x++)
            {
                for (var y = y0; y <= y2; y++)
                {
                    if (x == x1 && y == y1)
                    {
                        continue;
                    }

                    // brightness delta between the center pixel and adjacent one
                    var delta = ColorDelta(img, img, pos, (y * width + x) * 4, true,
                        out var wasTransparent);

                    // count the number of equal, darker and brighter adjacent pixels
                    if (delta == 0)
                    {
                        zeroes++;
                        // if found more than 2 equal siblings, it's definitely not anti-aliasing
                        if (zeroes > 2)
                        {
                            return false;
                        }
                    }
                    // remember darkest pixel
                    else if (delta < min)
                    {
                        min = delta;
                        minX = x;
                        minY = y;
                    }
                    // remember the brightest pixel
                    else if (delta > max)
                    {
                        max = delta;
                        maxX = x;
                        maxY = y;
                    }
                }
            }

            // if there are no both darker and brighter pixels among siblings, it's not anti-aliasing
            if (min == 0 || max == 0)
            {
                return false;
            }

            // if either the darkest or the brightest pixel has more than 2 equal siblings in both images
            // (definitely not anti-aliased), this pixel is anti-aliased
            return (HasManySiblings(img, minX, minY, width, height) &&
                    HasManySiblings(img2, minX, minY, width, height)) ||
                   (HasManySiblings(img, maxX, maxY, width, height) &&
                    HasManySiblings(img2, maxX, maxY, width, height));
        }

        // check if a pixel has 3+ adjacent pixels of the same color.
        private static unsafe bool HasManySiblings(byte* img, int x1, int y1, int width, int height)
        {
            var x0 = Math.Max(x1 - 1, 0);
            var y0 = Math.Max(y1 - 1, 0);
            var x2 = Math.Min(x1 + 1, width - 1);
            var y2 = Math.Min(y1 + 1, height - 1);
            var pos = (y1 * width + x1) * 4;
            var zeroes = x1 == x0 || x1 == x2 || y1 == y0 || y1 == y2 ? 1 : 0;

            // go through 8 adjacent pixels
            for (var x = x0; x <= x2; x++)
            {
                for (var y = y0; y <= y2; y++)
                {
                    if (x == x1 && y == y1) continue;

                    var pos2 = (y * width + x) * 4;
                    if (img[pos] == img[pos2] &&
                        img[pos + 1] == img[pos2 + 1] &&
                        img[pos + 2] == img[pos2 + 2] &&
                        img[pos + 3] ==
                        img[pos2 + 3]) zeroes++;

                    if (zeroes > 2) return true;
                }
            }

            return false;
        }

        private static unsafe byte GrayPixel(byte* img, int i)
        {
            var a = img[i + 3] / 255;
            var r = Blend(img[i + 0], a);
            var g = Blend(img[i + 1], a);
            var b = Blend(img[i + 2], a);
            return (byte) Rgb2Y(r, g, b);
        }

        private static unsafe void DrawPixel(byte* outputRaw, int pos, byte r, byte g, byte b)
        {
            outputRaw[pos + 0] = r;
            outputRaw[pos + 1] = g;
            outputRaw[pos + 2] = b;
            outputRaw[pos + 3] = 255;
        }

        private static unsafe double ColorDelta(byte* img1, byte* img2, int k, int m, bool yOnly,
            out bool wasTransparent)
        {
            double r1 = img1[k + 0];
            double g1 = img1[k + 1];
            double b1 = img1[k + 2];
            double a1 = img1[k + 3];

            double r2 = img2[m + 0];
            double g2 = img2[m + 1];
            double b2 = img2[m + 2];
            double a2 = img2[m + 3];

            wasTransparent = Math.Abs(a1) < 0.01 && Math.Abs(a2) < 0.01;

            if (a1 == a2 && r1 == r2 && g1 == g2 && b1 == b2) return 0;

            if (a1 < 255) {
                a1 /= 255;
                r1 = Blend(r1, a1);
                g1 = Blend(g1, a1);
                b1 = Blend(b1, a1);
            }

            if (a2 < 255) {
                a2 /= 255;
                r2 = Blend(r2, a2);
                g2 = Blend(g2, a2);
                b2 = Blend(b2, a2);
            }

            var y = Rgb2Y(r1, g1, b1) - Rgb2Y(r2, g2, b2);

            if (yOnly) return y; // brightness difference only

            var i = Rgb2I(r1, g1, b1) - Rgb2I(r2, g2, b2);
            var q = Rgb2Q(r1, g1, b1) - Rgb2Q(r2, g2, b2);

            return 0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q;
        }

        private static double Rgb2Q(double r, double g, double b)
        {
            return r * 0.21147017 - g * 0.52261711 + b * 0.31114694;
        }

        private static double Rgb2I(double r, double g, double b)
        {
            return r * 0.59597799 - g * 0.27417610 - b * 0.32180189;
        }

        private static double Rgb2Y(double r, double g, double b)
        {
            return r * 0.29889531 + g * 0.58662247 + b * 0.11448223;
        }

        private static double Blend(double c, double a)
        {
            return 255 + (c - 255) * a;
        }
    }

    internal class PixelMatchOptions
    {
        public double Threshold { get; set; }
        public bool IncludeAntiAlias { get; set; }

        public bool CreateOutputImage { get; set; }
        public bool IgnoreTransparent { get; set; }

        public PixelMatchOptions()
        {
            Threshold = 0.1;
        }
    }

    internal class PixelMatchResult
    {
        public SKBitmap? Output { get; set; }
        public int DifferentPixels { get; set; }
        public int TotalPixels { get; set; }
        public double Mismatch => DifferentPixels / (double) TotalPixels;
        public bool SizesMatch { get; set; }
    }
}
