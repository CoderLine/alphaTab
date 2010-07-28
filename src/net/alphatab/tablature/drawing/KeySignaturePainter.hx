/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.drawing;
import net.alphatab.tablature.ViewLayout;

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
	
	public static function PaintSmallFlat(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		y -= layout.ScoreLineSpacing;
		var scale:Float = layout.Scale;
		layer.AddMusicSymbol(MusicFont.KeyFlat, x, y, scale);
	}
	public static function PaintSmallNatural(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		y -= layout.ScoreLineSpacing;
		var scale:Float = layout.Scale;
		layer.AddMusicSymbol(MusicFont.KeyNormal, x, y, scale);
	}
	public static function PaintSmallSharp(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.Scale;
		y -= Math.round(1 * layout.ScoreLineSpacing);
		layer.AddMusicSymbol(MusicFont.KeySharp, x, y, scale);
	}
}