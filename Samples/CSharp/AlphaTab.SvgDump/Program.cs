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
using System.Globalization;
using System.IO;
using System.Threading;
using System.Xml.Linq;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering;

namespace AlphaTab.SvgDump
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

            // we need to use english culture to have correct string variants of floating points (dot as decimal separator)
            Thread.CurrentThread.CurrentCulture = new CultureInfo("en-us");
            Thread.CurrentThread.CurrentUICulture = new CultureInfo("en-us");

            // load score
            Score score = ScoreLoader.LoadScore(args[0]);

            // render score with svg engine
            Settings settings = Settings.Defaults;
            settings.Engine = "svg";
            ScoreRenderer renderer = new ScoreRenderer(settings, null);

            // get iterate tracks
            for (int i = 0; i < score.Tracks.Count; i++)
            {
                Track track = score.Tracks[i];
                // render track
                Console.WriteLine("Rendering track {0} - {1}", i + 1, track.Name);
                var totalWidth = 0;
                var totalHeight = 0;
                var merged = XDocument.Parse("<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"1px\" height=\"1px\"></svg>");
                var currentY = 0f;
                renderer.PartialRenderFinished += r =>
                {
                    var subSvg = XDocument.Parse(r.RenderResult.ToString());
                    var subRoot = subSvg.Root;
                    subRoot.SetAttributeValue("x", "0px");
                    subRoot.SetAttributeValue("y", ((int)currentY) + "px");
                    merged.Root.Add(subRoot);
                    currentY += r.Height;
                };
                renderer.RenderFinished += r =>
                {
                    totalWidth = (int)r.TotalWidth;
                    totalHeight = (int)r.TotalHeight;
                };
                renderer.Render(track);

                merged.Root.Attribute("width").Value = totalWidth + "px";
                merged.Root.Attribute("height").Value = totalHeight + "px";


                string svg = merged.ToString();

                FileInfo info = new FileInfo(args[0]);
                string path = Path.Combine(info.DirectoryName, Path.GetFileNameWithoutExtension(info.Name) + "-" + i + ".svg");
                File.WriteAllText(path, svg);
            }
        }
    }
}
