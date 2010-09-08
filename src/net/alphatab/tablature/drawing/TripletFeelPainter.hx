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
 * This painter draws triplet feel symbols
 */
class TripletFeelPainter 
{
	public static function paintTripletFeel16(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.TripletFeel16, x, y, scale);
	}
	public static function paintTripletFeel8(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.TripletFeel8, x, y, scale);		
	}
	public static function paintTripletFeelNone16(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.TripletFeelNone16, x, y, scale);		
	}
	public static function paintTripletFeelNone8(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.TripletFeelNone8, x, y, scale);
	}
}