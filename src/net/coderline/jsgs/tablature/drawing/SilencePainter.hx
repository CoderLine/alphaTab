/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.drawing;
import net.coderline.jsgs.tablature.ViewLayout;

class SilencePainter 
{
	public static function PaintEighth(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.ScoreLineSpacing;
		y += scale;
		layer.AddMusicSymbol(MusicFont.SilenceEighth, x, y, layout.Scale);
	}	
	
	public static function PaintWhole(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.ScoreLineSpacing;
		y += scale;
		layer.AddMusicSymbol(MusicFont.SilenceHalf, x, y, layout.Scale);
	}	
	
	public static function PaintHalf(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.ScoreLineSpacing;
		y += scale - (4*layout.Scale);
		layer.AddMusicSymbol(MusicFont.SilenceHalf, x, y, layout.Scale);
	}
	public static function PaintQuarter(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.ScoreLineSpacing;
		y += scale * 0.5;
		layer.AddMusicSymbol(MusicFont.SilenceQuarter,  x, y, layout.Scale);
	}
	public static function PaintSixteenth(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.ScoreLineSpacing;
		y += scale;
		layer.AddMusicSymbol(MusicFont.SilenceSixteenth, x, y, layout.Scale);
	}
	public static function PaintSixtyFourth(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.ScoreLineSpacing;
		layer.AddMusicSymbol(MusicFont.SilenceSixtyFourth, x, y, layout.Scale);
	}
	public static function PaintThirtySecond(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.ScoreLineSpacing;
		layer.AddMusicSymbol(MusicFont.SilenceThirtySecond, x, y, layout.Scale);
	}

}