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
import alphatab.tablature.ViewLayout;

/**
 * This painter draws clefs into a drawingcontext.
 */
class ClefPainter 
{
	public static function paintAlto(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		var layer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.AltoClef, x, y, layout.scale);
	}
	public static function paintBass(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		var layer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.BassClef, x, y, layout.scale);
	}
	public static function paintTenor(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		y -= Math.round(1.0 * layout.scoreLineSpacing);
		var layer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.TenorClef, x, y, layout.scale);
	}
	public static function paintTreble(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		y -= Math.round(1.0 * layout.scoreLineSpacing);
		var layer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.TrebleClef, x, y, layout.scale);
	}
}