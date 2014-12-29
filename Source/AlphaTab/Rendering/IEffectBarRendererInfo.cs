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
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// A public class implementing this public interface can provide the 
    /// data needed by a EffectBarRenderer to create effect glyphs dynamically.
    /// </summary>
    public interface IEffectBarRendererInfo
    {
        /// <summary>
        /// Gets a value indicating whether this effect bar renderer
        /// should only be added once on the first track if multiple tracks are rendered.
        /// (Example: this allows to render the tempo changes only once)
        /// </summary>
        /// <returns>true if this effect bar should only be created once for the first track, otherwise false.</returns>
        bool HideOnMultiTrack { get; }
        /// <summary>
        /// Checks whether the given beat has the appropriate effect set and
        /// needs a glyph creation 
        /// </summary>
        /// <param name="renderer">the renderer which requests for glyph creation</param>
        /// <param name="beat">the beat storing the data</param>
        /// <returns>true if the beat has the effect set, otherwise false.</returns>
        bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat);

        /// <summary>
        /// Gets the sizing mode of the glyphs created by this info.
        /// </summary>
        /// <returns>the sizing mode to apply to the glyphs during layout</returns>
        EffectBarGlyphSizing SizingMode { get; }

        /// <summary>
        /// Gets the height of that this effect needs
        /// </summary>
        /// <param name="renderer">the renderer</param>
        /// <returns>the height needed by this effect</returns>
        float GetHeight(EffectBarRenderer renderer);

        /// <summary>
        /// Creates a new effect glyph for the given beat. 
        /// </summary>
        /// <param name="renderer">the renderer which requests for glyph creation</param>
        /// <param name="beat">the beat storing the data</param>
        /// <returns>the glyph which needs to be added to the renderer</returns>
        EffectGlyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat);

        /// <summary>
        /// Checks whether an effect glyph can be expanded to a particular beat.
        /// </summary>
        /// <param name="renderer">the renderer which requests for glyph creation</param>
        /// <param name="from">the beat which already has the glyph applied</param>
        /// <param name="to">the beat which the glyph should get expanded to</param>
        /// <returns> true if the glyph can be expanded, false if a new glyph needs to be created.</returns>
        bool CanExpand(EffectBarRenderer renderer, Beat from, Beat to);
    }
}
