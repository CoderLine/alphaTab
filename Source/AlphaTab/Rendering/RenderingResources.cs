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
        /// <summary>
        /// Gets or sets the font to use for displaying the songs copyright information in the header of the music sheet. 
        /// </summary>
        public Font CopyrightFont { get; set; }
        /// <summary>
        /// Gets or sets the font to use for displaying the songs title in the header of the music sheet. 
        /// </summary>
        public Font TitleFont { get; set; }
        /// <summary>
        /// Gets or sets the font to use for displaying the songs subtitle in the header of the music sheet. 
        /// </summary>
        public Font SubTitleFont { get; set; }
        /// <summary>
        /// Gets or sets the font to use for displaying the lyrics information in the header of the music sheet. 
        /// </summary>
        public Font WordsFont { get; set; }
        
        /// <summary>
        /// Gets or sets the font to use for displaying certain effect related elements in the music sheet. 
        /// </summary>
        public Font EffectFont { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying the fretboard numbers in chord diagrams.
        /// </summary>
        public Font FretboardNumberFont { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying the guitar tablature numbers in the music sheet. 
        /// </summary>
        public Font TablatureFont { get; set; }
        /// <summary>
        /// Gets or sets the font to use for grace notation related texts in the music sheet.
        /// </summary>
        public Font GraceFont { get; set; }

        /// <summary>
        /// Gets or sets the color to use for rendering the lines of staves. 
        /// </summary>
        public Color StaffLineColor { get; set; }
        /// <summary>
        /// Gets or sets the color to use for rendering bar separators, the accolade and repeat signs. 
        /// </summary>
        public Color BarSeparatorColor { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying the bar numbers above the music sheet. 
        /// </summary>
        public Font BarNumberFont { get; set; }
        /// <summary>
        /// Gets or sets the color to use for displaying the bar numbers above the music sheet. 
        /// </summary>
        public Color BarNumberColor { get; set; }

        /// <summary>
        /// Gets or sets the font to use for displaying finger information in the music sheet.
        /// </summary>
        public Font FingeringFont { get; set; }

        /// <summary>
        /// Gets or sets the font to use for section marker labels shown above the music sheet. 
        /// </summary>
        public Font MarkerFont { get; set; }

        /// <summary>
        /// Gets or sets the color to use for music notation elements of the primary voice. 
        /// </summary>
        public Color MainGlyphColor { get; set; }
        /// <summary>
        /// Gets or sets the color to use for music notation elements of the secondary voices. 
        /// </summary>
        public Color SecondaryGlyphColor { get; set; }
        /// <summary>
        /// Gets or sets the color to use for displaying the song information above the music sheet. 
        /// </summary>
        public Color ScoreInfoColor { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="RenderingResources"/> class.
        /// </summary>
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
