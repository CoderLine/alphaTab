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
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public abstract class NoteEffectInfoBase : IEffectBarRendererInfo
    {
        protected FastList<Note> LastCreateInfo;

        public virtual bool ShouldCreateGlyph(Beat beat)
        {
            LastCreateInfo = new FastList<Note>();
            for (int i = 0, j = beat.Notes.Count; i < j; i++)
            {
                var n = beat.Notes[i];
                if (ShouldCreateGlyphForNote(n))
                {
                    LastCreateInfo.Add(n);
                }
            }
            return LastCreateInfo.Count > 0;
        }

        protected abstract bool ShouldCreateGlyphForNote(Note note);

        public abstract string EffectId { get; }
        public virtual bool HideOnMultiTrack { get { return false; } }
        public virtual bool CanShareBand { get { return true; } }
        public abstract EffectBarGlyphSizing SizingMode { get; }
        public abstract EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat);

        public virtual bool CanExpand(Beat @from, Beat to)
        {
            return true;
        }
    }
}