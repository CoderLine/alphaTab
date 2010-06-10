/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.drawing;
import net.coderline.jsgs.tablature.ViewLayout;

class ClefPainter 
{
	public static function PaintAlto(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		y -= Math.round(3.0 * layout.ScoreLineSpacing);
		var layer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.AltoClef, x, y, layout.Scale);
	}
	public static function PaintBass(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		y -= Math.round(4.0 * layout.ScoreLineSpacing);
		var layer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.BassClef, x, y, layout.Scale);
	}
	public static function PaintTenor(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		y -= Math.round(4.0 * layout.ScoreLineSpacing);
		var layer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.TenorClef, x, y, layout.Scale);
	}
	public static function PaintTreble(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		y -= Math.round(1.0 * layout.ScoreLineSpacing);
		var layer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.TrebleClef, x, y, layout.Scale);
	}
}