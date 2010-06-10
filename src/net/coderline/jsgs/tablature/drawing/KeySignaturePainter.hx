/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.drawing;
import net.coderline.jsgs.tablature.ViewLayout;

class KeySignaturePainter 
{
	public static function PaintFlat(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		var scale:Float = layout.Scale * 1.2;
		y -= Math.round(2 * layout.ScoreLineSpacing);
		var layer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.KeyFlat, x, y, scale);
	}
	public static function PaintNatural(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		var scale:Float = layout.Scale * 1.2;
		y -= Math.round(2 * layout.ScoreLineSpacing);
		var layer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.KeyNormal, x, y, scale);
	}
	public static function PaintSharp(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		var scale:Float = layout.Scale * 1.2;
		y -= Math.round(1.5 * layout.ScoreLineSpacing);
		var layer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.KeySharp, x, y, scale);
	}	
	
	public static function PaintSmallFlat(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		var scale:Float = layout.Scale;
		var layer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.KeyFlat, x, y, scale);
	}
	public static function PaintSmallNatural(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		var scale:Float = layout.Scale;
		var layer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.KeyNormal, x, y, scale);
	}
	public static function PaintSmallSharp(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		var scale:Float = layout.Scale;
		y -= Math.round(1 * layout.ScoreLineSpacing);
		var layer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.KeySharp, x, y, scale);
	}
}