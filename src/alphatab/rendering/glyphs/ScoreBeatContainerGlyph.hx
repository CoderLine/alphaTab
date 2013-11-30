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

class ScoreBeatContainerGlyph extends BeatContainerGlyph
{
    public function new(beat:Beat) 
    {
        super(beat);
    }
    
    private override function createTies(n:Note) 
    {
        // create a tie if any effect requires it
        if (n.isTieDestination && n.tieOrigin != null) 
        {
            var tie = new ScoreTieGlyph(n.tieOrigin, n, this);
            ties.push(tie);
        }
        else if (n.isHammerPullDestination)
        {
            var tie = new ScoreTieGlyph(n.hammerPullOrigin, n, this);
            ties.push(tie);
        }
        else if (n.slideType == SlideType.Legato)
        {
            var tie = new ScoreTieGlyph(n, n.slideTarget, this);
            ties.push(tie);
        }
        
        // TODO: depending on the type we have other positioning
        // we should place glyphs in the preNotesGlyph or postNotesGlyph if needed
        if (n.slideType != SlideType.None)
        {
            var l = new ScoreSlideLineGlyph(n.slideType, n, this);
            ties.push(l);
        }    
    }
    
}