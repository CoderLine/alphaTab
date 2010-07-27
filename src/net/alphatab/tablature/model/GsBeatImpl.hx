/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.model;
import net.alphatab.model.GsBeat;
import net.alphatab.model.GsBeatStrokeDirection;
import net.alphatab.model.GsSongFactory;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayer;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.TrackSpacingPositions;
import net.alphatab.tablature.ViewLayout;

class GsBeatImpl extends GsBeat
{
	public var PosX:Int;
	public var LastPaintX:Int;
	public var MinimumWidth:Int; 
	public var MaxNote:GsNoteImpl;
	public var MinNote:GsNoteImpl; 
	
	public var JoinedType:GsJoinedType; 
	public var JoinedGreaterThanQuarter:Bool;
	public var Join1:GsBeatImpl;
	public var Join2:GsBeatImpl;
	public var PreviousBeat:GsBeatImpl;
	public var NextBeat:GsBeatImpl;
	public var BeatGroup:BeatGroup;

	public function CaretPosition(layout:ViewLayout) : Int
	{
		return Math.round(this.GetRealPosX(layout) + 8 * layout.Scale);
	}
	
	public function Width() : Int
	{
		var w:Int = 0;
		for (i in 0 ... Voices.length)
		{
			var cw:Int = GetVoiceImpl(i).Width;
			if (cw > w)
				w = cw;
		}
		return w;
	}
	
	public function Height() : Int
	{
		return MeasureImpl().Ts.GetSize();
	}
	
	public function MeasureImpl() : GsMeasureImpl
	{
		return cast this.Measure;
	}
	
	public function Spacing() : Int
	{
		return MeasureImpl().GetBeatSpacing(this);
	}

	public function new(factory:GsSongFactory) 
	{
		super(factory);
	}
	
	public function GetVoiceImpl(index:Int) : GsVoiceImpl
	{
		return cast Voices[index];
	}
	
	public function Reset() : Void
	{
		MaxNote = null;
		MinNote = null;
	}
	
	public function Check(note:GsNoteImpl): Void
	{
		var value = note.RealValue();
		if (MaxNote == null || value > MaxNote.RealValue()) MaxNote = note;
		if (MinNote == null || value < MinNote.RealValue()) MinNote = note;
	}
	
	public function GetRealPosX(layout:ViewLayout) : Float
	{
		return MeasureImpl().PosX + MeasureImpl().HeaderImpl().GetLeftSpacing(layout)
		+ PosX + Spacing() + (4 * layout.Scale);
	}
	
	public function Paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int):Void
	{
		x += PosX + Spacing();
		LastPaintX = x;

		PaintExtraLines(context, layout, x, y);
		if (this.Stroke.Direction != GsBeatStrokeDirection.None)
		{
			PaintStroke(layout, context, x, y);
		}

		if (Chord != null)
		{
			var chordImpl:GsChordImpl = cast Chord;
			chordImpl.Paint(layout, context, x, y);
		}

		for (v in 0 ... GsBeat.MaxVoices)
		{
			GetVoiceImpl(v).Paint(layout, context, x, y);
		}
	}
	
	public function PaintExtraLines(context:DrawingContext, layout:ViewLayout, x:Int, y:Int) : Void
	{
		if (!IsRestBeat())
		{
			var iScoreY:Int = y + MeasureImpl().Ts.Get(TrackSpacingPositions.ScoreMiddleLines);
			PaintExtraLines2(context, layout, MinNote, x, iScoreY);
			PaintExtraLines2(context, layout, MaxNote, x, iScoreY);
		}
	}

	private function PaintExtraLines2(context:DrawingContext, layout:ViewLayout, note:GsNoteImpl, x:Int, y:Int) : Void
	{
		var realY:Int = y + note.ScorePosY;
		var x1:Float = x + 3 * layout.Scale;
		var x2:Float = x + 15 * layout.Scale;

		var scoreLineSpacing:Float = layout.ScoreLineSpacing;

		if (realY < y)
		{
			var i = y;
			while (i > realY)
			{ 
				context.Get(DrawingLayers.Lines).StartFigure();
				context.Get(DrawingLayers.Lines).AddLine(cast x1, i, cast x2, i);
				i -= cast scoreLineSpacing;
			}
		}
		else if (realY > (y + (scoreLineSpacing * 4)))
		{
			var i = (y + (scoreLineSpacing * 5));
			while (i < (realY + scoreLineSpacing))
			{
				context.Get(DrawingLayers.Lines).StartFigure();
				context.Get(DrawingLayers.Lines).AddLine(cast x1, cast i, cast x2, cast i);
				i += scoreLineSpacing;
			}
		}
	}

	public function PaintStroke(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		if (Stroke.Direction == GsBeatStrokeDirection.None) return;
		var scale:Float = layout.Scale;
		var realX:Float = x;
		var realY:Float = y + GetPaintPosition(TrackSpacingPositions.Tablature);

		var y1:Float = realY;
		var y2:Float = realY + MeasureImpl().TrackImpl().TabHeight;

		var layer:DrawingLayer = context.Get(DrawingLayers.MainComponentsDraw);
		layer.StartFigure();
		if (Stroke.Direction == GsBeatStrokeDirection.Up)
		{
			layer.MoveTo(cast realX, cast y1);
			layer.LineTo(cast realX, cast y2);
			layer.LineTo(cast (realX - (2.0 * scale)), cast (y2 - (5.0 * scale)));

			layer.MoveTo(cast realX, cast y2);
			layer.LineTo(cast (realX + (2.0 * scale)), cast  (y2 - (5.0 * scale)));
		}
		else
		{
			layer.MoveTo(cast realX, cast y2);
			layer.LineTo(cast realX, cast y1);
			layer.LineTo(cast (realX - (2.0 * scale)), cast (y1 + (3.0 * scale)));
			layer.MoveTo(cast realX, cast y1);
			layer.LineTo(cast (realX + (2.0 * scale)), cast (y1 + (3.0 * scale)));
		}
	}

	public function GetPaintPosition(position:TrackSpacingPositions) : Int
	{
		return MeasureImpl().Ts.Get(position);
	}

}