using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AlphaTab.Core;
using AlphaTab.Core.EcmaScript;
using AlphaTab.Importer;
using AlphaTab.Rendering;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using SkiaSharp;

namespace AlphaTab.VisualTests
{
    public class VisualTestHelper
    {
        public static async Task RunVisualTest(string inputFile, Settings? settings = null,
            IList<double>? tracks = null)
        {
            if (settings == null)
            {
                settings = new Settings();
            }

            if (tracks == null)
            {
                tracks = new List<double> {0};
            }

            settings.Core.Engine = "skia";
            settings.Core.EnableLazyLoading = false;
            settings.Core.UseWorkers = false;

            inputFile = $"test-data/visual-tests/{inputFile}";

            var inputFileData = await TestPlatform.LoadFile(inputFile);
            var referenceFileName = TestPlatform.ChangeExtension(inputFile, ".png");
            var referenceFileData =
                await TestPlatform.LoadFile(referenceFileName);
            var score = ScoreLoader.LoadScoreFromBytes(inputFileData, settings);

            var result = new List<RenderFinishedEventArgs>();
            var totalWidth = 0.0;
            var totalHeight = 0.0;

            var task = new TaskCompletionSource<object>();
            var renderer = new ScoreRenderer(settings);
            renderer.Width = 1300;

            renderer.PartialRenderFinished.On(e =>
            {
                if (e != null)
                {
                    result.Push(e);
                }
            });
            renderer.RenderFinished.On(e =>
            {
                totalWidth = e.TotalWidth;
                totalHeight = e.TotalHeight;
                result.Push(e);
                task.SetResult(null);
            });
            renderer.Error.On((e) => { task.SetException(e); });
            renderer.RenderScore(score, tracks);

            if (await Task.WhenAny(task.Task, Task.Delay(2000)) == task.Task)
            {
                await CompareVisualResult(
                    totalWidth,
                    totalHeight,
                    result,
                    referenceFileName,
                    referenceFileData
                );
            }
            else
            {
                Assert.Fail("Rendering did not complete within timeout");
            }
        }

        private static async Task CompareVisualResult(double totalWidth, double totalHeight,
            List<RenderFinishedEventArgs> result, string referenceFileName,
            Uint8Array referenceFileData)
        {
            SKBitmap finalBitmap;

            using (var finalImageSurface = SKSurface.Create(new SKImageInfo((int) totalWidth,
                (int) totalHeight,
                SKImageInfo.PlatformColorType, SKAlphaType.Premul)))
            {
                var point = new SKPoint();
                var rowHeight = 0;
                foreach (var partialResult in result)
                {
                    var partialCanvas = partialResult.RenderResult;
                    if (partialCanvas is SKImage img)
                    {
                        finalImageSurface.Canvas.DrawImage(img, point);
                        if (partialResult.Height > rowHeight)
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
                }

                using var finalImage = finalImageSurface.Snapshot();
                finalBitmap = SKBitmap.FromImage(finalImage);
            }

            var finalImageFileName = Path.ChangeExtension(referenceFileName, ".new.png");
            using (finalBitmap)
            {
                var dir = Path.GetDirectoryName(finalImageFileName);
                Directory.CreateDirectory(dir);

                using (var fileStream = new SKFileWStream(finalImageFileName))
                {
                    SKPixmap.Encode(fileStream, finalBitmap, SKEncodedImageFormat.Png, 100);
                }

                SKBitmap referenceBitmap;
                using (var data = SKData.CreateCopy(referenceFileData.Buffer.Raw))
                {
                    referenceBitmap = SKBitmap.Decode(data);
                }

                using (referenceBitmap)
                {
                    var compareResult = PixelMatch.Run(finalBitmap, referenceBitmap,
                        new PixelMatchOptions
                        {
                            Threshold = 0.2,
                            IncludeAntiAlias = false,
                            IgnoreTransparent = true,
                            CreateOutputImage = true
                        });


                    using (compareResult.Output)
                    {

                        Assert.IsTrue(compareResult.SizesMatch, "Dimensions differ");
                        if (compareResult.Mismatch > 0.01)
                        {
                            var diffImageName =
                                Path.ChangeExtension(referenceFileName, ".diff.png");
                            using (var fileStream = new SKFileWStream(diffImageName))
                            {
                                SKPixmap.Encode(fileStream, compareResult.Output,
                                    SKEncodedImageFormat.Png, 100);
                            }

                            Assert.Fail(
                                $"Difference between original and new image is too big: {compareResult.Mismatch:P}, {compareResult.DifferentPixels}/{compareResult.TotalPixels}");
                        }
                    }
                }
            }

            File.Delete(finalImageFileName);
        }
    }
}
