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
    public class HarmonicsEffectInfo : NoteEffectInfoBase
    {
        private Beat _beat;
        private HarmonicType _beatType;

        public override string EffectId { get { return "harmonics"; } }

        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            if (!note.IsHarmonic) return false;
            if (note.Beat != _beat || note.HarmonicType > _beatType)
            {
                _beat = note.Beat;
                _beatType = note.HarmonicType;
            }
            return true;
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.SingleOnBeat; }
        }

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new TextGlyph(0, 0, HarmonicToString(_beatType), renderer.Resources.EffectFont);
        }

        public static string HarmonicToString(HarmonicType type)
        {
            switch (type)
            {
                case HarmonicType.Natural:
                    return "N.H.";
                case HarmonicType.Artificial:
                    return "A.H.";
                case HarmonicType.Pinch:
                    return "P.H.";
                case HarmonicType.Tap:
                    return "T.H.";
                case HarmonicType.Semi:
                    return "S.H.";
                case HarmonicType.Feedback:
                    return "Fdbk.";
            }
            return "";
        }
    }
}