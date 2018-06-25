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
    class WhammyBarEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "whammy"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return false; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.GroupedOnBeat; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return settings.DisplayMode == DisplayMode.SongBook ? beat.HasWhammyBar && beat.WhammyBarType != WhammyType.Dip : beat.HasWhammyBar;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new LineRangedGlyph("w/bar");
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}