using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using AlphaTab.Importer;
using AlphaTab.Rendering;
using SkiaSharp;

namespace AlphaTab.Samples.PngDump
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 1)
            {
                Console.WriteLine("Usage AlphaTab.ScoreDump.exe Path");
                return;
            }

            // load score
            var score = ScoreLoader.LoadScoreFromBytes(File.ReadAllBytes(args[0]));

            // render score with svg engine and desired rendering width
            var settings = Settings.Defaults;
            settings.Engine = "skia";
            settings.Width = 970;
            var renderer = new ScoreRenderer(settings);

            // iterate tracks
            for (int i = 0, j = score.Tracks.Count; i < j; i++)
            {
                var track = score.Tracks[i];

                // render track
                Console.WriteLine("Rendering track {0} - {1}", i + 1, track.Name);
                var images = new List<SKImage>();
                var totalWidth = 0;
                var totalHeight = 0;
                renderer.PartialRenderFinished += r =>
                {
                    images.Add((SKImage)r.RenderResult);
                };
                renderer.RenderFinished += r =>
                {
                    totalWidth = (int)r.TotalWidth;
                    totalHeight = (int)r.TotalHeight;
                };
                renderer.Render(score, new[] { track.Index });

                // write png
                var info = new FileInfo(args[0]);
                var path = Path.Combine(info.DirectoryName, Path.GetFileNameWithoutExtension(info.Name) + "-" + i + ".png");

                using (var full = SKSurface.Create(totalWidth, totalHeight, SKImageInfo.PlatformColorType, SKAlphaType.Premul))
                {
                    int y = 0;
                    foreach (var image in images)
                    {
                        full.Canvas.DrawImage(image, new SKRect(0, 0, image.Width, image.Height), new SKRect(0, y, image.Width, y + image.Height));
                        y += image.Height;
                    }

                    using (var fullImage = full.Snapshot())
                    {
                        using (var data = fullImage.Encode(SKEncodedImageFormat.Png, 100).AsStream(true))
                        {
                            using (var fileStream = new FileStream(path, FileMode.Create, FileAccess.Write))
                            {
                                data.CopyTo(fileStream);
                            }
                        }
                    }
                }
            }
        }
    }
}
