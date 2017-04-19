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
namespace AlphaTab.Rendering
{
    /// <summary>
    /// Lists all sizing types of the effect bar glyphs
    /// </summary>
    public enum EffectBarGlyphSizing
    {
        /// <summary>
        /// The effect glyph is placed above the pre-beat glyph which is before 
        /// the actual note in the area where also accidentals are renderered. 
        /// </summary>
        SinglePreBeat,
        /// <summary>
        /// The effect glyph is placed above the on-beat glyph which is where
        /// the actual note head glyphs are placed. 
        /// </summary>
        SingleOnBeat,
        /// <summary>
        /// The effect glyph is placed above the on-beat glyph and expaded to the 
        /// on-beat position of the next beat.
        /// </summary>
        GroupedBeforeBeat,
        /// <summary>
        /// The effect glyph is placed above the on-beat glyph and expaded to the 
        /// on-beat position of the next beat.
        /// </summary>
        GroupedOnBeat,
        /// <summary>
        /// The effect glyph is placed on the whole bar covering the whole width
        /// </summary>
        FullBar
    }
}
