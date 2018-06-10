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

using System;
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class OttaviaEffectInfo : IEffectBarRendererInfo
    {
        private readonly bool _aboveStaff;
        public string EffectId => "ottavia-" + (_aboveStaff ? "above" : "below");
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => true;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeat;

        public OttaviaEffectInfo(bool aboveStaff)
        {
            _aboveStaff = aboveStaff;
        }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            switch (beat.Ottava)
            {
                case Ottavia._15ma:
                    return _aboveStaff;
                case Ottavia._8va:
                    return _aboveStaff;
                case Ottavia._8vb:
                    return !_aboveStaff;
                case Ottavia._15mb:
                    return !_aboveStaff;
            }
            return false;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new OttavaGlyph(beat.Ottava, _aboveStaff);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}