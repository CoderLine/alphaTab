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
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class TapEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "tap"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return true; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeat; } }

        public bool ShouldCreateGlyph(Beat beat)
        {
            return (beat.Slap || beat.Pop || beat.Tap);
        }


        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            var res = renderer.Resources;
            if (beat.Slap)
            {
                return new TextGlyph(0, 0, "S", res.EffectFont);
            }
            if (beat.Pop)
            {
                return new TextGlyph(0, 0, "P", res.EffectFont);
            }
            return new TextGlyph(0, 0, "T", res.EffectFont);
        }

        public bool CanExpand(Beat @from, Beat to)
        {
            return true;
        }
    }
}