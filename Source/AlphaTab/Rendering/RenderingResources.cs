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
using System.Runtime.CompilerServices;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This public class contains central definitions for controlling the visual appearance. 
    /// </summary>
    public class RenderingResources
    {
        [IntrinsicProperty]
        public Font MusicFont { get; set; }
        [IntrinsicProperty]
        public Font CopyrightFont { get; set; }
        [IntrinsicProperty]
        public Font TitleFont { get; set; }
        [IntrinsicProperty]
        public Font SubTitleFont { get; set; }
        [IntrinsicProperty]
        public Font WordsFont { get; set; }
        [IntrinsicProperty]
        public Font EffectFont { get; set; }

        [IntrinsicProperty]
        public Font TablatureFont { get; set; }
        [IntrinsicProperty]
        public Font GraceFont { get; set; }

        [IntrinsicProperty]
        public Color StaveLineColor { get; set; }
        [IntrinsicProperty]
        public Color BarSeperatorColor { get; set; }

        [IntrinsicProperty]
        public Font BarNumberFont { get; set; }
        [IntrinsicProperty]
        public Color BarNumberColor { get; set; }

        [IntrinsicProperty]
        public Font MarkerFont { get; set; }
        [IntrinsicProperty]
        public Font TabClefFont { get; set; }

        [IntrinsicProperty]
        public Color MainGlyphColor { get; set; }

        [IntrinsicProperty]
        public float Scale { get; set; }

        [IntrinsicProperty]
        public Color ScoreInfoColor { get; set; }

        public RenderingResources(float scale)
        {
            Init(scale);
        }
    
        public void Init(float scale) 
        { 
            Scale = scale;
        
            const string musicFont = "alphaTab";
            const string sansFont = "Arial";
            const string serifFont = "Georgia";
        
            MusicFont = new Font(musicFont, 11 * scale);

            EffectFont = new Font(serifFont, 12 * scale, FontStyle.Italic);
            CopyrightFont = new Font(sansFont, 12 * scale, FontStyle.Bold);
        
            TitleFont = new Font(serifFont, 32 * scale);
            SubTitleFont = new Font(serifFont, 20 * scale);
            WordsFont = new Font(serifFont, 15 * scale);
        
            TablatureFont = new Font(sansFont, 13 * scale); 
            GraceFont = new Font(sansFont, 11 * scale); 
       
            StaveLineColor = new Color(165, 165, 165);
            BarSeperatorColor = new Color(34, 34, 17);
       
            BarNumberFont = new Font(sansFont, 11 * scale); 
            BarNumberColor = new Color(200, 0, 0);

            MarkerFont = new Font(serifFont, 14 * scale, FontStyle.Bold);
            TabClefFont = new Font(sansFont, 18 * scale, FontStyle.Bold);
        
            ScoreInfoColor = new Color(0,0,0);
            MainGlyphColor = new Color(0,0,0);
        }
    }
}
