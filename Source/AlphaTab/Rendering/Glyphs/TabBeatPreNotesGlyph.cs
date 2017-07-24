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

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBeatPreNotesGlyph : BeatGlyphBase
    {
        public override void DoLayout()
        {
            if (Container.Beat.BrushType != BrushType.None && !Container.Beat.IsRest)
            {
                AddGlyph(new TabBrushGlyph(Container.Beat));
                AddGlyph(new SpacingGlyph(0, 0, 4 * Scale));
            }
            base.DoLayout();
        }
    }
}
