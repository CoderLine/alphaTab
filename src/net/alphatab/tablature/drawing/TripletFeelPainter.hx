/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.drawing;

class TripletFeelPainter 
{
	public static function PaintTripletFeel16(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.TripletFeel16, x, y, scale);
	}
	public static function PaintTripletFeel8(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.TripletFeel8, x, y, scale);		
	}
	public static function PaintTripletFeelNone16(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.TripletFeelNone16, x, y, scale);		
	}
	public static function PaintTripletFeelNone8(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.Get(DrawingLayers.MainComponents);
		layer.AddMusicSymbol(MusicFont.TripletFeelNone8, x, y, scale);
	}
}