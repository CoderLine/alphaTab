﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using AlphaTab.Core.EcmaScript;
using AlphaTab.Importer;
using AlphaTab.Io;
using AlphaTab.Model;
using AlphaTab.Rendering;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using SkiaSharp;

namespace AlphaTab.VisualTests
{
    public static class VisualTestHelper
    {
        public static async Task RunVisualTest(string inputFile, Settings? settings = null,
            IList<double>? tracks = null, string? message = null, int tolerancePercent = 1)
        {
            try
            {
                inputFile = $"test-data/visual-tests/{inputFile}";
                var inputFileData =
                    await TestPlatform.LoadFile(inputFile);
                var referenceFileName = TestPlatform.ChangeExtension(inputFile, ".png");
                var score = ScoreLoader.LoadScoreFromBytes(inputFileData, settings);

                await RunVisualTestScore(score, referenceFileName, settings,
                    tracks, message, tolerancePercent);
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
            IList<double>? tracks = null, string? message = null, int tolerancePercent = 1)
        {
            settings ??= new Settings();
            tracks ??= new List<double> {0};

            settings.Core.Engine = "skia";
            settings.Core.EnableLazyLoading = false;
            settings.Core.UseWorkers = false;

            if (!referenceFileName.StartsWith("test-data/"))
            {
                referenceFileName = $"test-data/visual-tests/{referenceFileName}";
            }

            var referenceFileData =
                await TestPlatform.LoadFile(referenceFileName);

            var result = new List<RenderFinishedEventArgs>();
            var totalWidth = 0.0;
            var totalHeight = 0.0;

            var task = new TaskCompletionSource<object?>();
            var renderer = new ScoreRenderer(settings)
            {
                Width = 1300
            };

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
                task.SetResult(null);
            });
            renderer.Error.On((e) => { task.SetException(e); });

            var renderScore =
                JsonConverter.JsObjectToScore(JsonConverter.ScoreToJsObject(score), settings);
            renderer.RenderScore(renderScore, tracks);

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

        private static void CompareVisualResult(double totalWidth, double totalHeight,
            List<RenderFinishedEventArgs> result, string referenceFileName,
            Uint8Array referenceFileData, string? message, int tolerancePercent = 1)
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
