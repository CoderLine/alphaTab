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
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Xml.Linq;
using AlphaTab.Rendering.Glyphs;
using Newtonsoft.Json;

namespace WebFontGenerator
{
    class Program
    {
        static void Main(string[] args)
        {
            string inputSvg = args[0];
            string outputFile = args[1];
            WebFont font = CreateEmptyFont();
            font.IconSets.Add(CreateIconSet(inputSvg));

            File.WriteAllText(outputFile, JsonConvert.SerializeObject(font, Formatting.Indented));
        }

        private static readonly DateTime Epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        private static WebFont CreateEmptyFont()
        {
            WebFont font = new WebFont();
            font.Metadata.Name = "alphaTab";
            font.Metadata.LastOpened = (long)(DateTime.UtcNow - Epoch).TotalMilliseconds;
            font.Metadata.Created = font.Metadata.LastOpened;
            font.Preferences.ShowGlyphs = true;
            font.Preferences.ExportPreferences.Prefix = "at-";
            font.Preferences.ExportPreferences.Metadata.FontFamily = "alphaTab";
            font.Preferences.ExportPreferences.Metadata.MajorVersion = 1;
            font.Preferences.ExportPreferences.Metadata.MinorVersion = 0;
            font.Preferences.ExportPreferences.Metrics.EmSize = 512;
            font.Preferences.ExportPreferences.Metrics.Baseline = 50;
            font.Preferences.ExportPreferences.Metrics.Whitespace = 0;
            font.Preferences.ExportPreferences.Postfix = "";
            font.Preferences.ExportPreferences.ShowMetrics = true;
            font.Preferences.ExportPreferences.ShowMetadata = false;
            font.Preferences.ExportPreferences.ShowVersion = false;
            font.Preferences.ShowCodes = true;
            font.Preferences.Search = "";
            return font;
        }

        private static string SvgNs;
        private static string InkscapeNs;

        private static IconSet CreateIconSet(string inputSvg)
        {
            IconSet set = new IconSet();
            set.Id = 0;
            set.Metadata.Name = "alphaTab MusicFont";
            set.Metadata.Url = "http://www.alphatab.net";
            set.Metadata.Designer = "";
            set.Metadata.DesignerUrl = "";
            set.Metadata.License = "";
            set.Metadata.LicenseUrl = "";
            set.Height = 1024;
            set.PrevSize = 32;

            XDocument document = XDocument.Load(inputSvg);
            XElement root = document.Root;

            SvgNs = root.GetNamespaceOfPrefix("svg").NamespaceName;
            InkscapeNs = root.GetNamespaceOfPrefix("inkscape").NamespaceName;

            var glyphs = root.Elements(XName.Get("g", SvgNs))
                .Where(g => g.Attribute(XName.Get("groupmode", InkscapeNs)).Value == "layer");
            foreach (var glyph in glyphs)
            {
                CreateIcon(set, document.Root, glyph);
            }

            return set;
        }

        private static void CreateIcon(IconSet set, XElement root, XElement glyph)
        {
            XElement path = glyph.Descendants(XName.Get("path", SvgNs)).First();

            string name = glyph.Attribute(XName.Get("id")).Value;
            string pathData = path.Attribute(XName.Get("d")).Value;


            Icon icon = new Icon();
            icon.Id = set.Icons.Count;
            icon.Tags = new[] { name };
            icon.Paths = new[] { pathData };

            IconSelection selection = new IconSelection();
            selection.Order = icon.Id;
            selection.Id = icon.Id;
            selection.PrevSize = 32;
            selection.Code = GetCodeForIcon(name);
            selection.TempChar = "" + ((char)selection.Code);
            selection.Ligatures = "";

            set.Icons.Add(icon);
            set.Selection.Add(selection);
        }

        private static int GetCodeForIcon(string name)
        {
            MusicFontSymbol symbol;
            if (!Enum.TryParse(name, out symbol))
            {
                throw new ArgumentOutOfRangeException("name",
                    string.Format("Found symbol {0} which does not have a matching MusicFont", name));
            }
            return (int)symbol;
        }
    }
}
