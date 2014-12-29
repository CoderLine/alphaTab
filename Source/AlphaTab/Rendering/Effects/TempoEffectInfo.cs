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
    public class TempoEffectInfo : IEffectBarRendererInfo
    {
        public bool HideOnMultiTrack { get { return true; } }
        public bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return beat.Index == 0 && (beat.Voice.Bar.MasterBar.TempoAutomation != null || beat.Voice.Bar.Index == 0);
        }

        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SinglePreBeatOnly; } }
        public float GetHeight(EffectBarRenderer renderer)
        {
            return 25 * renderer.Scale;
        }

        public EffectGlyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            int tempo;
            if (beat.Voice.Bar.MasterBar.TempoAutomation != null)
            {
                tempo = (int)(beat.Voice.Bar.MasterBar.TempoAutomation.Value);
            }
            else
            {
                tempo = beat.Voice.Bar.Track.Score.Tempo;
            }
            return new TempoGlyph(0, 0, tempo);
        }

        public bool CanExpand(EffectBarRenderer renderer, Beat @from, Beat to)
        {
            return true;
        }
    }
}