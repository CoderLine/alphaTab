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
using System;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class TuningGlyph : GlyphGroup
    {
        private readonly float _scale;
        private readonly RenderingResources _resources;
        public float Height { get; set; }

        public TuningGlyph(float x, float y,
            float scale, RenderingResources resources,
            Tuning tuning) : base(x, y)
        {
            _scale = scale;
            _resources = resources;
            CreateGlyphs(tuning);
        }

        private void CreateGlyphs(Tuning tuning)
        {
            // Name
            AddGlyph(new TextGlyph(0, 0, tuning.Name, _resources.EffectFont));
            Height += 15 * _scale;

            if (!tuning.IsStandard)
            {
                // Strings
                var stringsPerColumn = (int)Math.Ceiling(tuning.Tunings.Length / 2.0);

                var currentX = 0f;
                var currentY = Height;
                for (int i = 0, j = tuning.Tunings.Length; i < j; i++)
                {
                    var str = "(" + (i + 1) + ") = " + Tuning.GetTextForTuning(tuning.Tunings[i], false);
                    AddGlyph(new TextGlyph(currentX, currentY, str, _resources.EffectFont));
                    currentY += Height;
                    if (i == stringsPerColumn - 1)
                    {
                        currentY = Height;
                        currentX += (43 * _scale);
                    }
                }

                Height += (stringsPerColumn * (15 * _scale));
            }
        }
    }
}
