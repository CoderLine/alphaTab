/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.rendering;

import alphatab.model.Beat;

/**
 * A class implementing this interface can provide the 
 * data needed by a EffectBarRenderer to create effect glyphs dynamically.
 */
interface IEffectBarRendererInfo 
{
    /**
     * Checks whether the given beat has the appropriate effect set and
     * needs a glyph creation 
     * @param renderer the renderer which requests for glyph creation
     * @param beat the beat storing the data 
     * @return true if the beat has the effect set, otherwise false.
     */
    function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool;
    
    /**
     * Gets the sizing mode of the glyphs created by this info.
     * @return the sizing mode to apply to the glyphs during layout.
     */
    function getSizingMode() : EffectBarGlyphSizing;
    
    /**
     * Gets the height of that this effect needs
     * @param renderer the renderer
     * @return the height needed by this effect 
     */
    function getHeight(renderer : EffectBarRenderer) : Int;
    
    /**
     * Creates a new effect glyph for the given beat. 
     * @param renderer the renderer which requests for glyph creation
     * @param beat the beat storing the data 
     * @return the glyph which needs to be added to the renderer
     */
    function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph;
    
    /**
     * Checks whether an effect glyph can be expanded to a particular beat.
     * @param renderer the renderer which requests for glyph creation
     * @param from the beat which already has the glyph applied
     * @param to the beat which the glyph should get expanded to
     * @return true if the glyph can be expanded, false if a new glyph needs to be created.
     */
    function canExpand(renderer : EffectBarRenderer, from:Beat, to:Beat): Bool;
}
