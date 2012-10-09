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

class ScoreTieGlyph extends Glyph
{
	private var _startNote:Note;
	private var _endNote:Note;
	
	public function new(startNote:Note, endNote:Note)
	{
		super(0, 0);
		_startNote = startNote;
		_endNote = endNote;
	}

	public override function doLayout():Dynamic 
	{
		width = 0;
	}
	
	public override function canScale():Bool 
	{
		return false;
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Dynamic 
	{
		var r:ScoreBarRenderer = cast renderer;
		var startX = cx + r.getNoteX(_startNote);
		var endX = cx + r.getNoteX(_endNote, false);
		
		var startY = cy + r.getNoteY(_startNote) + (NoteHeadGlyph.noteHeadHeight / 2);
		var endY = cy + r.getNoteY(_endNote) + (NoteHeadGlyph.noteHeadHeight / 2);
		
		paintTie(canvas, getScale(), startX, startY, endX, endY, r.getBeatDirection(_startNote.beat) == BeamDirection.Down);
		
		canvas.setColor(renderer.getLayout().renderer.renderingResources.mainGlyphColor);
		canvas.fill();
	}
	
	// paints a tie between the two given points
    public static function paintTie(canvas:ICanvas, scale:Float, x1:Float, y1:Float, x2:Float, y2:Float, down:Bool=false) : Void
    {
		// ensure endX > startX
		if (x2 > x1) 
		{
			var t = x1;
			x1 = x2;
			x2 = t;
			t = y1;
			y1 = y2;
			y2 = t;
		}
        //
        // calculate control points 
        //
        var offset = 15*scale;
        var size = 4*scale;
        // normal vector
        var normalVector = {
            x: (y2 - y1),
            y: (x2 - x1)
        }
        var length = Math.sqrt((normalVector.x*normalVector.x) + (normalVector.y * normalVector.y));
        if(down) 
            normalVector.x *= -1;
        else
            normalVector.y *= -1;
        
        // make to unit vector
        normalVector.x /= length;
        normalVector.y /= length;
        
        // center of connection
        var center = {
            x: (x2 + x1)/2,
            y: (y2 + y1)/2
        };
       
        // control points
        var cp1 = {
            x: center.x + (offset*normalVector.x),
            y: center.y + (offset*normalVector.y),
        }; 
        var cp2 = {
            x: center.x + ((offset-size)*normalVector.x),
            y: center.y + ((offset-size)*normalVector.y),
        };
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.quadraticCurveTo(cp1.x, cp1.y, x2, y2);
        canvas.quadraticCurveTo(cp2.x, cp2.y, x1, y1);
        canvas.closePath();
    }
}