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
package alphatab.rendering.glyphs;

import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.Note;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;

class BeatGlyphBase extends GlyphGroup
{
	public var container:BeatContainerGlyph;

	public function new() 
	{
		super();
	}
    
	public override function doLayout():Void 
	{
		// left to right layout
		var w = 0;
		for (g in _glyphs)
		{
			g.x = w;
			g.renderer = renderer;
			g.doLayout();
			w += g.width;
		}	
		width = w;
	}    
	
	private function noteLoop( action:Note -> Void ) 
	{
		var i = container.beat.notes.length -1;
		while ( i >= 0 )
		{
			action(container.beat.notes[i--]);
		}
	}
	
    private function getBeatDurationWidth() : Int
    {
        switch(container.beat.duration)
        {
            case Whole:         return 103;
            case Half:          return 45;
            case Quarter:       return 29;
            case Eighth:        return 19;
            case Sixteenth:     return 11;
            case ThirtySecond:  return 11;
            case SixtyFourth:   return 11;
        }
    }		
}