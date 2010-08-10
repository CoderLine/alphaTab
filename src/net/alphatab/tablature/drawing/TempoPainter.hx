package net.alphatab.tablature.drawing;

/**
 * This painter draws tempo symbols. 
 */
class TempoPainter 
{

	public static function paintTempo(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		var realScale:Float = scale /5.0;
		var layer:DrawingLayer = context.get(DrawingLayers.MainComponents);
		var draw:DrawingLayer = context.get(DrawingLayers.MainComponentsDraw);
		var iWidth = Math.round(scale * 1.33);
		var iHeight = Math.round(scale * 3.5);
		NotePainter.paintNote(layer, Math.floor(x + (1*realScale)), Math.floor(y + (iHeight - (1.0*scale))), realScale/1.6, true,
							  DrawingResources.tempoFont);
		draw.startFigure();
		draw.moveTo(x + iWidth, y);
		draw.lineTo(x + iWidth, Math.floor(y + (iHeight - (0.66 * scale))));
	}
}