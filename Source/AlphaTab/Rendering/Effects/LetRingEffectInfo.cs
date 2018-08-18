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
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class LetRingEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "let-ring";
        public bool CanShareBand => false;
        public virtual bool HideOnMultiTrack => false;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.IsLetRing;
        }

        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeat;

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new LineRangedGlyph("LetRing");
        }

        public virtual bool CanExpand(Beat from, Beat to)
        {
            return !to.IsLetRing || !to.IsNewLetRing;
        }
    }
}