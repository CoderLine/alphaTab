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
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading;
using System.Xml;
using System.Xml.Linq;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Rendering;

namespace AlphaTab.SvgDump
{
    class Program
    {
        /// <summary>
        /// This writer properly writes escaped entities for attributes.
        /// </summary>
        public class EntitizingXmlWriter : XmlTextWriter
        {
            public EntitizingXmlWriter(TextWriter writer) :
                base(writer)
            { }

            public override void WriteString(string text)
            {
                // The start index of the next substring containing only non-entitized characters.
                int start = 0;

                // The index of the current character being checked.
                for (int curr = 0; curr < text.Length; ++curr)
                {
                    // Check whether the current character should be entitized.
                    char chr = text[curr];
                    if (Encoding.UTF8.GetBytes(new[] {chr}).Length != 1)
                    {
                        // Write the previous substring of non-entitized characters.
                        if (start < curr)
                            base.WriteString(text.Substring(start, curr - start));

                        if (char.IsHighSurrogate(chr))
                        {
                            if (curr + 1 < text.Length)
                            {
                                WriteSurrogateCharEntity(text[++curr], chr);
                            }
                            else
                            {
                                throw new ArgumentException("Invalid surrogate pair");
                            }
                        }
                        else if (char.IsLowSurrogate(chr))
                        {
                            throw new ArgumentException("Invalid surrogate pair");
                        }
                        else
                        {
                            WriteCharEntity(chr);
                        }

                        // Next substring of non-entitized characters tentatively starts
                        // immediately beyond current character.
                        start = curr + 1;
                    }
                }

                // Write the trailing substring of non-entitized characters.
                if (start < text.Length)
                    base.WriteString(text.Substring(start, text.Length - start));
            }

        }

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
            ScoreRenderer renderer = new ScoreRenderer(settings);

            // get iterate tracks
            for (int i = 0; i < 1; i++)
            {
                Track track = score.Tracks[i];
                // render track
                Console.WriteLine("Rendering track {0} - {1}", i + 1, track.Name);
                var totalWidth = 0;
                var totalHeight = 0;
                XDocument merged = null;
                var currentY = 0f;
                renderer.PreRender += r =>
                {
                    // append the svg close tag which would be part of the RenderFinished event
                    var svgString = r.RenderResult.ToString() + "</svg>";
                    merged = XDocument.Parse(svgString);
                };
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

                merged.Root.SetAttributeValue("width", totalWidth + "px");
                merged.Root.SetAttributeValue("height", totalHeight + "px");

               
                var svg = new StringWriter();
                var xmlWriter = new EntitizingXmlWriter(svg);
                merged.Save(xmlWriter);

                FileInfo info = new FileInfo(args[0]);
                string path = Path.Combine(info.DirectoryName, Path.GetFileNameWithoutExtension(info.Name) + "-" + i + ".svg");
                File.WriteAllText(path, svg.ToString());
            }
        }
    }
}
