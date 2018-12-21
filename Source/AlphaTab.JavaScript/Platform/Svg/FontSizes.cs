/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.Collections;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;

namespace AlphaTab.Platform.Svg
{
    /// <summary>
    /// This public class stores text widths for several fonts and allows width calculation 
    /// </summary>
    partial class FontSizes
    {
        public static byte[] GenerateFontLookup(string family)
        {
            if(FontSizeLookupTables == null) FontSizeLookupTables = new FastDictionary<string, byte[]>();
            if (FontSizeLookupTables.ContainsKey(family)) return FontSizeLookupTables[family];

            var canvas = (CanvasElement)Browser.Document.CreateElement("canvas");
            var measureContext = (CanvasRenderingContext2D)canvas.GetContext("2d");
            measureContext.Font = "11px " + family;

            var sizes = new FastList<byte>();
            for (var i = 0x20; i < 255; i++)
            {
                var s = Platform.StringFromCharCode(i);
                sizes.Add((byte)measureContext.MeasureText(s).Width);
            }

            var data = sizes.ToArray();
            FontSizeLookupTables[family] = data;
            return data;
        }
    }
}
