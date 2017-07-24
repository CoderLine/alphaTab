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
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabRestGlyph : MusicFontGlyph
    {
        private readonly bool _isVisibleRest;
        private readonly Duration _duration;

        public BeamingHelper BeamingHelper { get; set; }

        public TabRestGlyph(float x, float y, bool isVisibleRest, Duration duration)
            : base(x, y, 1, ScoreRestGlyph.GetSymbol(duration))
        {
            _isVisibleRest = isVisibleRest;
            _duration = duration;
        }

        public override void DoLayout()
        {
            if (_isVisibleRest)
            {
                Width = ScoreRestGlyph.GetSize(_duration) * Scale;
            }
            else
            {
                Width = 10 * Scale;
            }
        }

        public void UpdateBeamingHelper(float cx)
        {
            if (BeamingHelper != null && BeamingHelper.IsPositionFrom(TabBarRenderer.StaffId, Beat))
            {
                BeamingHelper.RegisterBeatLineX(TabBarRenderer.StaffId, Beat, cx + X + Width, cx + X);
            }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (_isVisibleRest)
            {
                base.Paint(cx, cy, canvas);
            }
        }
    }
}