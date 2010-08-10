package net.alphatab.tablature.drawing;
import net.alphatab.tablature.ViewLayout;

/**
 * This painter draws key signature symbols like flat, natural and sharps
 */
class KeySignaturePainter 
{
	public static function paintFlat(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		var scale:Float = layout.scale * 1.2;
		y -= Math.round(2 * layout.scoreLineSpacing);
		var layer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.KeyFlat, x, y, scale);
	}
	public static function paintNatural(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		var scale:Float = layout.scale * 1.2;
		y -= Math.round(2 * layout.scoreLineSpacing);
		var layer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.KeyNormal, x, y, scale);
	}
	public static function paintSharp(context:DrawingContext, x:Int, y:Int, layout:ViewLayout)
	{
		var scale:Float = layout.scale * 1.2;
		y -= Math.round(1.5 * layout.scoreLineSpacing);
		var layer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.KeySharp, x, y, scale);
	}	
	
	public static function paintSmallFlat(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		y -= layout.scoreLineSpacing;
		var scale:Float = layout.scale;
		layer.addMusicSymbol(MusicFont.KeyFlat, x, y, scale);
	}
	public static function paintSmallNatural(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		y -= layout.scoreLineSpacing;
		var scale:Float = layout.scale;
		layer.addMusicSymbol(MusicFont.KeyNormal, x, y, scale);
	}
	public static function paintSmallSharp(layer:DrawingLayer, x:Float, y:Float, layout:ViewLayout)
	{
		var scale:Float = layout.scale;
		y -= Math.round(1 * layout.scoreLineSpacing);
		layer.addMusicSymbol(MusicFont.KeySharp, x, y, scale);
	}
}