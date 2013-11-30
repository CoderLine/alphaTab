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
import alphatab.model.Note;
import alphatab.rendering.EffectBarGlyphSizing;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.Glyph;
import alphatab.rendering.glyphs.effects.DummyEffectGlyph;
import alphatab.rendering.glyphs.effects.LineRangedGlyph;
import alphatab.rendering.IEffectBarRendererInfo;

class LetRingEffectInfo extends NoteEffectInfoBase
{
    public function new() 
    {       
        super();
    }
    
    private override function shouldCreateGlyphForNote(renderer:EffectBarRenderer, note:Note):Bool 
    {
        return note.isLetRing;
    }
    
    public override function getHeight(renderer : EffectBarRenderer) : Int
    {
        return Std.int(15 * renderer.getScale());
    }
    
    public override function getSizingMode() : EffectBarGlyphSizing
    {
        return EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
    }

    public override function createNewGlyph(renderer : EffectBarRenderer, beat:Beat) : Glyph
    {
        return new LineRangedGlyph(0,0,"LetRing");
    }
}