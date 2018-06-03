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
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class FadeInEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "fade-in"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return true; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeat; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.FadeIn;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new FadeInGlyph(0, 0);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
    public class FingeringEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "fingering"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return true; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeat; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            if (settings.FingeringMode != FingeringMode.SingleNoteEffectBand) return false;
            if (beat.Notes.Count > 1) return false;
            return beat.Notes[0].IsFingering;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            var finger = Fingers.Unknown;
            var isLeft = false;
            foreach (var note in beat.Notes)
            {
                if (note.LeftHandFinger != Fingers.Unknown)
                {
                    finger = note.LeftHandFinger;
                    isLeft = true;
                    break;
                }
                if (note.RightHandFinger != Fingers.Unknown)
                {
                    finger = note.RightHandFinger;
                    break;
                }
            }

            var s = ModelUtils.FingerToString(renderer.Settings, beat, finger, isLeft);
            return new TextGlyph(0, 0, s, renderer.Resources.FingeringFont, TextAlign.Left);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}