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
            Score score = ScoreLoader.LoadScore(args[0]);

            // render score with svg engine
            Settings settings = Settings.Defaults;
            settings.Engine = "gdi";
            ScoreRenderer renderer = new ScoreRenderer(settings, null);

            // iterate tracks
            for (int i = 0, j = score.Tracks.Count; i < j; i++)
            {
                Track track = score.Tracks[i];

                // render track
                Console.WriteLine("Rendering track {0} - {1}", i + 1, track.Name);
                renderer.Render(track);

                // write png
                FileInfo info = new FileInfo(args[0]);
                string path = Path.Combine(info.DirectoryName, Path.GetFileNameWithoutExtension(info.Name) + "-" + i + ".png");
                using (Bitmap bmp = ((GdiCanvas)renderer.Canvas).Image)
                {
                    bmp.Save(path, ImageFormat.Png);
                }
            }
        }
    }
}
