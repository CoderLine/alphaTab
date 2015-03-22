/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using AlphaTab;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Platform.CSharp;
using AlphaTab.Rendering;

namespace Alphatab.PngDump
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
            var score = ScoreLoader.LoadScore(args[0]);

            // render score with svg engine
            var settings = Settings.Defaults;
            settings.Engine = "gdi";
            var renderer = new ScoreRenderer(settings, null);

            // iterate tracks
            for (int i = 0, j = score.Tracks.Count; i < j; i++)
            {
                var track = score.Tracks[i];

                // render track
                Console.WriteLine("Rendering track {0} - {1}", i + 1, track.Name);
                var images = new List<Image>();
                var totalWidth = 0;
                var totalHeight = 0;
                renderer.PartialRenderFinished += r =>
                {
                    images.Add((Image) r.RenderResult);
                };
                renderer.RenderFinished += r =>
                {
                    totalWidth = (int) r.TotalWidth;
                    totalHeight = (int) r.TotalHeight;
                };
                renderer.Render(track);

                // write png
                var info = new FileInfo(args[0]);
                var path = Path.Combine(info.DirectoryName, Path.GetFileNameWithoutExtension(info.Name) + "-" + i + ".png");

                using (var bmp = new Bitmap(totalWidth, totalHeight))
                {
                    int y = 0;
                    using (var g = Graphics.FromImage(bmp)) 
                    {
                        foreach (var image in images)
                        {
                            g.DrawImage(image, new Rectangle(0, y, image.Width, image.Height),
                                new Rectangle(0, 0, image.Width, image.Height), GraphicsUnit.Pixel);
                            y += image.Height;
                        }
                    }
                    bmp.Save(path, ImageFormat.Png);
                }
            }
        }
    }
}
