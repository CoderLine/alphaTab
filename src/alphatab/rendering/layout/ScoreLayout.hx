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
package alphatab.rendering.layout;

import alphatab.Environment;
import alphatab.rendering.EffectBarRenderer;
import alphatab.rendering.EffectBarRendererFactory;
import alphatab.rendering.effects.BeatVibratoEffectInfo;
import alphatab.rendering.effects.NoteVibratoEffectInfo;
import alphatab.rendering.ScoreBarRendererFactory;
import alphatab.rendering.ScoreRenderer;
import alphatab.rendering.staves.Stave;
import alphatab.rendering.staves.StaveGroup;
import alphatab.rendering.TabBarRendererFactory;

/**
 * This is the base class for creating new layouting engines for the score renderer. 
 */
class ScoreLayout 
{
    public var renderer:ScoreRenderer;
    
    public var width:Int;
    public var height:Int;

    private function new(renderer:ScoreRenderer) 
    {
        this.renderer = renderer;
    }
 
    public function doLayout()
    {
        
    }
 
    public function paintScore() : Void
    {
        
    }
    
    private function createEmptyStaveGroup() : StaveGroup
    {
        var group:StaveGroup = new StaveGroup();
		group.layout = this;
        
        for (s in renderer.settings.staves)
        {
            if (Environment.staveFactories.exists(s.id))
            {
                group.addStave(new Stave(Environment.staveFactories.get(s.id)(this)));
            }
        }
        return group;
    }
}