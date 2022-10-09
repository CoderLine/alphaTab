using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using AlphaTab.Core;
using AlphaTab.Core.EcmaScript;
using AlphaTab.Model;
using AlphaTab.Platform.CSharp;
using AlphaTab.Rendering;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using SkiaSharp;

namespace AlphaTab.VisualTests
{
    partial class VisualTestHelper
    {
        private static async Task RunVisualTestScoreWithResize(Score score, IList<double> widths,
            IList<string?> referenceImages, Settings? settings, IList<double>? tracks, string? message,
            double tolerancePercent)
        {
            tracks ??= new List<double> { 0 };
            PrepareSettingsForTest(ref settings);

            var referenceFileData = new List<Uint8Array?>();
            foreach (var referenceFileName in referenceImages)
            {
                if (referenceFileName == null)
                {
                    referenceFileData.Add(null);
                }
                else
                {
                    referenceFileData.Add(await TestPlatform.LoadFile(Path.Combine("test-data", "visual-tests", referenceFileName)));
                }
            }

            var results = new List<List<RenderFinishedEventArgs>>();
            var totalWidths = new List<double>();
            var totalHeights =  new List<double>();

            var task = new TaskCompletionSource<object?>();
            var renderer = new ScoreRenderer(settings)
            {
                Width = widths.Shift()
            };
            renderer.PreRender.On(isResize =>
            {
                results.Add(new List<RenderFinishedEventArgs>());
                totalWidths.Add(0);
                totalHeights.Add(0);
            });
            renderer.PartialRenderFinished.On(e =>
            {
                if (e != null)
                {
                    results[^1].Add(e);
                }
            });
            renderer.RenderFinished.On(e =>
            {
                totalWidths[^1] = e.TotalWidth;
                totalHeights[^1] = e.TotalHeight;
                results[^1].Add(e);
                if (widths.Count > 0)
                {
                    renderer.Width = widths.Shift();
                    renderer.ResizeRender();
                }
                else
                {
                    task.SetResult(null);
                }
            });
            renderer.Error.On((e) => { task.SetException(e); });

            renderer.RenderScore(score, tracks);

            if (await Task.WhenAny(task.Task, Task.Delay(2000 * referenceImages.Count)) == task.Task)
            {
                for (var i = 0; i < results.Count; i++)
                {
                    if (referenceImages[i] != null)
                    {
                        CompareVisualResult(
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
            else
            {
                Assert.Fail("Rendering did not complete within timeout");
            }
        }

        private static void PrepareSettingsForTest(ref Settings? settings)
        {
            settings ??= new Settings();
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
            List<RenderFinishedEventArgs> result, string referenceFileName,
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
                        Assert.AreEqual(totalWidth, referenceBitmap.Width,
                            "Width of images does not match");
                        Assert.AreEqual(totalHeight, referenceBitmap.Height,
                            "Height of images does not match");
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
                    catch (AssertFailedException)
                    {
                        throw;
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
