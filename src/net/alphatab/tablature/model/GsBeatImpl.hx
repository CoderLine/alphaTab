/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.model;
import js.Lib;
import net.alphatab.model.effects.GsTremoloBarEffect;
import net.alphatab.model.effects.GsTremoloBarPoint;
import net.alphatab.model.GsBeat;
import net.alphatab.model.GsBeatStrokeDirection;
import net.alphatab.model.GsSongFactory;
import net.alphatab.model.Point;
import net.alphatab.model.SongManager;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayer;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.drawing.MusicFont;
import net.alphatab.tablature.TrackSpacingPositions;
import net.alphatab.tablature.ViewLayout;
import net.alphatab.Utils;

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
		PaintBeatEffects(context, layout, x, y);
		
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
	
	private function PaintBeatEffects(context:DrawingContext, layout:ViewLayout, x:Int, y:Int) : Void 
	{		
		var realX:Int = cast (x + 3 * layout.Scale);
		var fill:DrawingLayer = context.Get(DrawingLayers.VoiceEffects1);

		if (this.Effect.Stroke.Direction != GsBeatStrokeDirection.None)
		{
			PaintStroke(layout, context, x, y);
		}

		if (Effect.Chord != null)
		{
			var chordImpl:GsChordImpl = cast Effect.Chord;
			chordImpl.Paint(layout, context, x, y);
		}
		
		if (Effect.FadeIn)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.FadeIn);
			PaintFadeIn(layout, context, realX, realY);
		}
		
		if (Effect.Tapping)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.TapingEffect);
			fill.AddString("T", DrawingResources.DefaultFont, realX, realY);
		}
		else if (Effect.Slapping)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.TapingEffect);
			fill.AddString("S", DrawingResources.DefaultFont, realX, realY);
		}
		else if (Effect.Popping)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.TapingEffect);
			fill.AddString("P", DrawingResources.DefaultFont, realX, realY);
		}
		
		if (Effect.Vibrato)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.BeatVibratoEffect);
			PaintVibrato(layout, context, realX, realY, 1);
		}
		
		if (Effect.IsTremoloBar())
		{
			var string = MinNote == null ? 6 : MinNote.String;
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.Tablature) 
							+ Math.round((string-1) * layout.StringSpacing);
			var nextBeat:GsBeatImpl = cast layout.SongManager().GetNextBeat(this);
			// only use beat for bend if it's in the same line
			if (nextBeat != null && nextBeat.MeasureImpl().Ts != MeasureImpl().Ts)
				nextBeat = null;
			PaintTremoloBar(layout, context, nextBeat, realX, realY);
		}
	}
	
	private function PaintTremoloBar(layout:ViewLayout, context:DrawingContext, nextBeat:GsBeatImpl,x:Int, y:Int)
	{
		var scale:Float = layout.Scale;
		var realX:Float = x + (5 * scale);
		var realY:Float = y + ((DrawingResources.NoteFontHeight/2) * scale);

		var xTo:Float;
		var minY:Float = realY - 60 * scale;
		if (nextBeat == null)
		{// No Next beat -> Till End of Own beat
			xTo = MeasureImpl().PosX + MeasureImpl().Width + MeasureImpl().Spacing;
		}
		else
		{
			xTo = nextBeat.MeasureImpl().PosX + nextBeat.MeasureImpl().HeaderImpl().GetLeftSpacing(layout)
				  + nextBeat.PosX + (nextBeat.Spacing() * scale) + 5 * scale;
		}

		var fill:DrawingLayer = context.Get(DrawingLayers.VoiceEffects1);
		var draw:DrawingLayer = context.Get(DrawingLayers.VoiceEffectsDraw1);


		var tremolo:GsTremoloBarEffect = Effect.TremoloBar;
		if (tremolo.Points.length >= 2)
		{
			var dX:Float = (xTo - realX) / GsTremoloBarEffect.MaxPositionLength;
			var dY:Float = (realY - minY) / GsTremoloBarEffect.MaxValueLength;

			draw.StartFigure();
			for (i in 0 ... tremolo.Points.length - 1)
			{
				var firstPt:GsTremoloBarPoint = tremolo.Points[i];
				var secondPt:GsTremoloBarPoint = tremolo.Points[i + 1];

				if (firstPt.Value == secondPt.Value && i == tremolo.Points.length - 2) continue;


				//pen.DashStyle = firstPt.Value != secondPt.Value ? DashStyle.Solid : DashStyle.Dash;
				var firstLoc:Point = new Point(Math.floor(realX + (dX * firstPt.Position)), Math.floor(realY - dY * firstPt.Value));
				var secondLoc:Point = new Point(Math.floor(realX + (dX * secondPt.Position)), Math.floor(realY - dY * secondPt.Value));
				draw.AddLine(firstLoc.X, firstLoc.Y, secondLoc.X, secondLoc.Y);


				if (secondPt.Value != 0)
				{
					var dV:Float = (secondPt.Value) * 0.5;
					var up:Bool = (secondPt.Value - firstPt.Value) >= 0;
					var s:String = "";
					if(dV >= 1 || dV <= -1)
						s += "-" + Utils.string(Math.floor(Math.abs(dV))) + " ";
					else if (dV < 0)
						s += "-";
					// Quaters
					dV -= Math.floor(dV);

					if (dV == 0.25)
						s += "1/4";
					else if (dV == 0.5)
						s += "1/2";
					else if (dV == 0.75)
						s += "3/4";


					context.Graphics.font = DrawingResources.DefaultFont;
					var size:Dynamic = context.Graphics.measureText(s);
					var sY:Float = up ? secondLoc.Y - DrawingResources.DefaultFontHeight - (3 * scale) : secondLoc.Y + (3 * scale);
					var sX:Float = secondLoc.X - size.width / 2;

					fill.AddString(s, DrawingResources.DefaultFont, cast sX, cast sY);
				}
			}
		}
	}
	
	private function PaintVibrato(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, symbolScale:Float)
	{
		var scale:Float = layout.Scale;
		var realX:Float = x - 2 * scale;
		var realY:Float = y + (2.0 * scale);
		var width:Float = Width();

		var fill:DrawingLayer = context.Get(DrawingLayers.VoiceEffects1);
		
		var step:Float = 18 * scale * symbolScale;
		var loops:Int = Math.floor(Math.max(1, (width / step)));
		var s:String = "";
		for (i in 0 ... loops)
		{
			fill.AddMusicSymbol(MusicFont.VibratoLeftRight, realX, realY, layout.Scale * symbolScale);
			realX += step;
		}
	}
	
	private function PaintFadeIn(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var scale:Float = layout.Scale;
		var realX:Int = x;
		var realY:Int = Math.round(y + (4.0 * scale));
		
		var fWidth:Int = Math.round(Width());
		var layer:DrawingLayer = context.Get(DrawingLayers.VoiceDraw1);

		layer.StartFigure();
		layer.AddBezier(realX, realY, realX, realY, realX + fWidth, realY, realX + fWidth, Math.round(realY - (4 * scale)));
		layer.StartFigure();
		layer.AddBezier(realX, realY, realX, realY, realX + fWidth, realY, realX + fWidth, Math.round(realY + (4 * scale)));
	}

	public function PaintStroke(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		if (Effect.Stroke.Direction == GsBeatStrokeDirection.None) return;
		var scale:Float = layout.Scale;
		var realX:Float = x;
		var realY:Float = y + GetPaintPosition(TrackSpacingPositions.Tablature);

		var y1:Float = realY;
		var y2:Float = realY + MeasureImpl().TrackImpl().TabHeight;

		var layer:DrawingLayer = context.Get(DrawingLayers.MainComponentsDraw);
		layer.StartFigure();
		if (Effect.Stroke.Direction == GsBeatStrokeDirection.Up)
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
	
	public function CalculateTremoloBarOverflow(layout:ViewLayout) : Int
	{
		// Find lowest point
		var point:GsTremoloBarPoint = null;
		for (curr in Effect.TremoloBar.Points)
		{
			if (point == null || curr.Value < point.Value)
				point = curr;
		}

		if (point == null) return 0;

		// 5px*scale movement per value 
		
		var fullHeight:Float = point.Value * (6 * layout.Scale);
		var string:Int = MinNote == null ? 6 : MinNote.String;
		//var heightToTabNote:Float = (string - 1) * layout.StringSpacing;
		var spaceToBottom:Float = (6 - string) * layout.StringSpacing;
		
		if (fullHeight < 0) // negative offset
		{
			var overflow = Math.round( -((Math.abs(fullHeight) + (layout.StringSpacing / 2)) - spaceToBottom) );
			return overflow;
		}
		else
		{
			return 0;
		}
	}

}