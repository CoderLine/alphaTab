package net.alphatab.tablature.drawing;

/**
 * This painter draws triplet feel symbols
 */
class TripletFeelPainter 
{
	public static function paintTripletFeel16(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.TripletFeel16, x, y, scale);
	}
	public static function paintTripletFeel8(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.TripletFeel8, x, y, scale);		
	}
	public static function paintTripletFeelNone16(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.TripletFeelNone16, x, y, scale);		
	}
	public static function paintTripletFeelNone8(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		y -= Math.floor(3 * scale);
		var layer:DrawingLayer = context.get(DrawingLayers.MainComponents);
		layer.addMusicSymbol(MusicFont.TripletFeelNone8, x, y, scale);
	}
}