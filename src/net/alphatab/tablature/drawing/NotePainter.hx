/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.drawing;
import net.alphatab.model.GsBeatStrokeDirection;
import net.alphatab.model.GsDuration;
import net.alphatab.model.Point;
import net.alphatab.model.PointF;
import net.alphatab.tablature.ViewLayout;

class NotePainter 
{
	public static function PaintFooter(layer:DrawingLayer, x:Int, y:Int, dur:Int, dir:Int, layout:ViewLayout) : Void
	{
		var scale = layout.Scale;
		if (dir == -1)
		{
			x += DrawingResources.GetScoreNoteSize(layout, false).Width;
		}
		var s:String = "";
            switch (dur)
            { 
                case GsDuration.SixtyFourth:
                    s = (dir == -1) ? MusicFont.FooterUpSixtyFourth : MusicFont.FooterDownSixtyFourth;
                case GsDuration.ThirtySecond:
                    s = (dir == -1) ? MusicFont.FooterUpThirtySecond : MusicFont.FooterDownThirtySecond;
                case GsDuration.Sixteenth:
                    s = (dir == -1) ? MusicFont.FooterUpSixteenth :  MusicFont.FooterDownSixteenth;
                case GsDuration.Eighth:
                    s = (dir == -1) ? MusicFont.FooterUpEighth :  MusicFont.FooterDownEighth;
            }
            if (s != "")
				layer.AddMusicSymbol(s, x, y, scale);

	}
	public static function PaintBar(layer:DrawingLayer, x1:Int, y1:Int, x2:Int, y2:Int, count:Int, dir:Int, scale:Float ) : Void
	{
		var width:Float = Math.max(1.0, Math.round(3.0 * scale));
		for (i in 0 ... count) {
			var realY1:Float = (y1 - ((i * (5.0 * scale)) * dir));
			var realY2:Float = (y2 - ((i * (5.0 * scale)) * dir));
			
			layer.StartFigure();
			layer.AddPolygon([new PointF(x1, realY1), new PointF(x2, realY2), 
								new PointF(x2, realY2 + width), 
								new PointF(x1, realY1 + width), new PointF(x1, realY1), ]);
			layer.CloseFigure();
		}
	}
	
	public static function PaintHarmonic(layer:DrawingLayer, x:Int, y:Int, scale:Float)
	{
		layer.AddMusicSymbol(MusicFont.Harmonic, x, y, scale);
	}
	
	public static function PaintNote(layer:DrawingLayer, x:Int, y:Int, scale:Float, full:Bool, font:String)
	{
		var symbol = full ? MusicFont.NoteQuarter : MusicFont.NoteHalf;
		layer.AddMusicSymbol(symbol, x, y, scale);
	}
	
	public static function PaintDeadNote(layer:DrawingLayer, x:Int, y:Int, scale:Float, font:String)
	{
		layer.AddMusicSymbol(MusicFont.DeadNote, x, y, scale);
	}	
}