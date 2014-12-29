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
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class FingeringEffectInfo : NoteEffectInfoBase
    {
        private int _maxGlyphCount;

        public override bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            var result = base.ShouldCreateGlyph(renderer, beat);
            if (LastCreateInfo.Count >= _maxGlyphCount) _maxGlyphCount = LastCreateInfo.Count;
            return result;
        }

        protected override bool ShouldCreateGlyphForNote(EffectBarRenderer renderer, Note note)
        {
            return (note.LeftHandFinger != Fingers.NoOrDead && note.LeftHandFinger != Fingers.Unknown) ||
                   (note.RightHandFinger != Fingers.NoOrDead && note.RightHandFinger != Fingers.Unknown);
        }

        public override float GetHeight(EffectBarRenderer renderer)
        {
            return _maxGlyphCount * (20 * renderer.Scale);
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.SingleOnBeatOnly; }
        }

        public override EffectGlyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return new DummyEffectGlyph(0, 0, LastCreateInfo.Count + "fingering");
        }
    }
}