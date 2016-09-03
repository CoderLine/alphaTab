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
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Platform.Svg
{
    /// <summary>
    ///  A canvas implementation storing SVG data
    /// </summary>
    public class PathSvgCanvas : SvgCanvas
    {
        public override void FillMusicFontSymbol(float x, float y, float scale, MusicFontSymbol symbol)
        {
            if (symbol == MusicFontSymbol.None)
            {
                return;
            }

            var glyph = new SvgRenderer(MusicFont.SymbolLookup[symbol], scale, scale);
            glyph.Paint(x, y, this);
        }
    }
}