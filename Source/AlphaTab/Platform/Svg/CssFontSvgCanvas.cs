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
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Platform.Svg
{
    /// <summary>
    /// This SVG canvas renders the music symbols by adding a CSS class 'at' to all elements. 
    /// </summary>
    class CssFontSvgCanvas : SvgCanvas
    {
        public override void FillMusicFontSymbol(float x, float y, float scale, MusicFontSymbol symbol, bool centerAtPosition = false)
        {
            if (symbol == MusicFontSymbol.None) return;
            FillMusicFontSymbolText(x, y, scale, "&#" + (int)symbol + ";", centerAtPosition);
        }

        public override void FillMusicFontSymbols(float x, float y, float scale, MusicFontSymbol[] symbols, bool centerAtPosition = false)
        {
            var s = "";
            foreach (var symbol in symbols)
            {
                if (symbol != MusicFontSymbol.None)
                {
                    s += "&#" + (int)symbol + ";";
                }
            }

            FillMusicFontSymbolText(x, y, scale, s, centerAtPosition);
        }

        private void FillMusicFontSymbolText(float x, float y, float scale, string symbols, bool centerAtPosition = false)
        {
            Buffer.Append("<g transform=\"translate(" + ((int)x - BlurCorrection) + " " + ((int)y - BlurCorrection) +
                          ")\" class=\"at\" ><text");
            if (scale != 1)
            {
                Buffer.Append(" style=\"font-size: " + (scale * 100) + "%; stroke:none\"");
            }
            else
            {
                Buffer.Append(" style=\"stroke:none\"");
            }

            if (Color.RGBA != Model.Color.BlackRgb)
            {
                Buffer.Append(" fill=\"" + Color.RGBA + "\"");
            }
            if (centerAtPosition)
            {
                Buffer.Append(" text-anchor=\"" + GetSvgTextAlignment(Model.TextAlign.Center) + "\"");
            }
            Buffer.Append(">" + symbols + "</text></g>");
        }

    }
}