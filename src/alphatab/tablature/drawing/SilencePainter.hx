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
 * This painter draws symbols for silences / rests. 
 */
class SilencePainter 
{
	public static function paintEighth(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		y += layout.scoreLineSpacing;
		layer.addMusicSymbol(MusicFont.SilenceEighth, x, y, layout.scale);
	}	
	
	public static function paintWhole(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		y += layout.scoreLineSpacing;
		layer.addMusicSymbol(MusicFont.SilenceHalf, x, y, layout.scale);
	}	
	
	public static function paintHalf(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		y += layout.scoreLineSpacing - (4*layout.scale);
		layer.addMusicSymbol(MusicFont.SilenceHalf, x, y, layout.scale);
	}
    
	public static function paintQuarter(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		y += layout.scoreLineSpacing * 0.5;
		layer.addMusicSymbol(MusicFont.SilenceQuarter,  x, y, layout.scale);
	}
	public static function paintSixteenth(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		y += layout.scoreLineSpacing;
		layer.addMusicSymbol(MusicFont.SilenceSixteenth, x, y, layout.scale);
	}
	public static function paintSixtyFourth(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		layer.addMusicSymbol(MusicFont.SilenceSixtyFourth, x, y, layout.scale);
	}
	public static function paintThirtySecond(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		layer.addMusicSymbol(MusicFont.SilenceThirtySecond, x, y, layout.scale);
	}

}