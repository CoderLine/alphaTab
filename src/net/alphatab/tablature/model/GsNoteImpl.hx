/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.model;
import haxe.io.StringInput;
import net.alphatab.model.effects.GsBendEffect;
import net.alphatab.model.effects.GsBendPoint;
import net.alphatab.model.effects.GsGraceEffectTransition;
import net.alphatab.model.effects.GsHarmonicType;
import net.alphatab.model.effects.GsTremoloBarEffect;
import net.alphatab.model.effects.GsTremoloBarPoint;
import net.alphatab.model.GsBeat;
import net.alphatab.model.GsDuration;
import net.alphatab.model.GsMeasureClefConverter;
import net.alphatab.model.GsNote;
import net.alphatab.model.GsNoteEffect;
import net.alphatab.model.GsSlideType;
import net.alphatab.model.GsSongFactory;
import net.alphatab.model.GsVoice;
import net.alphatab.model.GsVoiceDirection;
import net.alphatab.model.Point;
import net.alphatab.model.Rectangle;
import net.alphatab.model.Size;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayer;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.drawing.KeySignaturePainter;
import net.alphatab.tablature.drawing.MusicFont;
import net.alphatab.tablature.drawing.NotePainter;
import net.alphatab.tablature.TrackSpacingPositions;
import net.alphatab.tablature.ViewLayout;
import net.alphatab.Utf8;
import net.alphatab.Utils;

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

	public inline function BeatImpl() : GsBeatImpl
	{
		return VoiceImpl().BeatImpl();
	}

	public inline function VoiceImpl() : GsVoiceImpl
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
			var isPreviousFirst = false;
			
			if (beat != null)
			{
				for (note in beat.GetNotes())
				{
					var impl:GsNoteImpl = cast note;
					if (note.Effect.LetRing && impl.BeatImpl().MeasureImpl().Ts == BeatImpl().MeasureImpl().Ts)
					{
						prevRing = true;
						break;
					}
				}
			}

			beat = BeatImpl().NextBeat;
			var endX:Float = realX + BeatImpl().Width();
			var nextOnSameLine = false;
			if (beat != null)
			{
				for (note in beat.GetNotes())
				{
					var impl:GsNoteImpl = cast note;
					if (note.Effect.LetRing)
					{
						nextRing = true;
						if (impl.BeatImpl().MeasureImpl().Ts == BeatImpl().MeasureImpl().Ts)
						{
							endX = beat.GetRealPosX(layout);
						}
						break;
					}
				}
			}

			var realY = y + GetPaintPosition(TrackSpacingPositions.LetRingEffect);
			var height = DrawingResources.DefaultFontHeight;
			var startX:Float = realX;
			
			if (!nextRing)
			{
				endX -= BeatImpl().Width() / 2;
				
			}
			if (!prevRing)
			{
				fill.AddString("ring", DrawingResources.EffectFont, startX, realY);
				context.Graphics.font = DrawingResources.EffectFont;
				startX += context.Graphics.measureText("ring").width + (6*layout.Scale);
			}
			else
			{
				startX -= 6 * layout.Scale;
			}

			if (prevRing || nextRing)
			{
				draw.StartFigure();
				draw.AddLine(startX, Math.round(realY), endX, Math.round(realY));
			}


			if (!nextRing && prevRing)
			{
				var size:Float = 8 * layout.Scale;
				draw.AddLine(endX, realY - (size/2), endX, realY + (size/2));
			}
		}
		if (effect.PalmMute)
		{
			var beat:GsBeatImpl = BeatImpl().PreviousBeat;
			var prevPalm:Bool = false;
			var nextPalm:Bool = false;
			
			if (beat != null)
			{
				for (note in beat.GetNotes())
				{
					var impl:GsNoteImpl = cast note;
					if (note.Effect.PalmMute && impl.BeatImpl().MeasureImpl().Ts == BeatImpl().MeasureImpl().Ts)
					{
						prevPalm = true;
						break;
					}
				}
			}

			beat = BeatImpl().NextBeat;
			var endX:Float = realX + BeatImpl().Width();
			if (beat != null)
			{
				for (note in beat.GetNotes())
				{
					var impl:GsNoteImpl = cast note;
					if (note.Effect.PalmMute)
					{
						nextPalm = true;
						if (impl.BeatImpl().MeasureImpl().Ts == BeatImpl().MeasureImpl().Ts)
						{
							endX = beat.GetRealPosX(layout);
						}
						break;
					}
				}
			}

			var realY = y + GetPaintPosition(TrackSpacingPositions.PalmMuteEffect);
			var height = DrawingResources.DefaultFontHeight;
			var startX:Float = realX;
			if (!nextPalm)
			{
				endX -= 6*layout.Scale;
			}
			if (!prevPalm)
			{
				fill.AddString("P.M.", DrawingResources.EffectFont, startX, realY);
				context.Graphics.font = DrawingResources.EffectFont;
				startX += context.Graphics.measureText("P.M.").width + (6*layout.Scale);
			}
			else
			{
				startX -= 6 * layout.Scale;
			}
			draw.StartFigure();
			draw.AddLine(startX, Math.round(realY), endX, Math.round(realY));


			if (!nextPalm && prevPalm)
			{
				var size:Float = 8 * layout.Scale;
				draw.AddLine(endX, realY - (size/2), endX, realY + (size/2));
			}
		}

		if (effect.BeatVibrato)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.BeatVibratoEffect);
			PaintVibrato(layout, context, realX, realY, 1);
		}
		if (effect.Vibrato)
		{
			var realY:Int = y + GetPaintPosition(TrackSpacingPositions.VibratoEffect);
			PaintVibrato(layout, context, realX, realY, 0.75);
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

			var visualNote:String = Effect.DeadNote ? "X" : Utils.string(Value);
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
			KeySignaturePainter.PaintSmallNatural(fill, accidentalX, cast (realY1 + scoreSpacing / 2), layout);
		}
		else if (_accidental == GsMeasureImpl.Sharp)
		{
			KeySignaturePainter.PaintSmallSharp(fill, accidentalX, cast (realY1 + scoreSpacing / 2), layout);
		}
		else if (_accidental == GsMeasureImpl.Flat)
		{
			KeySignaturePainter.PaintSmallFlat(fill, accidentalX, cast (realY1 + scoreSpacing / 2), layout);
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
			var value:String = effect.Grace.IsDead ? "X" : Utils.string(effect.Grace.Fret);
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
				PaintHammer(layout, context, nextNote, realX, realY);
			}
		}
		
		if (effect.Vibrato)
		{
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

				var arrowSize:Float = 4 * scale;
				if (secondPt.Value > firstPt.Value)
				{
					draw.AddLine(secondLoc.X - 0.5, secondLoc.Y, secondLoc.X - arrowSize - 0.5, secondLoc.Y + arrowSize); 
					draw.AddLine(secondLoc.X - 0.5, secondLoc.Y, secondLoc.X + arrowSize - 0.5, secondLoc.Y + arrowSize); 
				}
				else if (secondPt.Value != firstPt.Value)
				{
					draw.AddLine(secondLoc.X - 0.5, secondLoc.Y, secondLoc.X - arrowSize - 0.5, secondLoc.Y - arrowSize); 
					draw.AddLine(secondLoc.X - 0.5, secondLoc.Y, secondLoc.X + arrowSize - 0.5, secondLoc.Y - arrowSize); 
				}
				
				
				if (secondPt.Value != 0)
				{
					var dV:Float = (secondPt.Value - firstPt.Value) * 0.25; // dv * 1/4 
					var up:Bool = dV > 0;
					dV = Math.abs(dV);
					var s:String = "";
					// Full Steps 
					if (dV == 1)
						s = "full";
					else if (dV > 1)
					{
						s += Utils.string(Math.floor(dV)) + " ";
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
					var y:Float = up ? secondLoc.Y - DrawingResources.DefaultFontHeight + (2 * scale) : secondLoc.Y - (2 * scale);
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
					s += Utils.string(Math.floor(dV)) + " ";
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
				PaintHammer(layout, context, nextNote, x, y);
			}
		}
		else
		{
			draw.AddLine(realX + (13 * xScale), realY - yMove, realX + (19 * xScale), realY - yMove);
		}
	}

	private function PaintHammer(layout:ViewLayout, context:DrawingContext, nextNote:GsNoteImpl, x:Float, y:Float, forceDown:Bool = false) : Void
	{
		var xScale:Float = layout.Scale;
		var yScale:Float = layout.StringSpacing / 10.0;

		var realX :Float= x + (7.0 * xScale);
		var realY:Float = y - (DrawingResources.NoteFontHeight * layout.Scale);

		var width:Float = nextNote != null
						   ? nextNote.BeatImpl().GetRealPosX(layout) - 4 * xScale -  realX
						   : 10.0 * xScale;
		var fill:DrawingLayer = Voice.Index == 0
					? context.Get(DrawingLayers.VoiceEffects1)
					: context.Get(DrawingLayers.VoiceEffects2);

		var wScale:Float = width / 16;
		var hScale:Float = (this.String > 3 || forceDown) ? -1 : 1;
		if (this.String > 3 || forceDown)
			realY += (DrawingResources.NoteFontHeight * layout.Scale) * 2;
			
		fill.AddMusicSymbol(MusicFont.HammerPullUp, cast realX, cast realY, layout.Scale * wScale, layout.Scale * hScale);
	}

	private function PaintGrace(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var scale:Float = layout.ScoreLineSpacing / 2.25;
		var realX:Float = x - (2 * scale);
		var realY:Float = y - (9*layout.Scale);
		var fill:DrawingLayer = Voice.Index == 0 ? context.Get(DrawingLayers.VoiceEffects1) : context.Get(DrawingLayers.VoiceEffects2);

		var s:String = Effect.DeadNote ? MusicFont.GraceDeadNote : MusicFont.GraceNote;
		fill.AddMusicSymbol(s, cast (realX - scale * 1.33), cast realY, layout.Scale);
		if (Effect.Grace.Transition == GsGraceEffectTransition.Hammer || Effect.Grace.Transition == GsGraceEffectTransition.Slide)
		{
			PaintHammer(layout, context, null, x - (15*layout.Scale), y + (5*layout.Scale), true);
		}
	}

	private function PaintVibrato(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, symbolScale:Float)
	{
		var scale:Float = layout.Scale;
		var realX:Float = x - 2 * scale;
		var realY:Float = y + (2.0 * scale);
		var width:Float = VoiceImpl().Width;

		var fill:DrawingLayer = Voice.Index == 0 ? context.Get(DrawingLayers.VoiceEffects1) : context.Get(DrawingLayers.VoiceEffects2);
		
		var step:Float = 18 * scale * symbolScale;
		var loops:Int = Math.floor(Math.max(1, (width / step)));
		var s:String = "";
		for (i in 0 ... loops)
		{
			fill.AddMusicSymbol(MusicFont.VibratoLeftRight, realX, realY, layout.Scale * symbolScale);
			realX += step;
		}
	}

	private function PaintTrill(layout:ViewLayout, context:DrawingContext, x:Int, y:Int)
	{
		var str:String = "Tr";
		context.Graphics.font = DrawingResources.EffectFont;
		var size:Dynamic = context.Graphics.measureText(str);
		var scale:Float = layout.Scale;
		var realX:Float = x + size.width - 2 * scale;
		var realY:Float = y + (DrawingResources.EffectFontHeight - (5.0 * scale)) / 2.0;
		var width:Float = VoiceImpl().Width - size.Width - (2.0 * scale);

		var fill:DrawingLayer = Voice.Index == 0 ? context.Get(DrawingLayers.VoiceEffects1) : context.Get(DrawingLayers.VoiceEffects2);
		fill.AddString(str, DrawingResources.EffectFont, x, y);
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