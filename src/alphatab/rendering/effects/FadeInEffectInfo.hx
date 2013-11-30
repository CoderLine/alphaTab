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
package alphatab.rendering.effects;

import alphatab.model.Beat;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.glyphs.effects.FadeInGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class FadeInEffectInfo implements IEffectBarRendererInfo
{
    public function new() 
    {       
    }
    
    public function shouldCreateGlyph(renderer : EffectBarRenderer, beat:Beat) : Bool
    {
        return beat.fadeIn;
    }
    
    public function canExpand(renderer : EffectBarRenderer, from:Beat, to:Beat): Bool
    {
        return true;
    } 
    
    public function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(20 * renderer.getScale());
    }
    
    public function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.SingleOnBeatOnly;
    }

    public function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new FadeInGlyph();
    }
}