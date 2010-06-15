/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.model;
import haxe.io.StringInput;
import net.coderline.jsgs.model.effects.GsBendEffect;
import net.coderline.jsgs.model.effects.GsBendPoint;
import net.coderline.jsgs.model.effects.GsHarmonicType;
import net.coderline.jsgs.model.effects.GsTremoloBarEffect;
import net.coderline.jsgs.model.effects.GsTremoloBarPoint;
import net.coderline.jsgs.model.GsBeat;
import net.coderline.jsgs.model.GsDuration;
import net.coderline.jsgs.model.GsMeasureClefConverter;
import net.coderline.jsgs.model.GsNote;
import net.coderline.jsgs.model.GsNoteEffect;
import net.coderline.jsgs.model.GsSlideType;
import net.coderline.jsgs.model.GsSongFactory;
import net.coderline.jsgs.model.GsVoice;
import net.coderline.jsgs.model.GsVoiceDirection;
import net.coderline.jsgs.model.Point;
import net.coderline.jsgs.model.Rectangle;
import net.coderline.jsgs.model.Size;
import net.coderline.jsgs.tablature.drawing.DrawingContext;
import net.coderline.jsgs.tablature.drawing.DrawingLayer;
import net.coderline.jsgs.tablature.drawing.DrawingLayers;
import net.coderline.jsgs.tablature.drawing.DrawingResources;
import net.coderline.jsgs.tablature.drawing.KeySignaturePainter;
import net.coderline.jsgs.tablature.drawing.MusicFont;
import net.coderline.jsgs.tablature.drawing.NotePainter;
import net.coderline.jsgs.tablature.TrackSpacingPositions;
import net.coderline.jsgs.tablature.ViewLayout;
import net.coderline.jsgs.Utf8;

class GsNoteImpl extends GsNote
{
	private var _noteOrientation:Rectangle;
	private var _accidental:Int;
	
	
	public var ScorePosY:Int;
	public var TabPosY:Int;


	public function GetPaintPosition(iIndex:TrackSpacingPositions) :Int
	{
		return MeasureImpl().Ts.Get(iIndex);
	}

	public function MeasureImpl() : GsMeasureImpl
	{
		return BeatImpl().MeasureImpl();
	}

	public function BeatImpl() : GsBeatImpl
	{
		return VoiceImpl().BeatImpl();
	}

	public function VoiceImpl() : GsVoiceImpl
	{
		return cast Voice;
	}

	public function PosX() : Int
	{
		return BeatImpl().PosX;
	}
	
	private function NoteForTie() :GsNoteImpl
	{
		var m:GsMeasureImpl = MeasureImpl();
		var nextIndex:Int;
		do
		{
			var i:Int = m.BeatCount() - 1;
			while(i >= 0)
			{
				var beat:GsBeat = m.Beats[i];
				var voice:GsVoice = beat.Voices[Voice.Index];
				if (beat.Start < BeatImpl().Start && !voice.IsRestVoice())
				{
					for (note in voice.Notes)
					{
						if (note.String == String)
						{
							return cast note;
						}
					}
				}
				i--;
			}
			nextIndex = m.Number() - 2;
			m = nextIndex >= 0 ? cast m.TrackImpl().Measures[nextIndex] : null;
		} while (m != null && m.Number() >= MeasureImpl().Number() - 3 && m.Ts == MeasureImpl().Ts);

		return null;
	}


	public function new(factory:GsSongFactory) 
	{
		super(factory);
		_noteOrientation = new Rectangle(0,0,0,0);
	}
	
	public function Update(layout:ViewLayout) : Void
	{
		_accidental = MeasureImpl().GetNoteAccidental(RealValue());
		TabPosY = Math.round((this.String * layout.StringSpacing) - layout.StringSpacing); 
		ScorePosY = VoiceImpl().BeatGroup.GetY1(layout, this, MeasureImpl().GetKeySignature(), GsMeasureClefConverter.ToInt(MeasureImpl().Clef));
	}

	public function Paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var spacing:Int = BeatImpl().Spacing();
		PaintScoreNote(layout, context, x, y + GetPaintPosition(TrackSpacingPositions.ScoreMiddleLines),
			spacing);
		PaintOfflineEffects(layout, context, x, y, spacing);
		PaintTablatureNote(layout, context, x, y + GetPaintPosition(TrackSpacingPositions.Tablature), spacing);
	}

	private function PaintOfflineEffects(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, spacing:Int)
	{
		var effect:GsNoteEffect = Effect;
		var realX:Int = cast (x + 3 * layout.Scale);


		var fill:DrawingLayer = Voice.Index == 0
					? context.Get(DrawingLayers.VoiceEffects1)
					: context.Get(DrawingLayers.VoiceEffects2);

		var draw:DrawingLayer = Voice.Index == 0
					? context.Get(DrawingLayers.VoiceEffectsDraw1)
					: context.Get(DrawingLayers.VoiceEffectsDraw2);

		if (effect.AccentuatedNote)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.AccentuatedEffect);
			PaintAccentuated(layout, context, realX, realY);
		}
		else if (effect.HeavyAccentuatedNote)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.AccentuatedEffect);
			PaintHeavyAccentuated(layout, context, realX, realY);
		}

		if (effect.FadeIn)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.FadeIn);
			PaintFadeIn(layout, context, realX, realY);
		}
		if (effect.IsHarmonic())
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.HarmonicEffect);
			var key:String = "";
			switch (effect.Harmonic.Type)
			{
				case GsHarmonicType.Natural:
					key = "N.H";
				case GsHarmonicType.Artificial:
					key = "A.H";
				case GsHarmonicType.Tapped:
					key = "T.H";
				case GsHarmonicType.Pinch:
					key = "P.H";
				case GsHarmonicType.Semi:
					key = "S.H";
			}
			fill.AddString(key, DrawingResources.DefaultFont, realX, realY);
		}
		if (effect.Tapping)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.TapingEffect);
			fill.AddString("T", DrawingResources.DefaultFont, realX, realY);
		}
		else if (effect.Slapping)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.TapingEffect);
			fill.AddString("S", DrawingResources.DefaultFont, realX, realY);
		}
		else if (effect.Popping)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.TapingEffect);
			fill.AddString("P", DrawingResources.DefaultFont, realX, realY);
		}

		if (effect.LetRing)
		{
			var beat:GsBeatImpl = BeatImpl().PreviousBeat;
			var prevRing:Bool = false;
			var nextRing:Bool = false;
			if (beat != null)
			{
				for (note in beat.GetNotes())
				{
					if (note.Effect.LetRing)
					{
						prevRing = true;
						break;
					}
				}
			}

			beat = BeatImpl().NextBeat;
			if (beat != null)
			{
				for (note in beat.GetNotes())
				{
					if (note.Effect.LetRing)
					{
						nextRing = true;
						break;
					}
				}
			}

			var realY = y + GetPaintPosition(TrackSpacingPositions.LetRingEffect);
			var height = DrawingResources.DefaultFontHeight;
			var endX = realX + BeatImpl().Width();
			if (!nextRing)
			{
				endX -= 6;
			}
			if (!prevRing)
			{
				fill.AddString("Ring", DrawingResources.DefaultFont, realX, realY);
			}
			else
			{
				draw.StartFigure();
				draw.AddLine(realX - 6, Math.round(realY + height / 2), endX, Math.round(realY + height / 2));
			}

			if (!nextRing && prevRing)
			{
				fill.AddString("|", DrawingResources.DefaultFont, endX, realY);
			}
		}
		if (effect.PalmMute)
		{
			var beat:GsBeatImpl = BeatImpl().PreviousBeat;
			var prevPM:Bool = false;
			var nextPM:Bool = false;
			if(beat != null)
			{
				for (note in beat.GetNotes())
				{
					if(note.Effect.PalmMute)
					{
						prevPM = true;
						break;
					}
				}
			}
			
			

			beat = BeatImpl().NextBeat;
			if(beat != null)
			{
				for (note in beat.GetNotes())
				{
					if(note.Effect.PalmMute)
					{
						nextPM = true;
						break;
					}
				}
			}

			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.PalmMuteEffect);
			var height:Int = DrawingResources.DefaultFontHeight;
			var endX:Int = Math.round(realX + BeatImpl().Width());
			if(!nextPM)
			{
				endX -= 6;
			}
			if(!prevPM)
			{
				fill.AddString("P.M", DrawingResources.DefaultFont, realX, realY);
			}
			else
			{
				draw.StartFigure();
				draw.AddLine(realX - 6, Math.round(realY), endX, Math.round(realY));
			}

			if(!nextPM && prevPM)
			{
				endX -= Math.floor(2 * layout.Scale);
				fill.AddString("|", DrawingResources.DefaultFont, endX, realY);
			}

		}

		if (effect.Vibrato)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.VibratoEffect);
			PaintVibrato(layout, context, realX, realY);
		}
		if (effect.IsTrill())
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.VibratoEffect);
			PaintTrill(layout, context, realX, realY);
		}
	}
	
	public function PaintTablatureNote(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, spacing:Int) : Void
	{
		var realX:Int = x + Math.round(3 * layout.Scale);
		var realY:Int = y + TabPosY;

		_noteOrientation.X = realX;
		_noteOrientation.Y = realY;
		_noteOrientation.Width = 0;
		_noteOrientation.Height = 0;

		var fill:DrawingLayer = Voice.Index == 0 ? context.Get(DrawingLayers.Voice1) : context.Get(DrawingLayers.Voice2);

		if (!IsTiedNote)
		{ // Note itself
			_noteOrientation = layout.GetNoteOrientation(realX, realY, this);

			var visualNote:String = Effect.DeadNote ? "X" : Std.string(Value);
			visualNote = Effect.GhostNote ? "(" + visualNote + ")" : visualNote;

			fill.AddString(visualNote, DrawingResources.NoteFont, _noteOrientation.X, _noteOrientation.Y);
		}
		// Effects
		PaintEffects(layout, context, x, y, spacing);
	}
	
	private function PaintScoreNote(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, spacing:Int) : Void
	{
		var scoreSpacing:Float = layout.ScoreLineSpacing;
		var direction:GsVoiceDirection = VoiceImpl().BeatGroup.Direction;
		var key:Int = MeasureImpl().GetKeySignature();
		var clef:Int = GsMeasureClefConverter.ToInt(MeasureImpl().Clef);

		var realX:Int = cast (x + 4 * layout.Scale);
		var realY1:Int = y + ScorePosY;
		var fill:DrawingLayer = Voice.Index == 0 ? context.Get(DrawingLayers.Voice1) : context.Get(DrawingLayers.Voice2);
		var effect:DrawingLayer = Voice.Index == 0 ? context.Get(DrawingLayers.VoiceEffects1) : context.Get(DrawingLayers.VoiceEffects2);

		if (IsTiedNote)
		{
			var noteForTie:GsNoteImpl = NoteForTie();
			var tieScale:Float = scoreSpacing / 8.0;
			var tieX:Float = realX - (20.0 * tieScale);
			var tieY:Float = realY1;
			var tieWidth:Float = 20.0 * tieScale;
			var tieHeight:Float = 30.0 * tieScale;

			if (noteForTie != null)
			{
				tieX = cast (noteForTie.BeatImpl().LastPaintX + 15 * layout.Scale);
				tieY = y + ScorePosY;
				tieWidth = (realX - tieX);
				tieHeight = (20.0 * tieScale);
			}


			if (tieWidth > 0 && tieHeight > 0)
			{
				var wScale:Float = tieWidth / 16;
				fill.AddMusicSymbol(MusicFont.HammerPullUp, cast tieX, cast realY1, layout.Scale); // TODO: Scale to width
			}
		}

		var accidentalX:Int = cast (x - 2 * layout.Scale);
		if (_accidental == GsMeasureImpl.Natural)
		{ 
			KeySignaturePainter.PaintSmallNatural(context, accidentalX, cast (realY1 + scoreSpacing / 2), layout);
		}
		else if (_accidental == GsMeasureImpl.Sharp)
		{
			KeySignaturePainter.PaintSmallSharp(context, accidentalX, cast (realY1 + scoreSpacing / 2), layout);
		}
		else if (_accidental == GsMeasureImpl.Flat)
		{
			KeySignaturePainter.PaintSmallFlat(context, accidentalX, cast (realY1 + scoreSpacing / 2), layout);
		}

		if (Effect.IsHarmonic())
		{
			var full:Bool = Voice.Duration.Value >= GsDuration.Quarter;
			var layer:DrawingLayer = full ? fill : effect;
			NotePainter.PaintHarmonic(layer, realX, realY1 + 1, layout.Scale);
		}
		else if (Effect.DeadNote)
		{
			NotePainter.PaintDeadNote(fill, realX, realY1, layout.Scale, DrawingResources.ClefFont);
		}
		else
		{
			var full:Bool = Voice.Duration.Value >= GsDuration.Quarter;
			NotePainter.PaintNote(fill, realX, realY1, layout.Scale, full, DrawingResources.ClefFont);
		}

		if (Effect.IsGrace())
		{
			PaintGrace(layout, context, realX, realY1);
		}

		if (Voice.Duration.IsDotted || Voice.Duration.IsDoubleDotted)
		{
			VoiceImpl().PaintDot(
				layout,
				fill,
				realX + (12.0 * (scoreSpacing / 8.0)),
				realY1 + (layout.ScoreLineSpacing / 2),
				scoreSpacing / 10.0);
		}

		var xMove:Int = direction == GsVoiceDirection.Up
						 ? DrawingResources.GetScoreNoteSize(layout, false).Width
						 : 0;
		var realY2:Int = y + VoiceImpl().BeatGroup.GetY2(layout, cast (PosX() + spacing), key, clef);

		// Stacatto
		if (Effect.Staccato)
		{
			var Size:Int = 3;
			var stringX:Int = realX + xMove;
			var stringY:Int = (realY2 + (4 * ((direction == GsVoiceDirection.Up) ? -1 : 1)));

			fill.AddEllipse(cast (stringX - (Size / 2)), cast (stringY - (Size / 2)), Size, Size);
		}
		// Tremolo Picking
		if (Effect.IsTremoloPicking())
		{
			var s:String = "";
			switch (Effect.TremoloPicking.Duration.Value)
			{
				case GsDuration.Eighth:
					s = direction == GsVoiceDirection.Up ?  MusicFont.TrillUpEigth : MusicFont.TrillDownEigth;
				case GsDuration.Sixteenth:
					s = direction == GsVoiceDirection.Up ? MusicFont.TrillUpSixteenth : MusicFont.TrillDownSixteenth;
				case GsDuration.ThirtySecond:
					s = direction == GsVoiceDirection.Up ? MusicFont.TrillUpThirtySecond : MusicFont.TrillDownThirtySecond;
			}
			if (s != "")
				fill.AddMusicSymbol(s, realX, realY1, layout.Scale);
		}
	}
	
	private function PaintEffects(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, spacing:Int) : Void
	{ 
		var scale:Float = layout.Scale;
		var realX:Int = x;
		var realY:Int= y + TabPosY;
		var effect:GsNoteEffect = Effect;

		var fill:DrawingLayer = Voice.Index == 0
								 ? context.Get(DrawingLayers.VoiceEffects1)
								 : context.Get(DrawingLayers.VoiceEffects2);

		if (effect.IsGrace())
		{
			var value:String = effect.Grace.IsDead ? "X" : Std.string(effect.Grace.Fret);
			fill.AddString(value, DrawingResources.GraceFont, Math.round(_noteOrientation.X - 7 * scale), _noteOrientation.Y);
		}
		if (effect.IsBend())
		{
			var nextBeat:GsBeatImpl = cast layout.SongManager().GetNextBeat(BeatImpl(), Voice.Index);
			// only use beat for bend if it's in the same line
			if (nextBeat != null && nextBeat.MeasureImpl().Ts != MeasureImpl().Ts)
				nextBeat = null;
			PaintBend(layout, context, nextBeat, _noteOrientation.X + _noteOrientation.Width, realY);
		}
		else if (effect.IsTremoloBar())
		{
			var nextBeat:GsBeatImpl = cast layout.SongManager().GetNextBeat(BeatImpl(), Voice.Index);
			// only use beat for bend if it's in the same line
			if (nextBeat != null && nextBeat.MeasureImpl().Ts != MeasureImpl().Ts)
				nextBeat = null;
			PaintTremoloBar(layout, context, nextBeat, _noteOrientation.X, realY);
		}
		else if (effect.Slide || effect.Hammer)
		{
			var nextFromX:Int = x;
			var nextNote:GsNoteImpl = cast layout.SongManager().GetNextNote(MeasureImpl(), BeatImpl().Start, Voice.Index, this.String);
			if (effect.Slide)
			{
				PaintSlide(layout, context, nextNote, realX, realY, nextFromX);
			}
			else if (effect.Hammer)
			{
				PaintHammer(layout, context, nextNote, realX, realY, nextFromX);
			}
		}
	}
	
	private function PaintBend(layout:ViewLayout, context:DrawingContext, nextBeat:GsBeatImpl, fromX:Int, fromY:Int) : Void
	{
		var scale:Float = layout.Scale;
		var iX:Float = fromX;
		var iY:Float = fromY - (2.0 * scale);

		var iXTo:Float;
		var iMinY:Float = iY - 60 * scale;
		if (nextBeat == null)
		{// No Next beat -> Till End of Own beat
			iXTo = BeatImpl().MeasureImpl().PosX + BeatImpl().MeasureImpl().Width + BeatImpl().MeasureImpl().Spacing;
		}
		else
		{
			if (nextBeat.GetNotes().length > 0)
			{
				iXTo = nextBeat.MeasureImpl().PosX + nextBeat.MeasureImpl().HeaderImpl().GetLeftSpacing(layout)
					+ nextBeat.PosX + (nextBeat.Spacing() * scale) + 5 * scale;
			}
			else
			{
				iXTo = nextBeat.MeasureImpl().PosX + nextBeat.PosX + nextBeat.Spacing() + 5 * scale;
			}
		}

		var fill:DrawingLayer = Voice.Index == 0
					 ? context.Get(DrawingLayers.VoiceEffects1)
					 : context.Get(DrawingLayers.VoiceEffects2);

		var draw:DrawingLayer = Voice.Index == 0
					 ? context.Get(DrawingLayers.VoiceEffectsDraw1)
					 : context.Get(DrawingLayers.VoiceEffectsDraw2);



		if (Effect.Bend.Points.length >= 2)
		{
			var dX:Float = (iXTo - iX) / GsBendEffect.MaxPositionLength;
			var dY:Float = (iY - iMinY) / GsBendEffect.MaxValueLength;

			draw.StartFigure();
			for (i in 0 ... Effect.Bend.Points.length - 1)
			{
				var firstPt:GsBendPoint = Effect.Bend.Points[i];
				var secondPt:GsBendPoint = Effect.Bend.Points[i + 1];

				if (firstPt.Value == secondPt.Value && i == Effect.Bend.Points.length - 2) continue;

				var arrow:Bool = (firstPt.Value != secondPt.Value);
				var firstLoc:Point = new Point(cast (iX + (dX * firstPt.Position)), cast (iY - dY * firstPt.Value));
				var secondLoc:Point = new Point(cast (iX + (dX * secondPt.Position)), cast (iY - dY * secondPt.Value));
				var firstHelper:Point = new Point(firstLoc.X + ((secondLoc.X - firstLoc.X)), cast (iY - dY * firstPt.Value));
				draw.AddBezier(firstLoc.X, firstLoc.Y, firstHelper.X, firstHelper.Y, secondLoc.X, secondLoc.Y, secondLoc.X, secondLoc.Y);


				if (secondPt.Value != 0)
				{
					var dV:Float = (secondPt.Value - firstPt.Value) * 0.25; // dv * 1/4  
					var up:Bool = dV >= 0;
					dV = Math.abs(dV);
					var s:String = "";
					// Full Steps 
					if (dV == 1)
						s = "full";
					else if (dV > 1)
					{
						s += Std.string(dV) + " ";
						// Quaters
						dV -= Math.floor(dV);
					}

					if (dV == 0.25)
						s += "1/4";
					else if (dV == 0.5)
						s += "1/2";
					else if (dV == 0.75)
						s += "3/4";


					context.Graphics.font = DrawingResources.DefaultFont;
					var size:Dynamic = context.Graphics.measureText(s);
					var y:Float = up ? secondLoc.Y - DrawingResources.DefaultFontHeight - (3 * scale) : secondLoc.Y + (3 * scale);
					var x:Float = secondLoc.X - size.width / 2;

					fill.AddString(s, DrawingResources.DefaultFont, cast x, cast y);
				}
			}
		}
	}

	private function PaintTremoloBar(layout:ViewLayout, context:DrawingContext, nextBeat:GsBeatImpl,x:Int, y:Int)
	{
		var scale:Float = layout.Scale;
		var realX:Float = x + (10 * scale);
		var realY:Float = y - (2.0 * scale);

		var xTo:Float;
		var minY:Float = realY - 60 * scale;
		if (nextBeat == null)
		{// No Next beat -> Till End of Own beat
			xTo = BeatImpl().MeasureImpl().PosX + BeatImpl().MeasureImpl().Width + BeatImpl().MeasureImpl().Spacing;
		}
		else
		{
			xTo = nextBeat.MeasureImpl().PosX + nextBeat.MeasureImpl().HeaderImpl().GetLeftSpacing(layout)
				  + nextBeat.PosX + (nextBeat.Spacing() * scale) + 5 * scale;
		}

		var fill:DrawingLayer = Voice.Index == 0
		 ? context.Get(DrawingLayers.VoiceEffects1)
		 : context.Get(DrawingLayers.VoiceEffects2);

		var draw:DrawingLayer = Voice.Index == 0
					 ? context.Get(DrawingLayers.VoiceEffectsDraw1)
					 : context.Get(DrawingLayers.VoiceEffectsDraw2);



		if (Effect.TremoloBar.Points.length >= 2)
		{
			var dX:Float = (xTo - realX) / GsTremoloBarEffect.MaxPositionLength;
			var dY:Float = (realY - minY) / GsTremoloBarEffect.MaxValueLength;

			draw.StartFigure();
			for (i in 0 ... Effect.TremoloBar.Points.length - 1)
			{
				var firstPt:GsTremoloBarPoint = Effect.TremoloBar.Points[i];
				var secondPt:GsTremoloBarPoint = Effect.TremoloBar.Points[i + 1];

				if (firstPt.Value == secondPt.Value && i == Effect.TremoloBar.Points.length - 2) continue;


				//pen.DashStyle = firstPt.Value != secondPt.Value ? DashStyle.Solid : DashStyle.Dash;
				var firstLoc:Point = new Point(Math.floor(realX + (dX * firstPt.Position)), Math.floor(realY - dY * firstPt.Value));
				var secondLoc:Point = new Point(Math.floor(realX + (dX * secondPt.Position)), Math.floor(realY - dY * secondPt.Value));
				draw.AddLine(firstLoc.X, firstLoc.Y, secondLoc.X, secondLoc.Y);


				if (secondPt.Value != 0)
				{
					var dV:Float = (secondPt.Value) * 0.5;
					var up:Bool = (secondPt.Value - firstPt.Value) >= 0;
					var s:String = "";
					s += Std.string(Math.floor(dV)) + " ";
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

	private function PaintSlide(layout:ViewLayout, context:DrawingContext, nextNote:GsNoteImpl, x:Int, y:Int, nextX:Int) : Void
	{
		var xScale:Float = layout.Scale;
		var yScale:Float = layout.StringSpacing / 10.0;
		var yMove:Float = 3.0 * yScale;
		var realX:Float = x;
		var realY:Float = y;
		var rextY:Float = realY;

		var draw:DrawingLayer = Voice.Index == 0
								? context.Get(DrawingLayers.VoiceEffectsDraw1)
								: context.Get(DrawingLayers.VoiceEffectsDraw2);
		draw.StartFigure();

		if (Effect.SlideType == GsSlideType.IntoFromBelow)
		{
			realY += yMove;
			rextY -= yMove;
			draw.AddLine(realX - (5 * xScale), realY, realX + (3 * xScale), rextY);
		}
		else if (Effect.SlideType == GsSlideType.IntoFromAbove)
		{
			realY -= yMove;
			rextY += yMove;
			draw.AddLine(realX - (5 * xScale), realY, realX + (3 * xScale), rextY);
		}
		else if (Effect.SlideType == GsSlideType.OutDownWards)
		{
			realY -= yMove;
			rextY += yMove;
			draw.AddLine(realX + (10 * xScale), realY, realX + (18 * xScale), rextY);
		}
		else if (Effect.SlideType == GsSlideType.OutUpWards)
		{
			realY += yMove;
			rextY -= yMove;
			draw.AddLine(realX + (10 * xScale), realY, realX + (18 * xScale), rextY);
		}
		else if (nextNote != null)
		{
			var fNextX:Float = nextNote.BeatImpl().GetRealPosX(layout);
			
			rextY = realY;
			if (nextNote.Value < Value)
			{
				realY -= yMove;
				rextY += yMove;
			}
			else if (nextNote.Value > Value)
			{
				realY += yMove;
				rextY -= yMove;
			}
			else
			{
				realY -= yMove;
				rextY -= yMove;
			}

			draw.AddLine(realX + (13 * xScale), realY, fNextX, rextY);

			if (Effect.SlideType == GsSlideType.SlowSlideTo)
			{
				PaintHammer(layout, context, nextNote, x, y, nextX);
			}
		}
		else
		{
			draw.AddLine(realX + (13 * xScale), realY - yMove, realX + (19 * xScale), realY - yMove);
		}
	}

	private function PaintHammer(layout:ViewLayout, context:DrawingContext, nextNote:GsNoteImpl, x:Int, y:Int, nextX:Int) : Void
	{
		var xScale:Float = layout.Scale;
		var yScale:Float = layout.StringSpacing / 10.0;

		var realX :Float= x + (15.0 * xScale);
		var realY:Float = y - (5.0 * yScale);

		var width:Float = nextNote != null
						   ? nextNote.BeatImpl().GetRealPosX(layout) - 2*xScale -  realX
						   : 10.0 * xScale;
		var fill:DrawingLayer = Voice.Index == 0
					? context.Get(DrawingLayers.VoiceEffects1)
					: context.Get(DrawingLayers.VoiceEffects2);

		var wScale:Float = width / 16;
		var hScale:Float = this.String <= 3 ? 1 : -1;
		if (this.String > 3)
			realY += 15 * xScale;
			
		fill.AddMusicSymbol(MusicFont.HammerPullUp, cast realX, cast realY, layout.Scale * wScale, layout.Scale * hScale);
	}

	private function PaintGrace(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var scale:Float = layout.ScoreLineSpacing / 2.25;
		var realX:Float = x - (2 * scale);
		var realY:Float = y + (scale / 3);
		var fill:DrawingLayer = Voice.Index == 0 ? context.Get(DrawingLayers.VoiceEffects1) : context.Get(DrawingLayers.VoiceEffects2);

		var s:String = Effect.DeadNote ? MusicFont.GraceDeadNote : MusicFont.GraceNote;
		fill.AddMusicSymbol(s, cast (realX - scale * 1.33), cast realY, layout.Scale);
	}

	private function PaintVibrato(layout:ViewLayout, context:DrawingContext, x:Int, y:Int)
	{
		var scale:Float = layout.Scale;
		var realX:Float = x - 2 * scale;
		var realY:Float = y + (2.0 * scale);
		var width:Float = VoiceImpl().Width;

		var fill:DrawingLayer = Voice.Index == 0 ? context.Get(DrawingLayers.VoiceEffects1) : context.Get(DrawingLayers.VoiceEffects2);
		
		var step:Float = 18 * scale;
		var loops:Int = Math.round(Math.max(1, (width / step)));
		var s:String = "";
		for (i in 0 ... loops)
		{
			fill.AddMusicSymbol(MusicFont.VibratoLeftRight, cast realX, cast realY, layout.Scale);
			realX += step;
		}
	}

	private function PaintTrill(layout:ViewLayout, context:DrawingContext, x:Int, y:Int)
	{
		var str:String = "Tr";
		context.Graphics.font = DrawingResources.GraceFont;
		var size:Dynamic = context.Graphics.measureText(str);
		var scale:Float = layout.Scale;
		var realX:Float = x + size.width - 2 * scale;
		var realY:Float = y + (DrawingResources.GraceFontHeight - (5.0 * scale)) / 2.0;
		var width:Float = VoiceImpl().Width - size.Width - (2.0 * scale);

		var fill:DrawingLayer = Voice.Index == 0 ? context.Get(DrawingLayers.VoiceEffects1) : context.Get(DrawingLayers.VoiceEffects2);
		fill.AddString(str, DrawingResources.GraceFont, x, y);
	}

	private function PaintFadeIn(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var scale:Float = layout.Scale;
		var realX:Int = x;
		var realY:Int = Math.round(y + (4.0 * scale));
		var fWidth:Int = Math.round(VoiceImpl().Width);
		var layer:DrawingLayer = Voice.Index == 0
					 ? context.Get(DrawingLayers.VoiceDraw1)
					 : context.Get(DrawingLayers.VoiceDraw2);

		layer.StartFigure();
		layer.AddBezier(realX, realY, realX, realY, realX + fWidth, realY, realX + fWidth, Math.round(realY - (4 * scale)));
		layer.StartFigure();
		layer.AddBezier(realX, realY, realX, realY, realX + fWidth, realY, realX + fWidth, Math.round(realY + (4 * scale)));
	}

	private function PaintAccentuated(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var realX:Float = x;
		var realY:Float = y;
		var layer:DrawingLayer = Voice.Index == 0
								 ? context.Get(DrawingLayers.Voice1)
								 : context.Get(DrawingLayers.Voice2);

		layer.AddMusicSymbol(MusicFont.AccentuatedNote, cast realX, cast realY, layout.Scale);
	}

	private function PaintHeavyAccentuated(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var realX:Float = x;
		var realY:Float = y;
		var layer:DrawingLayer = Voice.Index == 0
					 ? context.Get(DrawingLayers.Voice1)
					 : context.Get(DrawingLayers.Voice2);

		layer.AddMusicSymbol(MusicFont.HeavyAccentuatedNote, cast realX, cast realY, layout.Scale);
	}

	public function CalculateBendOverflow(layout:ViewLayout) : Int
	{
		// Find Highest bend
		var point:GsBendPoint = null;
		for (curr in Effect.Bend.Points)
		{
			if (point == null || point.Value < curr.Value)
				point = curr;
		}

		if (point == null) return 0;

		// 5px*scale movement per value 
		var fullHeight:Float = point.Value * (6 * layout.Scale);
		var heightToTabNote:Float = (String - 1) * layout.StringSpacing;

		return Math.round(fullHeight - heightToTabNote);
	}

}