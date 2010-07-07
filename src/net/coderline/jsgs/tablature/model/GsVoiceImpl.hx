/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.model;
import net.coderline.jsgs.model.GsDuration;
import net.coderline.jsgs.model.GsMeasureClefConverter;
import net.coderline.jsgs.model.GsNote;
import net.coderline.jsgs.model.GsSongFactory;
import net.coderline.jsgs.model.GsTriplet;
import net.coderline.jsgs.model.GsVoice;
import net.coderline.jsgs.model.GsVoiceDirection;
import net.coderline.jsgs.model.Point;
import net.coderline.jsgs.tablature.drawing.DrawingContext;
import net.coderline.jsgs.tablature.drawing.DrawingLayer;
import net.coderline.jsgs.tablature.drawing.DrawingLayers;
import net.coderline.jsgs.tablature.drawing.DrawingResources;
import net.coderline.jsgs.tablature.drawing.NotePainter;
import net.coderline.jsgs.tablature.drawing.SilencePainter;
import net.coderline.jsgs.tablature.TrackSpacingPositions;
import net.coderline.jsgs.tablature.ViewLayout;
import net.coderline.jsgs.Utils;

class GsVoiceImpl extends GsVoice
{
	private var _usedStrings:Array<Bool>;
	private var _hiddenSilence:Bool;
	private var _silenceY:Float;
	private var _silenceHeight:Float;
	
	public var Width:Int;
	public var MinNote:GsNoteImpl;
	public var MaxNote:GsNoteImpl;
	
	public function PosX() : Int
	{
		return BeatImpl().PosX;
	}

	public inline function BeatImpl() : GsBeatImpl
	{
		return cast Beat;
	}

	public inline function MeasureImpl() : GsMeasureImpl
	{
		return cast Beat.Measure;
	}

	public function UsedStrings() : Array<Bool>
	{
		if (_usedStrings == null)
		{
			_usedStrings = new Array<Bool>();
			for (i in 0 ... Beat.Measure.Track.StringCount())
			{
				_usedStrings.push(false);
			}
		}
		return _usedStrings;
	}
	
	public var Join1:GsVoiceImpl;
	public var Join2:GsVoiceImpl;

	public var IsJoinedGreaterThanQuarter:Bool;

	public var JoinedType:GsJoinedType;

	public var PreviousBeat:GsVoiceImpl;
	public var NextBeat:GsVoiceImpl;

	public var BeatGroup:BeatGroup;
	public var TripletGroup:TripletGroup;
	
	public function GetPaintPosition(iIndex:TrackSpacingPositions) : Int
	{
		return MeasureImpl().Ts.Get(iIndex);
	}

	public var MaxString:Int;

	public var MinString:Int;

	public var MaxY:Int;

	public var MinY:Int;

	public var IsHiddenSilence:Bool;


	public function new(factory:GsSongFactory, index:Int) 
	{
		super(factory, index);
	}
	
	public function Reset() : Void
	{
		MaxNote = null;
		MinNote = null;
		_hiddenSilence = false;
		_usedStrings = new Array<Bool>();
		for (i in 0 ... Beat.Measure.Track.StringCount())
		{
			_usedStrings.push(false);
		}
		MaxString = 1;
		MinString = Beat.Measure.Track.StringCount();
	}

	public function Check(note:GsNoteImpl) : Void
	{
		var value:Int = note.RealValue();
		if (MaxNote == null || value > MaxNote.RealValue()) MaxNote = note;
		if (MinNote == null || value < MinNote.RealValue()) MinNote = note;

		UsedStrings()[note.String - 1] = true;
		if (note.String > MaxString) MaxString = note.String;
		if (note.String < MinString) MinString = note.String;
	}

	public function Update(layout:ViewLayout): Void
	{
		MinY = 0;
		MaxY = 0;
		if (IsRestVoice()) UpdateSilenceSpacing(layout);
		else UpdateNoteVoice(layout);
		// try to add on tripletgroup of previous beat or create a new group
		if (Duration.Triplet != null && !Duration.Triplet.Equals(GsTriplet.Normal))
		{
			if (PreviousBeat == null || PreviousBeat.TripletGroup == null || !PreviousBeat.TripletGroup.check(this))
			{			
				TripletGroup = new TripletGroup(Index);
				TripletGroup.check(this);
			}
			else
			{
				TripletGroup = PreviousBeat.TripletGroup;
			}
		}
	}
	
	public function UpdateNoteVoice(layout:ViewLayout) : Void
	{
		JoinedType = GsJoinedType.NoneRight;
		IsJoinedGreaterThanQuarter = false;
		Join1 = this;
		Join2 = this;
		var noteJoined:Bool = false;
		var withPrev:Bool = false;

		if (PreviousBeat != null && !PreviousBeat.IsRestVoice())
		{
			if (MeasureImpl().CanJoin(layout.SongManager(), this, PreviousBeat))
			{
				withPrev = true;
				if (PreviousBeat.Duration.Value >= Duration.Value)
				{
					Join1 = PreviousBeat;
					Join2 = this;
					JoinedType = GsJoinedType.Left;
					noteJoined = true;
				}
				if (PreviousBeat.Duration.Value > GsDuration.Quarter)
				{
					IsJoinedGreaterThanQuarter = true;
				}
			}
		}

		if (NextBeat != null && !NextBeat.IsRestVoice())
		{
			if (MeasureImpl().CanJoin(layout.SongManager(), this, NextBeat))
			{
				if (NextBeat.Duration.Value >= Duration.Value)
				{
					Join2 = NextBeat;
					if (PreviousBeat == null || PreviousBeat.IsRestVoice() || PreviousBeat.Duration.Value < Duration.Value)
						Join1 = this;
					noteJoined = true;
					JoinedType = GsJoinedType.Right;
				}
				if (NextBeat.Duration.Value > GsDuration.Quarter) IsJoinedGreaterThanQuarter = true;
			}
		}

		if (!noteJoined && withPrev) JoinedType = GsJoinedType.NoneLeft;

		MinY = 0;
		MaxY = BeatImpl().MeasureImpl().TrackImpl().TabHeight;
		if (BeatGroup.Direction == GsVoiceDirection.Down)
		{ 
			MaxY += Math.floor((layout.StringSpacing / 2) * 5) + 1;
		}
		else
		{
			MinY -=  Math.floor((layout.StringSpacing / 2) * 5) + 1;
		}
	}

	public function UpdateSilenceSpacing(layout:ViewLayout) : Void
	{
		_silenceY = 0;
		_silenceHeight = 0;

		if (!_hiddenSilence)
		{
			var lineSpacing:Int = cast layout.ScoreLineSpacing;
			var LineCount:Int = 5;
			var scale:Float = (lineSpacing / 9.0);

			var duration:Int = Duration.Value;
			if (duration == GsDuration.Whole)
			{
				_silenceHeight = lineSpacing;
				_silenceY = (lineSpacing);
			}
			else if (duration == GsDuration.Half)
			{
				_silenceHeight = lineSpacing;
				_silenceY = (lineSpacing * 2) - _silenceHeight;
			}
			else if (duration == GsDuration.Quarter)
			{
				_silenceHeight = (scale * 16);
				_silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (_silenceHeight / 2);
			}
			else if (duration == GsDuration.Eighth)
			{
				_silenceHeight = (scale * 12);
				_silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (_silenceHeight / 2);
			}
			else if (duration == GsDuration.Sixteenth)
			{
				_silenceHeight = (scale * 16);
				_silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (_silenceHeight / 2);
			}
			else if (duration == GsDuration.ThirtySecond)
			{
				_silenceHeight = (scale * 24);
				_silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (_silenceHeight / 2);
			}
			else if (duration == GsDuration.SixtyFourth)
			{
				_silenceHeight = (scale * 28);
				_silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (_silenceHeight / 2);
			}

			for (v in 0 ... Beat.Voices.length)
			{
				if (v != Index)
				{
					var voice:GsVoiceImpl = BeatImpl().GetVoiceImpl(v);
					if (!voice.IsEmpty)
					{
						if (voice.IsRestVoice())
						{
							if (!voice.IsHiddenSilence)
							{
								var maxSilenceHeight:Float = (lineSpacing * 3);
								var firstPosition:Float = (_silenceY - (maxSilenceHeight / Beat.Voices.length));
								_silenceY = (firstPosition + (maxSilenceHeight * Index));
							}
						}
					}
				}
			}
			MinY = cast _silenceY;
			MaxY = cast (_silenceY + _silenceHeight);
		}
	}
	
	// Painting
	// Voice Drawing/Layouting
	public function Paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		if (!IsEmpty)
		{
			if (IsRestVoice() && !IsHiddenSilence)
			{
				PaintSilence(layout, context, x, y);
			}
			else
			{
				for (note in Notes)
				{
					var noteImpl:GsNoteImpl = cast note;
					noteImpl.Paint(layout, context, x, y);
				}
				PaintBeat(layout, context, x, y);
			}
		}
	}
	
	// Silence
	public function PaintSilence(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var realX:Int = cast (x + 3 * layout.Scale);
		var realY:Int = y + GetPaintPosition(TrackSpacingPositions.ScoreMiddleLines);
		var lineSpacing:Int = cast layout.ScoreLineSpacing;
		var scale:Float = lineSpacing;

		var fill:DrawingLayer = Index == 0 ? context.Get(DrawingLayers.Voice1) : context.Get(DrawingLayers.Voice2);

		switch (Duration.Value)
		{ 
			case GsDuration.Whole:
				SilencePainter.PaintWhole(fill, realX, cast realY, layout);
			case GsDuration.Half:
				SilencePainter.PaintHalf(fill, realX, realY, layout);
			case GsDuration.Quarter:
				SilencePainter.PaintQuarter(fill, realX, realY, layout);
			case GsDuration.Eighth:
				SilencePainter.PaintEighth(fill, realX, realY, layout);
			case GsDuration.Sixteenth:
				SilencePainter.PaintSixteenth(fill, realX, realY, layout);
			case GsDuration.ThirtySecond:
				SilencePainter.PaintThirtySecond(fill, realX, realY, layout);
			case GsDuration.SixtyFourth:
				SilencePainter.PaintSixtyFourth(fill, realX, realY, layout);
		}


		if (Duration.IsDotted || Duration.IsDoubleDotted)
		{
			fill.MoveTo(realX + 10, realY + 1);
			fill.EllipseTo(1, 1);

			if (Duration.IsDoubleDotted)
			{
				fill.MoveTo((realX + 13), realY + 1);
				fill.EllipseTo(1, 1);
			}
		}
		
		PaintTriplet(layout, context, x, y);
	}
	
	// Triplet
	public function PaintTriplet(layout:ViewLayout, context:DrawingContext, x:Int, y:Int)
	{
		var realX:Int = cast (x + 3 * layout.Scale);
		var fill:DrawingLayer = Index == 0 ? context.Get(DrawingLayers.Voice1) : context.Get(DrawingLayers.Voice2);
		
		if (!Duration.Triplet.Equals(GsTriplet.Normal))
		{  
			// paint group if group is full and is first of group
			//  otherwise only a number
			if (TripletGroup.isFull() && 
				(PreviousBeat == null  || PreviousBeat.TripletGroup == null || PreviousBeat.TripletGroup != TripletGroup) )
			{
				TripletGroup.paint(layout, context, x, y);
			}
			else if(!TripletGroup.isFull())
			{
				fill.AddString(Utils.string(Duration.Triplet.Enters), DrawingResources.DefaultFont, Math.round(realX), Math.round(y + GetPaintPosition(TrackSpacingPositions.Tupleto)));
			}
		}
	}
	// Beat
	public function PaintBeat(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		if (!IsRestVoice())
		{
			var spacing:Int= BeatImpl().Spacing();
			PaintScoreBeat(
				layout,
				context,
				x,
				y + GetPaintPosition(TrackSpacingPositions.ScoreMiddleLines),
				spacing);
		}
	}
	
	// ScoreBeat
	public function PaintScoreBeat(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, spacing:Int) : Void
	{
		var vX:Int = cast (x + 4 * layout.Scale);

		var fill:DrawingLayer = Index == 0 ? context.Get(DrawingLayers.Voice1) : context.Get(DrawingLayers.Voice2);
		var draw:DrawingLayer = Index == 0 ? context.Get(DrawingLayers.VoiceDraw1) : context.Get(DrawingLayers.VoiceDraw2);
		// Tupleto
		PaintTriplet(layout, context, x, (y - GetPaintPosition(TrackSpacingPositions.ScoreMiddleLines)));
		
		if (Duration.Value >= GsDuration.Half)
		{
			var scale:Float = layout.Scale;
			var lineSpacing:Float = layout.ScoreLineSpacing;
			var direction:GsVoiceDirection = this.BeatGroup.Direction;

			var key:Int = Beat.Measure.GetKeySignature();
			var clef:Int  = GsMeasureClefConverter.ToInt(Beat.Measure.Clef);

			var xMove:Int = direction == GsVoiceDirection.Up
							? DrawingResources.GetScoreNoteSize(layout, false).Width
							: 0;
			var yMove:Int = direction == GsVoiceDirection.Up
							? Math.round(layout.ScoreLineSpacing / 3) + 1
							: Math.round(layout.ScoreLineSpacing / 3) * 2;
			var vY1:Int = y + ((direction == GsVoiceDirection.Down)
									? MaxNote.ScorePosY
									: MinNote.ScorePosY);
			var vY2:Int = y + BeatGroup.GetY2(layout, PosX() + spacing, key, clef);

			draw.StartFigure();
			draw.MoveTo(vX + xMove, vY1 + yMove);
			draw.LineTo(vX + xMove, vY2);

			if (Duration.Value >= GsDuration.Eighth)
			{
				var index:Int = Duration.Index() - 3;
				if (index >= 0)
				{
					var dir:Int = direction == GsVoiceDirection.Down ? 1 : -1;
					var joinedType:GsJoinedType = JoinedType;

					var bJoinedGreaterThanQuarter:Bool = IsJoinedGreaterThanQuarter;

					if ((joinedType == GsJoinedType.NoneLeft || joinedType == GsJoinedType.NoneRight) &&
						!bJoinedGreaterThanQuarter)
					{
						var hY:Float = ((y + BeatGroup.GetY2(layout, PosX() + spacing, key, clef)) -
									((lineSpacing * 2) * dir));
						
						NotePainter.PaintFooter(
							fill, vX, vY2, Duration.Value, dir, layout);
					}
					else
					{
						var startX:Int;
						var endX:Int;

						// These two variables have to be set for the calculation of our y position
						var startXforCalculation:Int;
						var endXforCalculation:Int;

						if (joinedType == GsJoinedType.NoneRight)
						{
							startX = Math.round(BeatImpl().GetRealPosX(layout) + xMove);
							endX = Math.round(BeatImpl().GetRealPosX(layout) + (6*scale) + xMove);
							startXforCalculation = PosX() + spacing;
							endXforCalculation = Math.floor(PosX() + spacing + (6*scale));
						}
						else if (joinedType == GsJoinedType.NoneLeft)
						{
							startX = Math.round(BeatImpl().GetRealPosX(layout) - (6*scale) + xMove);
							endX = Math.round(BeatImpl().GetRealPosX(layout) + xMove);
							startXforCalculation = Math.floor(PosX() + spacing - (6*scale));
							endXforCalculation = PosX() + spacing;
						}
						else
						{
							startX = Math.round(Join1.BeatImpl().GetRealPosX(layout) + xMove);
							endX = Math.round(Join2.BeatImpl().GetRealPosX(layout) + xMove + (1*scale));
							startXforCalculation = Join1.PosX() + Join1.BeatImpl().Spacing();
							endXforCalculation = Join2.PosX() + Join2.BeatImpl().Spacing();
						}

						var hY1:Int = y + this.BeatGroup.GetY2(layout, startXforCalculation, key, clef);
						var hY2:Int = y + this.BeatGroup.GetY2(layout, endXforCalculation, key, clef);
						var x1:Float = startX;
						var x2:Float = endX;

						NotePainter.PaintBar(fill, cast x1, hY1, cast x2, hY2, index + 1, dir, scale);
					}
				}
			}
		}
	}
	
	public function PaintDot(layout:ViewLayout, layer:DrawingLayer, x:Float, y:Float, scale:Float) : Void
	{
		var dotSize:Float = 3.0 * scale;
		layer.AddEllipse(Math.round(x - (dotSize / 2.0)), Math.round(y - (dotSize / 2.0)), cast dotSize, cast dotSize);

		if (Duration.IsDoubleDotted)
		{
			layer.AddEllipse(Math.round((x + (dotSize + 2.0)) - (dotSize / 2.0)), Math.round(y - (dotSize / 2.0)),cast  dotSize,cast  dotSize);
		}
	}
}