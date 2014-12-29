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
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class DynamicsGlyph : EffectGlyph
    {
        private const float GlyphScale = 0.8f;

        private readonly DynamicValue _dynamics;

        public DynamicsGlyph(float x, float y, DynamicValue dynamics)
            : base(x, y)
        {
            _dynamics = dynamics;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            Glyph[] glyphs;

            switch (_dynamics)
            {
                case DynamicValue.PPP:
                    glyphs = new[] { P, P, P };
                    break;
                case DynamicValue.PP:
                    glyphs = new[] { P, P };
                    break;
                case DynamicValue.P:
                    glyphs = new[] { P };
                    break;
                case DynamicValue.MP:
                    glyphs = new[] { M, P };
                    break;
                case DynamicValue.MF:
                    glyphs = new[] { M, F };
                    break;
                case DynamicValue.F:
                    glyphs = new[] { F };
                    break;
                case DynamicValue.FF:
                    glyphs = new[] { F, F };
                    break;
                case DynamicValue.FFF:
                    glyphs = new[] { F, F, F };
                    break;
                default:
                    return;
            }

            var glyphWidth = 0f;
            foreach (var g in glyphs)
            {
                glyphWidth += g.Width;
            }

            var startX = (Width - glyphWidth) / 2;

            foreach (var g in glyphs)
            {
                g.X = startX;
                g.Y = 0;
                g.Renderer = Renderer;

                g.Paint(cx + X, cy + Y, canvas);
                startX += g.Width;
            }
        }

        private Glyph P
        {
            get
            {
                var p = new MusicFontGlyph(0, 0, GlyphScale, MusicFontSymbol.DynamicP);
                p.Width = 7 * Scale;
                return p;
            }
        }

        private Glyph M
        {
            get
            {
                var m = new MusicFontGlyph(0, 0, GlyphScale, MusicFontSymbol.DynamicM);
                m.Width = 7 * Scale;
                return m;
            }
        }

        private Glyph F
        {
            get
            {
                var f = new MusicFontGlyph(0, 0, GlyphScale, MusicFontSymbol.DynamicF);
                f.Width = 7 * Scale;
                return f;
            }
        }
    }
}
