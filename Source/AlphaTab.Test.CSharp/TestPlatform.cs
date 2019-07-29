using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using AlphaTab.Collections;
using AlphaTab.IO;
using AlphaTab.Test.CSharp;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using SkiaSharp;

namespace AlphaTab.Test
{
    internal class TestPlatform
    {
        public static void Done()
        {
        }

        public static IReadable CreateStringReader(string tex)
        {
            return ByteBuffer.FromBuffer(Encoding.UTF8.GetBytes(tex));
        }

        public static void LoadFile(string fileName, Action<byte[]> loaded, bool autoDone = true)
        {
            if (File.Exists(fileName))
            {
                loaded(File.ReadAllBytes(fileName));
            }
            else
            {
                loaded(null);
            }
            if (autoDone)
            {
                Done();
            }
        }

        public static void LoadFileAsString(string fileName, Action<string> loaded, bool autoDone = true)
        {
            if (File.Exists(fileName))
            {
                loaded(File.ReadAllText(fileName));
            }
            else
            {
                loaded(null);
            }
            if (autoDone)
            {
                Done();
            }
        }

        public static bool IsMatch(string value, string regex)
        {
            return Regex.IsMatch(value, regex);
        }

        public static string ChangeExtension(string file, string extension)
        {
            var lastDot = file.LastIndexOf(".");
            if (lastDot == -1)
            {
                return file + extension;
            }
            else
            {
                return file.Substring(0, lastDot) + extension;
            }
        }

        public static void CompareVisualResult(float totalWidth, float totalHeight, FastList<object> result, string referenceImageFileName, byte[] referenceFileData)
        {
            SKBitmap finalBitmap;
            SKBitmap referenceBitmap;

            using (var finalImageSurface = SKSurface.Create(new SKImageInfo((int)totalWidth, (int)totalHeight,
                SKImageInfo.PlatformColorType, SKAlphaType.Premul)))
            {
                var point = new SKPoint();
                var rowHeight = 0;
                foreach (var img in result.OfType<SKImage>())
                {
                    finalImageSurface.Canvas.DrawImage(img, point);
                    if (img.Height > rowHeight)
                    {
                        rowHeight = img.Height;
                    }

                    point.X += img.Width;

                    if (point.X >= totalWidth)
                    {
                        point.X = 0;
                        point.Y += rowHeight;
                        rowHeight = 0;
                    }
                }

                using (var finalImage = finalImageSurface.Snapshot())
                {
                    finalBitmap = SKBitmap.FromImage(finalImage);
                }
            }

            var finalImageFileName = Path.ChangeExtension(referenceImageFileName, ".new.png");
            using (finalBitmap)
            {
                var dir = Path.GetDirectoryName(finalImageFileName);
                Directory.CreateDirectory(dir);

                using (var fileStream = new SKFileWStream(finalImageFileName))
                {
                    SKPixmap.Encode(fileStream, finalBitmap, SKEncodedImageFormat.Png, 100);
                }

                using (var data = SKData.CreateCopy(referenceFileData))
                {
                    referenceBitmap = SKBitmap.Decode(data);
                }
                 
                using (referenceBitmap)
                {
                    var compareResult = PixelMatch.Run(finalBitmap, referenceBitmap, new PixelMatchOptions
                    {
                        IncludeAntiAlias = true,
                        IgnoreTransparent = true,
                        CreateOutputImage = true
                    });


                    using (compareResult.Output)
                    {
                        Assert.IsTrue(compareResult.SizesMatch, "Dimensions differ");

                        if (compareResult.DifferentPixels > 100)
                        {
                            var diffImageName = Path.ChangeExtension(referenceImageFileName, ".diff.png");
                            using (var fileStream = new SKFileWStream(diffImageName))
                            {
                                SKPixmap.Encode(fileStream, compareResult.Output, SKEncodedImageFormat.Png, 100);
                            }
                            Assert.Fail($"Difference between original and new image is too big: {compareResult.Mismatch:P}, {compareResult.DifferentPixels}/{compareResult.TotalPixels}");
                        }
                    }
                }

            }
            File.Delete(finalImageFileName);
        }

    }
}
