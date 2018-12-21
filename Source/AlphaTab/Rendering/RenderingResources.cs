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

using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This public class contains central definitions for controlling the visual appearance. 
    /// </summary>
    public class RenderingResources
    {
        public Font CopyrightFont { get; set; }
        public Font TitleFont { get; set; }
        public Font SubTitleFont { get; set; }
        public Font WordsFont { get; set; }
        public Font EffectFont { get; set; }
        public Font FretboardNumberFont { get; set; }

        public Font TablatureFont { get; set; }
        public Font GraceFont { get; set; }

        public Color StaffLineColor { get; set; }
        public Color BarSeparatorColor { get; set; }

        public Font BarNumberFont { get; set; }
        public Color BarNumberColor { get; set; }

        public Font FingeringFont { get; set; }
        public Font MarkerFont { get; set; }

        public Color MainGlyphColor { get; set; }
        public Color SecondaryGlyphColor { get; set; }
        public Color ScoreInfoColor { get; set; }

        public RenderingResources()
        {
            const string sansFont = "Arial";
            const string serifFont = "Georgia";

            EffectFont = new Font(serifFont, 12, FontStyle.Italic);
            CopyrightFont = new Font(sansFont, 12, FontStyle.Bold);
            FretboardNumberFont = new Font(sansFont, 11);

            TitleFont = new Font(serifFont, 32);
            SubTitleFont = new Font(serifFont, 20);
            WordsFont = new Font(serifFont, 15);

            TablatureFont = new Font(sansFont, 13);
            GraceFont = new Font(sansFont, 11);

            StaffLineColor = new Color(165, 165, 165);
            BarSeparatorColor = new Color(34, 34, 17);

            BarNumberFont = new Font(sansFont, 11);
            BarNumberColor = new Color(200, 0, 0);

            FingeringFont = new Font(serifFont, 14);
            MarkerFont = new Font(serifFont, 14, FontStyle.Bold);

            ScoreInfoColor = new Color(0, 0, 0);
            MainGlyphColor = new Color(0, 0, 0);
            SecondaryGlyphColor = new Color(0, 0, 0, 100);
        }
    }
}
