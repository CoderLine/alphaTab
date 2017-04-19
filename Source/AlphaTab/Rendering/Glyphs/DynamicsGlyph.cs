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
    public class DynamicsGlyph : MusicFontGlyph
    {
        public DynamicsGlyph(float x, float y, DynamicValue dynamics)
                  : base(x, y, 0.6f, GetSymbol(dynamics))
        {
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 17 * Scale;
            Y += Height / 2;
        }

        private static MusicFontSymbol GetSymbol(DynamicValue dynamics)
        {
            switch (dynamics)
            {
                case DynamicValue.PPP:
                    return MusicFontSymbol.DynamicPPP;
                case DynamicValue.PP:
                    return MusicFontSymbol.DynamicPP;
                case DynamicValue.P:
                    return MusicFontSymbol.DynamicP;
                case DynamicValue.MP:
                    return MusicFontSymbol.DynamicMP;
                case DynamicValue.MF:
                    return MusicFontSymbol.DynamicMF;
                case DynamicValue.F:
                    return MusicFontSymbol.DynamicF;
                case DynamicValue.FF:
                    return MusicFontSymbol.DynamicFFF;
                case DynamicValue.FFF:
                    return MusicFontSymbol.DynamicFFF;
                default:
                    return MusicFontSymbol.None;
            }
        }
    }
}
