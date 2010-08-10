package net.alphatab.tablature.drawing;
import net.alphatab.tablature.ViewLayout;

/**
 * This painter draws symbols for silences / rests. 
 */
class SilencePainter 
{
	public static function paintEighth(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.scoreLineSpacing;
		y += scale;
		layer.addMusicSymbol(MusicFont.SilenceEighth, x, y, layout.scale);
	}	
	
	public static function paintWhole(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.scoreLineSpacing;
		y += scale;
		layer.addMusicSymbol(MusicFont.SilenceHalf, x, y, layout.scale);
	}	
	
	public static function paintHalf(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.scoreLineSpacing;
		y += scale - (4*layout.scale);
		layer.addMusicSymbol(MusicFont.SilenceHalf, x, y, layout.scale);
	}
	public static function paintQuarter(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.scoreLineSpacing;
		y += scale * 0.5;
		layer.addMusicSymbol(MusicFont.SilenceQuarter,  x, y, layout.scale);
	}
	public static function paintSixteenth(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.scoreLineSpacing;
		y += scale;
		layer.addMusicSymbol(MusicFont.SilenceSixteenth, x, y, layout.scale);
	}
	public static function paintSixtyFourth(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.scoreLineSpacing;
		layer.addMusicSymbol(MusicFont.SilenceSixtyFourth, x, y, layout.scale);
	}
	public static function paintThirtySecond(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.scoreLineSpacing;
		layer.addMusicSymbol(MusicFont.SilenceThirtySecond, x, y, layout.scale);
	}

}