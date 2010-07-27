/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.drawing;

class TempoPainter 
{

	public static function PaintTempo(context:DrawingContext, x:Int, y:Int, scale:Float)
	{
		var realScale:Float = scale /5.0;
		var layer:DrawingLayer = context.Get(DrawingLayers.MainComponents);
		var draw:DrawingLayer = context.Get(DrawingLayers.MainComponentsDraw);
		var iWidth = Math.round(scale * 1.33);
		var iHeight = Math.round(scale * 3.5);
		NotePainter.PaintNote(layer, Math.floor(x + (1*realScale)), Math.floor(y + (iHeight - (1.0*scale))), realScale/1.6, true,
							  DrawingResources.TempoFont);
		draw.StartFigure();
		draw.MoveTo(x + iWidth, y);
		draw.LineTo(x + iWidth, Math.floor(y + (iHeight - (0.66 * scale))));
	}
}