package net.alphatab.tablature.drawing;
import net.alphatab.tablature.ViewLayout;

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