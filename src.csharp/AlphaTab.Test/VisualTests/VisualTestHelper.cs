using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using AlphaTab.Core.EcmaScript;
using AlphaTab.Importer;
using AlphaTab.Io;
using AlphaTab.Model;
using AlphaTab.Platform.CSharp;
using AlphaTab.Rendering;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using SkiaSharp;

namespace AlphaTab.VisualTests
{
    partial class VisualTestHelper
    {
        public static async Task RunVisualTest(string inputFile, Settings? settings = null,
            IList<double>? tracks = null, string? message = null, double tolerancePercent = 1, bool triggerResize = false)
        {
            try
            {
                inputFile = $"test-data/visual-tests/{inputFile}";
                var inputFileData =
                    await TestPlatform.LoadFile(inputFile);
                var referenceFileName = TestPlatform.ChangeExtension(inputFile, ".png");
                var score = ScoreLoader.LoadScoreFromBytes(inputFileData, settings);

                await RunVisualTestScore(score, referenceFileName, settings,
                    tracks, message, tolerancePercent, triggerResize);
            }
            catch (Exception e)
            {
                Assert.Fail($"Failed to run visual test {e}");
            }
        }

        public static async Task RunVisualTestTex(string tex, string referenceFileName,
            Settings? settings = null,
            IList<double>? tracks = null, string? message = null)
        {
            try
            {
                settings ??= new Settings();

                var importer = new AlphaTexImporter();
                importer.Init(ByteBuffer.FromString(tex), settings);
                var score = importer.ReadScore();

                await RunVisualTestScore(score, referenceFileName, settings,
                    tracks, message);
            }
            catch (Exception e)
            {
                Assert.Fail($"Failed to run visual test {e}");
            }
        }

        public static async Task RunVisualTestScore(Score score, string referenceFileName,
            Settings? settings = null,
            IList<double>? tracks = null, string? message = null, double tolerancePercent = 1, bool triggerResize = false)
        {
            settings ??= new Settings();
            tracks ??= new AlphaTab.Collections.List<double> {0};

            settings.Core.Engine = "skia";
            settings.Core.EnableLazyLoading = false;
            settings.Core.UseWorkers = false;

            settings.Display.Resources.CopyrightFont.Family = "Roboto";
            settings.Display.Resources.TitleFont.Family = "PT Serif";
            settings.Display.Resources.SubTitleFont.Family = "PT Serif";
            settings.Display.Resources.WordsFont.Family = "PT Serif";
            settings.Display.Resources.EffectFont.Family = "PT Serif";
            settings.Display.Resources.FretboardNumberFont.Family = "Roboto";
            settings.Display.Resources.TablatureFont.Family = "Roboto";
            settings.Display.Resources.GraceFont.Family = "Roboto";
            settings.Display.Resources.BarNumberFont.Family = "Roboto";
            settings.Display.Resources.FingeringFont.Family = "PT Serif";
            settings.Display.Resources.MarkerFont.Family = "PT Serif";

            LoadFonts();

            if (!referenceFileName.StartsWith("test-data/"))
            {
                referenceFileName = $"test-data/visual-tests/{referenceFileName}";
            }

            var referenceFileData =
                await TestPlatform.LoadFile(referenceFileName);

            var result = new AlphaTab.Collections.List<RenderFinishedEventArgs>();
            var totalWidth = 0.0;
            var totalHeight = 0.0;
            var isResizeRender = false;

            var task = new TaskCompletionSource<object?>();
            var renderer = new ScoreRenderer(settings)
            {
                Width = 1300
            };
            renderer.PreRender.On(isResize =>
            {
                result = new AlphaTab.Collections.List<RenderFinishedEventArgs>();
                totalWidth = 0.0;
                totalHeight = 0.0;
            });
            renderer.PartialRenderFinished.On(e =>
            {
                if (e != null)
                {
                    result.Add(e);
                }
            });
            renderer.RenderFinished.On(e =>
            {
                totalWidth = e.TotalWidth;
                totalHeight = e.TotalHeight;
                result.Add(e);
                if(!triggerResize || isResizeRender)
                {
                    task.SetResult(null);
                }
                else if(triggerResize)
                {
                    isResizeRender = true;
                    renderer.ResizeRender();
                }
            });
            renderer.Error.On((e) => { task.SetException(e); });

            renderer.RenderScore(score, tracks);

            if (await Task.WhenAny(task.Task, Task.Delay(2000)) == task.Task)
            {
                CompareVisualResult(
                    totalWidth,
                    totalHeight,
                    result,
                    referenceFileName,
                    referenceFileData,
                    message,
                    tolerancePercent
                );
            }
            else
            {
                Assert.Fail("Rendering did not complete within timeout");
            }
        }

        private static bool _fontsLoaded;
        private static void LoadFonts()
        {
            if (_fontsLoaded)
            {
                return;
            }

            _fontsLoaded = true;
            var fonts = new[]
            {
                "font/roboto/Roboto-Regular.ttf",
                "font/roboto/Roboto-Italic.ttf",
                "font/roboto/Roboto-Bold.ttf",
                "font/roboto/Roboto-BoldItalic.ttf",
                "font/ptserif/PTSerif-Regular.ttf",
                "font/ptserif/PTSerif-Italic.ttf",
                "font/ptserif/PTSerif-Bold.ttf",
                "font/ptserif/PTSerif-BoldItalic.ttf"
            };
            foreach (var font in fonts)
            {
                var data = File.ReadAllBytes(font);
                SkiaCanvas.RegisterCustomFont(data);
            }
        }

        private static void CompareVisualResult(double totalWidth, double totalHeight,
            AlphaTab.Collections.List<RenderFinishedEventArgs> result, string referenceFileName,
            Uint8Array referenceFileData, string? message, double tolerancePercent = 1)
        {
            SKBitmap finalBitmap;

            using (var finalImageSurface = SKSurface.Create(new SKImageInfo((int) totalWidth,
                (int) totalHeight,
                SKImageInfo.PlatformColorType, SKAlphaType.Premul)))
            {
                foreach (var partialResult in result)
                {
                    var partialCanvas = partialResult.RenderResult;
                    if (partialCanvas is SKImage img)
                    {
                        finalImageSurface.Canvas.DrawImage(img, (float)partialResult.X, (float)partialResult.Y);
                    }
                }

                using var finalImage = finalImageSurface.Snapshot();
                finalBitmap = SKBitmap.FromImage(finalImage);
            }

            var finalImageFileName = Path.ChangeExtension(referenceFileName, ".new.png");
            using (finalBitmap)
            {
                var dir = Path.GetDirectoryName(finalImageFileName)!;
                Directory.CreateDirectory(dir);

                using (var fileStream = new SKFileWStream(finalImageFileName))
                {
                    finalBitmap.Encode(fileStream, SKEncodedImageFormat.Png, 100);
                }

                SKBitmap referenceBitmap;
                using (var data = SKData.CreateCopy(referenceFileData.Buffer.Raw))
                {
                    referenceBitmap = SKBitmap.Decode(data);
                }

                using (referenceBitmap)
                {
                    try
                    {
                        var diffData = new Uint8Array(finalBitmap.Bytes.Length);
                        var match = PixelMatch.Match(
                            new Uint8Array(referenceBitmap.Bytes),
                            new Uint8Array(finalBitmap.Bytes),
                            diffData,
                            referenceBitmap.Width,
                            referenceBitmap.Height,
                            new PixelMatchOptions
                            {
                                Threshold = 0.3,
                                IncludeAA = false,
                                DiffMask = true,
                                Alpha = 1
                            });

                        var totalPixels = match.TotalPixels - match.TransparentPixels;
                        var percentDifference = (match.DifferentPixels / totalPixels) * 100;
                        var pass = percentDifference < tolerancePercent;
                        if (!pass)
                        {
                            var percentDifferenceText = percentDifference.ToString("0.00");
                            var msg =
                                $"Difference between original and new image is too big: {match.DifferentPixels}/${totalPixels} ({percentDifferenceText}%) ${message}";

                            var diffImageName =
                                Path.ChangeExtension(referenceFileName, ".diff.png");
                            using (var fileStream = new SKFileWStream(diffImageName))
                            {
                                var diff = SKBitmap.FromImage(
                                    SKImage.FromPixels(referenceBitmap.Info,
                                        SKData.Create(new MemoryStream(diffData.Data.Array!)))
                                );
                                diff?.Encode(fileStream,
                                    SKEncodedImageFormat.Png, 100);
                            }

                            var newImageName =
                                Path.ChangeExtension(referenceFileName, ".new.png");
                            using (var fileStream = new SKFileWStream(newImageName))
                            {
                                finalBitmap.Encode(fileStream,
                                    SKEncodedImageFormat.Png, 100);
                            }

                            Assert.Fail(msg);
                        }
                    }
                    catch (Exception e)
                    {
                        Assert.Fail($"Error comparing images: {e}, ${message}");
                    }
                }
            }

            File.Delete(finalImageFileName);
        }
    }
}
