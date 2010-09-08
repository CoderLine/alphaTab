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
package net.alphatab.tablature.drawing;

/**
 * This painter draws tempo symbols. 
 */
class TempoPainter 
{

	public static function paintTempo(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		var realScale:Float = scale /5.0;
		var layer:DrawingLayer = context.get(DrawingLayers.MainComponents);
		var draw:DrawingLayer = context.get(DrawingLayers.MainComponentsDraw);
		var iWidth = Math.round(scale * 1.33);
		var iHeight = Math.round(scale * 3.5);
		NotePainter.paintNote(layer, Math.floor(x + (1*realScale)), Math.floor(y + (iHeight - (1.0*scale))), realScale/1.6, true,
							  DrawingResources.tempoFont);
		draw.startFigure();
		draw.moveTo(x + iWidth, y);
		draw.lineTo(x + iWidth, Math.floor(y + (iHeight - (0.66 * scale))));
	}
}