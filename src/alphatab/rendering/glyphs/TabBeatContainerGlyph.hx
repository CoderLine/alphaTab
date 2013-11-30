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
import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;

class TabBeatContainerGlyph extends BeatContainerGlyph
{
	public function new(beat:Beat) 
	{
		super(beat);
    }
    
	private override function createTies(n:Note) 
    {
		if (n.isHammerPullDestination && n.hammerPullOrigin != null)
		{
			var tie = new TabTieGlyph(n.hammerPullOrigin, n, this);
			ties.push(tie);
		}
		else if (n.slideType == SlideType.Legato)
		{
			var tie = new TabTieGlyph(n, n.slideTarget, this);
			ties.push(tie);
		}
		
		if (n.slideType != SlideType.None)
		{
			var l = new TabSlideLineGlyph(n.slideType, n, this);
			ties.push(l);
		}		
    }
}