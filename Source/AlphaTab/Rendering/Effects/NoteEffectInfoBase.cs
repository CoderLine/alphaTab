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
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    abstract public class NoteEffectInfoBase : IEffectBarRendererInfo
    {
        protected FastList<Note> LastCreateInfo;

        public bool HideOnMultiTrack { get { return false; } }
        public virtual bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            LastCreateInfo = new FastList<Note>();
            for (int i = 0, j = beat.Notes.Count; i < j; i++)
            {
                var n = beat.Notes[i];
                if (ShouldCreateGlyphForNote(renderer, n))
                {
                    LastCreateInfo.Add(n);
                }
            }
            return LastCreateInfo.Count > 0;
        }

        protected abstract bool ShouldCreateGlyphForNote(EffectBarRenderer renderer, Note note);

        public abstract EffectBarGlyphSizing SizingMode { get; }
        public abstract float GetHeight(EffectBarRenderer renderer);
        public abstract EffectGlyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat);

        public virtual bool CanExpand(EffectBarRenderer renderer, Beat @from, Beat to)
        {
            return true;
        }
    }
}