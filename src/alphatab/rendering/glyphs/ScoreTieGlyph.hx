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

import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;
import alphatab.rendering.ScoreBarRenderer;
import alphatab.rendering.utils.BeamingHelper;

class ScoreTieGlyph extends TieGlyph
{
	public function new(startNote:Note, endNote:Note)
	{
		super(startNote, endNote);
	}

	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Dynamic 
	{
		var r:ScoreBarRenderer = cast renderer;
		var startX = cx + r.getNoteX(_startNote);
		var endX = cx + r.getNoteX(_endNote, false);
		
		var startY = cy + r.getNoteY(_startNote) + (NoteHeadGlyph.noteHeadHeight / 2);
		var endY = cy + r.getNoteY(_endNote) + (NoteHeadGlyph.noteHeadHeight / 2);
		
		TieGlyph.paintTie(canvas, getScale(), startX, startY, endX, endY, r.getBeatDirection(_startNote.beat) == BeamDirection.Down);
		
		canvas.setColor(renderer.getLayout().renderer.renderingResources.mainGlyphColor);
		canvas.fill();
	}
}