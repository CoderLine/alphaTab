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
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class BeatOnNoteGlyphBase : BeatGlyphBase
    {
        public BeamingHelper BeamingHelper { get; set; }

        public virtual void UpdateBeamingHelper()
        {
        }

        //public override void Paint(float cx, float cy, ICanvas canvas)
        //{
        //    base.Paint(cx, cy, canvas);
        //    canvas.Color = new Color((byte)Platform.Random(255), (byte)Platform.Random(255), (byte)Platform.Random(255), 80);
        //    canvas.FillRect(cx + X, cy + Y, Width, 100);
        //}
    }
}