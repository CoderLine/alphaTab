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
    class HarmonicsEffectInfo : NoteEffectInfoBase
    {
        private readonly HarmonicType _harmonicType;
        private Beat _beat;
        private string _effectId;

        public override string EffectId { get { return _effectId; } }

        public HarmonicsEffectInfo(HarmonicType harmonicType)
        {
            _harmonicType = harmonicType;
            switch (harmonicType)
            {
                case HarmonicType.Artificial:
                    _effectId = "harmonics-artificial";
                    break;
                case HarmonicType.Pinch:
                    _effectId = "harmonics-pinch";
                    break;
                case HarmonicType.Tap:
                    _effectId = "harmonics-tap";
                    break;
                case HarmonicType.Semi:
                    _effectId = "harmonics-semi";
                    break;
                case HarmonicType.Feedback:
                    _effectId = "harmonics-feedback";
                    break;
            }
        }


        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            if (!note.IsHarmonic || note.HarmonicType != _harmonicType) return false;
            if (note.Beat != _beat)
            {
                _beat = note.Beat;
            }
            return true;
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.GroupedOnBeat; }
        }

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new LineRangedGlyph(HarmonicToString(_harmonicType));
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