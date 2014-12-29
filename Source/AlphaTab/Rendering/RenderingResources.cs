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

using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This public class contains central definitions for controlling the visual appearance. 
    /// </summary>
    public class RenderingResources
    {
        public Font MusicFont { get; set; }
        public Font CopyrightFont { get; set; }
        public Font TitleFont { get; set; }
        public Font SubTitleFont { get; set; }
        public Font WordsFont { get; set; }
        public Font EffectFont { get; set; }

        public Font TablatureFont { get; set; }
        public Font GraceFont { get; set; }

        public Color StaveLineColor { get; set; }
        public Color BarSeperatorColor { get; set; }

        public Font BarNumberFont { get; set; }
        public Color BarNumberColor { get; set; }

        public Font MarkerFont { get; set; }
        public Font TabClefFont { get; set; }

        public Color MainGlyphColor { get; set; }

        public float Scale { get; set; }

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
