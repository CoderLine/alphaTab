/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
    public class CssFontSvgCanvas : SvgCanvas
    {
        public override void FillMusicFontSymbol(float x, float y, float scale, MusicFontSymbol symbol)
        {
            Buffer.Append("<g transform=\"translate(" + ((int) x - BlurCorrection) + " " + ((int) y - BlurCorrection) + ")\" class=\"at\" ><text");
            //Buffer.Append("<svg x=\"" + ((int) x - BlurCorrection) + "\" y=\"" + ((int) y - BlurCorrection) +
            //              "\" class=\"at\" >");
            if (scale != 1)
            {
                Buffer.Append("  style=\"font-size: " + (scale * 100) + "%\"");
            }
            if (Color.RGBA != Model.Color.BlackRgb)
            {
                Buffer.Append(" fill=\"" + Color.RGBA + "\"");
            }
            //Buffer.Append(">&#" + (int)symbol + ";</text></svg>");
            Buffer.Append(">&#" + (int)symbol + ";</text></g>");
        }
    }
}