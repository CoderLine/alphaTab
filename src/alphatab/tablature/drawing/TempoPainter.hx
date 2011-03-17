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
package alphatab.tablature.drawing;

/**
 * This painter draws tempo symbols. 
 */
class TempoPainter 
{
	public static function paintTempo(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		var layer:DrawingLayer = context.get(DrawingLayers.MainComponents);
		var draw:DrawingLayer = context.get(DrawingLayers.MainComponentsDraw);
        
        var w:Int = Math.round(6 * scale);
        var h:Int = Math.round(12 * scale);
        var h2:Int = Math.round(h - (3*scale));
        
		NotePainter.paintNote(layer, x, y + h, 0.75, true);
		draw.startFigure();
        draw.addLine(x + w, y, x + w, y + h);
	}
}