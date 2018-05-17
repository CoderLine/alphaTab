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
    public class WideNoteVibratoEffectInfo : NoteEffectInfoBase
    {
        public override string EffectId { get { return "wide-note-vibrato"; } }

        protected override bool ShouldCreateGlyphForNote(Note note)
        {
            return note.Vibrato == VibratoType.Wide || (note.IsTieDestination && note.TieOrigin.Vibrato == VibratoType.Wide);
        }

        public override EffectBarGlyphSizing SizingMode
        {
            get { return EffectBarGlyphSizing.GroupedOnBeatToEnd; }
        }

        public override EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new NoteVibratoGlyph(0, 0, VibratoType.Wide);
        }
    }
}