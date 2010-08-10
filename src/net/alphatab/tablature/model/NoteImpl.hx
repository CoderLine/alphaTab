package net.alphatab.tablature.model;
import haxe.io.StringInput;
import net.alphatab.model.effects.BendEffect;
import net.alphatab.model.effects.BendPoint;
import net.alphatab.model.effects.GraceEffectTransition;
import net.alphatab.model.effects.HarmonicType;
import net.alphatab.model.effects.TremoloBarEffect;
import net.alphatab.model.Beat;
import net.alphatab.model.Duration;
import net.alphatab.model.MeasureClefConverter;
import net.alphatab.model.Note;
import net.alphatab.model.NoteEffect;
import net.alphatab.model.SlideType;
import net.alphatab.model.SongFactory;
import net.alphatab.model.Voice;
import net.alphatab.model.VoiceDirection;
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

/**
 * This note implementation extends the default note with drawing and layouting features. 
 */
class NoteImpl extends Note
{
	private var _noteOrientation:Rectangle;
	private var _accidental:Int;
	
	public var scorePosY:Int;
	public var tabPosY:Int;


	public function getpaintPosition(index:TrackSpacingPositions) :Int
	{
		return measureImpl().ts.get(index);
	}

	public function measureImpl() : MeasureImpl
	{
		return beatImpl().measureImpl();
	}

	public inline function beatImpl() : BeatImpl
	{
		return voiceImpl().beatImpl();
	}

	public inline function voiceImpl() : VoiceImpl
	{
		return cast voice;
	}

	public function posX() : Int
	{
		return beatImpl().posX;
	}
	
	private function noteForTie() : NoteImpl
	{
		var m:MeasureImpl = measureImpl();
		var nextIndex:Int;
		do
		{
			var i:Int = m.beatCount() - 1;
			while(i >= 0)
			{
				var beat:Beat = m.beats[i];
				var voice:Voice = beat.voices[voice.index];
				if (beat.start < beatImpl().start && !voice.isRestVoice())
				{
					for (note in voice.notes)
					{
						if (note.string == string)
						{
							return cast note;
						}
					}
				}
				i--;
			}
			nextIndex = m.number() - 2;
			m = nextIndex >= 0 ? cast m.trackImpl().measures[nextIndex] : null;
		} while (m != null && m.number() >= measureImpl().number() - 3 && m.ts == measureImpl().ts);

		return null;
	}


	public function new(factory:SongFactory) 
	{
		super(factory);
		_noteOrientation = new Rectangle(0,0,0,0);
	}
	
	public function update(layout:ViewLayout) : Void
	{
		_accidental = measureImpl().getNoteAccidental(realValue());
		tabPosY = Math.round((this.string * layout.stringSpacing) - layout.stringSpacing); 
		scorePosY = voiceImpl().beatGroup.getY1(layout, this, measureImpl().keySignature(), MeasureClefConverter.toInt(measureImpl().clef));
	}

	public function paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var spacing:Int = beatImpl().spacing();
		paintScoreNote(layout, context, x, y + getpaintPosition(TrackSpacingPositions.ScoreMiddleLines),
			spacing);
		paintOfflineEffects(layout, context, x, y, spacing);
		paintTablatureNote(layout, context, x, y + getpaintPosition(TrackSpacingPositions.Tablature), spacing);
	}

	private function paintOfflineEffects(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, spacing:Int)
	{
		var effect:NoteEffect = effect;
		var realX:Int = cast (x + 3 * layout.scale);


		var fill:DrawingLayer = voice.index == 0
					? context.get(DrawingLayers.VoiceEffects1)
					: context.get(DrawingLayers.VoiceEffects2);

		var draw:DrawingLayer = voice.index == 0
					? context.get(DrawingLayers.VoiceEffectsDraw1)
					: context.get(DrawingLayers.VoiceEffectsDraw2);

		if (effect.accentuatedNote)
		{
			var realY:Int = y + getpaintPosition(TrackSpacingPositions.AccentuatedEffect);
			paintAccentuated(layout, context, realX, realY);
		}
		else if (effect.heavyAccentuatedNote)
		{
			var realY:Int = y + getpaintPosition(TrackSpacingPositions.AccentuatedEffect);
			paintHeavyAccentuated(layout, context, realX, realY);
		}

		if (effect.isHarmonic())
		{
			var realY:Int = y + getpaintPosition(TrackSpacingPositions.HarmonicEffect);
			var key:String = "";
			switch (effect.harmonic.type)
			{
				case HarmonicType.Natural:
					key = "N.H";
				case HarmonicType.Artificial:
					key = "A.H";
				case HarmonicType.Tapped:
					key = "T.H";
				case HarmonicType.Pinch:
					key = "P.H";
				case HarmonicType.Semi:
					key = "S.H";
			}
			fill.addString(key, DrawingResources.defaultFont, realX, realY);
		}

		if (effect.letRing)
		{
			var beat:BeatImpl = beatImpl().previousBeat;
			var prevRing:Bool = false;
			var nextRing:Bool = false;
			var isPreviousFirst = false;
			
			if (beat != null)
			{
				for (note in beat.getNotes())
				{
					var impl:NoteImpl = cast note;
					if (note.effect.letRing && impl.beatImpl().measureImpl().ts == beatImpl().measureImpl().ts)
					{
						prevRing = true;
						break;
					}
				}
			}

			beat = beatImpl().nextBeat;
			var endX:Float = realX + beatImpl().width();
			var nextOnSameLine = false;
			if (beat != null)
			{
				for (note in beat.getNotes())
				{
					var impl:NoteImpl = cast note;
					if (note.effect.letRing)
					{
						nextRing = true;
						if (impl.beatImpl().measureImpl().ts == beatImpl().measureImpl().ts)
						{
							endX = beat.getRealPosX(layout);
						}
						break;
					}
				}
			}

			var realY = y + getpaintPosition(TrackSpacingPositions.LetRingEffect);
			var height = DrawingResources.defaultFontHeight;
			var startX:Float = realX;
			
			if (!nextRing)
			{
				endX -= beatImpl().width() / 2;
				
			}
			if (!prevRing)
			{
				fill.addString("ring", DrawingResources.effectFont, startX, realY);
				context.graphics.font = DrawingResources.effectFont;
				startX += context.graphics.measureText("ring") + (6*layout.scale);
			}
			else
			{
				startX -= 6 * layout.scale;
			}

			if (prevRing || nextRing)
			{
				draw.startFigure();
				draw.addLine(startX, Math.round(realY), endX, Math.round(realY));
			}


			if (!nextRing && prevRing)
			{
				var size:Float = 8 * layout.scale;
				draw.addLine(endX, realY - (size/2), endX, realY + (size/2));
			}
		}
		if (effect.palmMute)
		{
			var beat:BeatImpl = beatImpl().previousBeat;
			var prevPalm:Bool = false;
			var nextPalm:Bool = false;
			
			if (beat != null)
			{
				for (note in beat.getNotes())
				{
					var impl:NoteImpl = cast note;
					if (note.effect.palmMute && impl.beatImpl().measureImpl().ts == beatImpl().measureImpl().ts)
					{
						prevPalm = true;
						break;
					}
				}
			}

			beat = beatImpl().nextBeat;
			var endX:Float = realX + beatImpl().width();
			if (beat != null)
			{
				for (note in beat.getNotes())
				{
					var impl:NoteImpl = cast note;
					if (note.effect.palmMute)
					{
						nextPalm = true;
						if (impl.beatImpl().measureImpl().ts == beatImpl().measureImpl().ts)
						{
							endX = beat.getRealPosX(layout);
						}
						break;
					}
				}
			}

			var realY = y + getpaintPosition(TrackSpacingPositions.PalmMuteEffect);
			var height = DrawingResources.defaultFontHeight;
			var startX:Float = realX;
			if (!nextPalm)
			{
				endX -= 6*layout.scale;
			}
			if (!prevPalm)
			{
				fill.addString("P.M.", DrawingResources.effectFont, startX, realY);
				context.graphics.font = DrawingResources.effectFont;
				startX += context.graphics.measureText("P.M.") + (6*layout.scale);
			}
			else
			{
				startX -= 6 * layout.scale;
			}
			draw.startFigure();
			draw.addLine(startX, Math.round(realY), endX, Math.round(realY));


			if (!nextPalm && prevPalm)
			{
				var size:Float = 8 * layout.scale;
				draw.addLine(endX, realY - (size/2), endX, realY + (size/2));
			}
		}

		
		if (effect.vibrato)
		{
			var realY:Int = y + getpaintPosition(TrackSpacingPositions.VibratoEffect);
			paintVibrato(layout, context, realX, realY, 0.75);
		}
		if (effect.isTrill())
		{
			var realY:Int = y + getpaintPosition(TrackSpacingPositions.VibratoEffect);
			paintTrill(layout, context, realX, realY);
		}
	}
	
	public function paintTablatureNote(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, spacing:Int) : Void
	{
		var realX:Int = x + Math.round(3 * layout.scale);
		var realY:Int = y + tabPosY;

		_noteOrientation.x = realX;
		_noteOrientation.y = realY;
		_noteOrientation.width = 0;
		_noteOrientation.height = 0;

		var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);

		if (!isTiedNote)
		{ // Note itself
			_noteOrientation = layout.getNoteOrientation(realX, realY, this);

			var visualNote:String = effect.deadNote ? "X" : Std.string(value);
			visualNote = effect.ghostNote ? "(" + visualNote + ")" : visualNote;

			fill.addString(visualNote, DrawingResources.noteFont, _noteOrientation.x, _noteOrientation.y);
		}
		// effects
		paintEffects(layout, context, x, y, spacing);
	}
	
	private function paintScoreNote(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, spacing:Int) : Void
	{
		var scoreSpacing:Float = layout.scoreLineSpacing;
		var direction:VoiceDirection = voiceImpl().beatGroup.direction;
		var key:Int = measureImpl().keySignature();
		var clef:Int = MeasureClefConverter.toInt(measureImpl().clef);

		var realX:Int = cast (x + 4 * layout.scale);
		var realY1:Int = y + scorePosY;
		var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);
		var effectLayer:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);

		if (isTiedNote)
		{
			var noteForTie:NoteImpl = noteForTie();
			var tieScale:Float = scoreSpacing / 8.0;
			var tieX:Float = realX - (20.0 * tieScale);
			var tieY:Float = realY1;
			var tieWidth:Float = 20.0 * tieScale;
			var tieHeight:Float = 30.0 * tieScale;

			if (noteForTie != null)
			{
				tieX = cast (noteForTie.beatImpl().lastPaintX + 15 * layout.scale);
				tieY = y + scorePosY;
				tieWidth = (realX - tieX);
				tieHeight = (20.0 * tieScale);
			}


			if (tieWidth > 0 && tieHeight > 0)
			{
				var wScale:Float = tieWidth / 20;
				fill.addMusicSymbol(MusicFont.HammerPullUp, cast tieX, cast realY1, wScale, layout.scale); 
			}
		}

		var accidentalX:Int = cast (x - 2 * layout.scale);
		if (_accidental == MeasureImpl.NATURAL)
		{ 
			KeySignaturePainter.paintSmallNatural(fill, accidentalX, cast (realY1 + scoreSpacing / 2), layout);
		}
		else if (_accidental == MeasureImpl.SHARP)
		{
			KeySignaturePainter.paintSmallSharp(fill, accidentalX, cast (realY1 + scoreSpacing / 2), layout);
		}
		else if (_accidental == MeasureImpl.FLAT)
		{
			KeySignaturePainter.paintSmallFlat(fill, accidentalX, cast (realY1 + scoreSpacing / 2), layout);
		}

		if (effect.isHarmonic())
		{
			var full:Bool = voice.duration.value >= Duration.QUARTER;
			var layer:DrawingLayer = full ? fill : effectLayer;
			NotePainter.paintHarmonic(layer, realX, realY1 + 1, layout.scale);
		}
		else if (effect.deadNote)
		{
			NotePainter.paintDeadNote(fill, realX, realY1, layout.scale, DrawingResources.clefFont);
		}
		else
		{
			var full:Bool = voice.duration.value >= Duration.QUARTER;
			NotePainter.paintNote(fill, realX, realY1, layout.scale, full, DrawingResources.clefFont);
		}

		if (effect.isGrace())
		{
			paintGrace(layout, context, realX, realY1);
		}

		if (voice.duration.isDotted || voice.duration.isDoubleDotted)
		{
			voiceImpl().paintDot(
				layout,
				fill,
				realX + (12.0 * (scoreSpacing / 8.0)),
				realY1 + (layout.scoreLineSpacing / 2),
				scoreSpacing / 10.0);
		}

		var xMove:Int = direction == VoiceDirection.Up
						 ? DrawingResources.getScoreNoteSize(layout, false).width
						 : 0;
		var realY2:Int = y + voiceImpl().beatGroup.getY2(layout, cast (posX() + spacing), key, clef);

		// Stacatto
		if (effect.staccato)
		{
			var Size:Int = 3;
			var stringX:Int = realX + xMove;
			var stringY:Int = (realY2 + (4 * ((direction == VoiceDirection.Up) ? -1 : 1)));

			fill.addCircle(cast (stringX - (Size / 2)), cast (stringY - (Size / 2)), Size);
		}
		// Tremolo Picking
		if (effect.isTremoloPicking())
		{
			var trillY = direction != VoiceDirection.Up ? realY1 + Math.floor(8 * layout.scale) : realY1 - Math.floor(16 * layout.scale);
			var trillX = direction != VoiceDirection.Up ? realX -  Math.floor(5 * layout.scale) : realX + Math.floor(3*layout.scale); 
			var s:String = "";
			switch (effect.tremoloPicking.duration.value)
			{
				case Duration.EIGHTH:
					s = MusicFont.TrillUpEigth;
					if (direction == VoiceDirection.Down)
						trillY += Math.floor(8 * layout.scale);
				case Duration.SIXTEENTH:
					s = MusicFont.TrillUpSixteenth;
					if (direction == VoiceDirection.Down)
						trillY += Math.floor(4 * layout.scale);
				case Duration.THIRTY_SECOND:
					s = MusicFont.TrillUpThirtySecond;
			}
			if (s != "")
				fill.addMusicSymbol(s, trillX, trillY, layout.scale);
		}
	}
	
	private function paintEffects(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, spacing:Int) : Void
	{ 
		var scale:Float = layout.scale;
		var realX:Int = x;
		var realY:Int= y + tabPosY;

		var fill:DrawingLayer = voice.index == 0
								 ? context.get(DrawingLayers.VoiceEffects1)
								 : context.get(DrawingLayers.VoiceEffects2);

		if (effect.isGrace())
		{
			var value:String = effect.grace.isDead ? "X" : Std.string(effect.grace.fret);
			fill.addString(value, DrawingResources.graceFont, Math.round(_noteOrientation.x - 7 * scale), _noteOrientation.y);
		}
		if (effect.isBend())
		{
			var nextBeat:BeatImpl = cast layout.songManager().getNextBeat(beatImpl());
			// only use beat for bend if it's in the same line
			if (nextBeat != null && nextBeat.measureImpl().ts != measureImpl().ts)
				nextBeat = null;
			paintBend(layout, context, nextBeat, _noteOrientation.x + _noteOrientation.width, realY);
		}
		else if (effect.slide || effect.hammer)
		{
			var nextFromX:Int = x;
			var nextNote:NoteImpl = cast layout.songManager().getNextNote(measureImpl(), beatImpl().start, voice.index, this.string);
			if (effect.slide)
			{
				paintSlide(layout, context, nextNote, realX, realY, nextFromX);
			}
			else if (effect.hammer)
			{
				paintHammer(layout, context, nextNote, realX, realY);
			}
		}
		
		if (effect.isTrill())
		{
			var str = "(" + effect.trill.fret + ")";
			fill.addString(str, DrawingResources.graceFont, Math.round(_noteOrientation.x + _noteOrientation.width + 3 * scale), _noteOrientation.y);
		}
	}
	
	private function paintBend(layout:ViewLayout, context:DrawingContext, nextBeat:BeatImpl, fromX:Int, fromY:Int) : Void
	{
		var scale:Float = layout.scale;
		var iX:Float = fromX;
		var iY:Float = fromY - (2.0 * scale);

		var iXTo:Float;
		var iMinY:Float = iY - 60 * scale;
		if (nextBeat == null)
		{// No Next beat -> Till End of Own beat
			iXTo = beatImpl().measureImpl().posX + beatImpl().measureImpl().width + beatImpl().measureImpl().spacing;
		}
		else
		{
			if (nextBeat.getNotes().length > 0)
			{
				iXTo = nextBeat.measureImpl().posX + nextBeat.measureImpl().headerImpl().getLeftSpacing(layout)
					+ nextBeat.posX + (nextBeat.spacing() * scale) + 5 * scale;
			}
			else
			{
				iXTo = nextBeat.measureImpl().posX + nextBeat.posX + nextBeat.spacing() + 5 * scale;
			}
		}

		var fill:DrawingLayer = voice.index == 0
					 ? context.get(DrawingLayers.VoiceEffects1)
					 : context.get(DrawingLayers.VoiceEffects2);

		var draw:DrawingLayer = voice.index == 0
					 ? context.get(DrawingLayers.VoiceEffectsDraw1)
					 : context.get(DrawingLayers.VoiceEffectsDraw2);



		if (effect.bend.points.length >= 2)
		{
			var dX:Float = (iXTo - iX) / BendEffect.MAX_POSITION;
			var dY:Float = (iY - iMinY) / BendEffect.MAX_VALUE;

			draw.startFigure();
			for (i in 0 ... effect.bend.points.length - 1)
			{
				var firstPt:BendPoint = effect.bend.points[i];
				var secondPt:BendPoint = effect.bend.points[i + 1];

				if (firstPt.value == secondPt.value && i == effect.bend.points.length - 2) continue;

				var arrow:Bool = (firstPt.value != secondPt.value);
				var firstLoc:Point = new Point(cast (iX + (dX * firstPt.position)), cast (iY - dY * firstPt.value));
				var secondLoc:Point = new Point(cast (iX + (dX * secondPt.position)), cast (iY - dY * secondPt.value));
				var firstHelper:Point = new Point(firstLoc.x + ((secondLoc.x - firstLoc.x)), cast (iY - dY * firstPt.value));
				draw.addBezier(firstLoc.x, firstLoc.y, firstHelper.x, firstHelper.y, secondLoc.x, secondLoc.y, secondLoc.x, secondLoc.y);

				var arrowSize:Float = 4 * scale;
				if (secondPt.value > firstPt.value)
				{
					draw.addLine(secondLoc.x - 0.5, secondLoc.y, secondLoc.x - arrowSize - 0.5, secondLoc.y + arrowSize); 
					draw.addLine(secondLoc.x - 0.5, secondLoc.y, secondLoc.x + arrowSize - 0.5, secondLoc.y + arrowSize); 
				}
				else if (secondPt.value != firstPt.value)
				{
					draw.addLine(secondLoc.x - 0.5, secondLoc.y, secondLoc.x - arrowSize - 0.5, secondLoc.y - arrowSize); 
					draw.addLine(secondLoc.x - 0.5, secondLoc.y, secondLoc.x + arrowSize - 0.5, secondLoc.y - arrowSize); 
				}
				
				
				if (secondPt.value != 0)
				{
					var dV:Float = (secondPt.value - firstPt.value) * 0.25; // dv * 1/4 
					var up:Bool = dV > 0;
					dV = Math.abs(dV);
					var s:String = "";
					// Full Steps 
					if (dV == 1)
						s = "full";
					else if (dV > 1)
					{
						s += Std.string(Math.floor(dV)) + " ";
						// Quaters
						dV -= Math.floor(dV);
					}

					if (dV == 0.25)
						s += "1/4";
					else if (dV == 0.5)
						s += "1/2";
					else if (dV == 0.75)
						s += "3/4";


					context.graphics.font = DrawingResources.defaultFont;
					var size:Float = context.graphics.measureText(s);
					var y:Float = up ? secondLoc.y - DrawingResources.defaultFontHeight + (2 * scale) : secondLoc.y - (2 * scale);
					var x:Float = secondLoc.x - size / 2;

					fill.addString(s, DrawingResources.defaultFont, cast x, cast y);
				}
			}
		}
	}

	private function paintSlide(layout:ViewLayout, context:DrawingContext, nextNote:NoteImpl, x:Int, y:Int, nextX:Int) : Void
	{
		var xScale:Float = layout.scale;
		var yScale:Float = layout.stringSpacing / 10.0;
		var yMove:Float = 3.0 * yScale;
		var realX:Float = x;
		var realY:Float = y;
		var rextY:Float = realY;

		var draw:DrawingLayer = voice.index == 0
								? context.get(DrawingLayers.VoiceEffectsDraw1)
								: context.get(DrawingLayers.VoiceEffectsDraw2);
		draw.startFigure();

		if (effect.slideType == SlideType.IntoFromBelow)
		{
			realY += yMove;
			rextY -= yMove;
			draw.addLine(realX - (5 * xScale), realY, realX + (3 * xScale), rextY);
		}
		else if (effect.slideType == SlideType.IntoFromAbove)
		{
			realY -= yMove;
			rextY += yMove;
			draw.addLine(realX - (5 * xScale), realY, realX + (3 * xScale), rextY);
		}
		else if (effect.slideType == SlideType.OutDownWards)
		{
			realY -= yMove;
			rextY += yMove;
			draw.addLine(realX + (10 * xScale), realY, realX + (18 * xScale), rextY);
		}
		else if (effect.slideType == SlideType.OutUpWards)
		{
			realY += yMove;
			rextY -= yMove;
			draw.addLine(realX + (10 * xScale), realY, realX + (18 * xScale), rextY);
		}
		else if (nextNote != null)
		{
			var fNextX:Float = nextNote.beatImpl().getRealPosX(layout);
			
			rextY = realY;
			if (nextNote.value < value)
			{
				realY -= yMove;
				rextY += yMove;
			}
			else if (nextNote.value > value)
			{
				realY += yMove;
				rextY -= yMove;
			}
			else
			{
				realY -= yMove;
				rextY -= yMove;
			}

			draw.addLine(realX + (13 * xScale), realY, fNextX, rextY);

			if (effect.slideType == SlideType.SlowSlideTo)
			{
				paintHammer(layout, context, nextNote, x, y);
			}
		}
		else
		{
			draw.addLine(realX + (13 * xScale), realY - yMove, realX + (19 * xScale), realY - yMove);
		}
	}

	private function paintHammer(layout:ViewLayout, context:DrawingContext, nextNote:NoteImpl, x:Float, y:Float, forceDown:Bool = false) : Void
	{
		var xScale:Float = layout.scale;
		var yScale:Float = layout.stringSpacing / 10.0;

		var realX :Float= x + (7.0 * xScale);
		var realY:Float = y - (DrawingResources.noteFontHeight * layout.scale);

		var width:Float = nextNote != null
						   ? nextNote.beatImpl().getRealPosX(layout) - 4 * xScale -  realX
						   : 10.0 * xScale;
		var fill:DrawingLayer = voice.index == 0
					? context.get(DrawingLayers.VoiceEffects1)
					: context.get(DrawingLayers.VoiceEffects2);

		var wScale:Float = width / 16;
		var hScale:Float = (this.string > 3 || forceDown) ? -1 : 1;
		if (this.string > 3 || forceDown)
			realY += (DrawingResources.noteFontHeight * layout.scale) * 2;
			
		fill.addMusicSymbol(MusicFont.HammerPullUp, cast realX, cast realY, layout.scale * wScale, layout.scale * hScale);
	}

	private function paintGrace(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var scale:Float = layout.scoreLineSpacing / 2.25;
		var realX:Float = x - (2 * scale);
		var realY:Float = y - (9*layout.scale);
		var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);

		var s:String = effect.deadNote ? MusicFont.GraceDeadNote : MusicFont.GraceNote;
		fill.addMusicSymbol(s, cast (realX - scale * 1.33), cast realY, layout.scale);
		if (effect.grace.transition == GraceEffectTransition.Hammer || effect.grace.transition == GraceEffectTransition.Slide)
		{
			paintHammer(layout, context, null, x - (15*layout.scale), y + (5*layout.scale), true);
		}
	}

	private function paintVibrato(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, symbolScale:Float)
	{
		var scale:Float = layout.scale;
		var realX:Float = x - 2 * scale;
		var realY:Float = y + (2.0 * scale);
		var width:Float = voiceImpl().width;

		var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);
		
		var step:Float = 18 * scale * symbolScale;
		var loops:Int = Math.floor(Math.max(1, (width / step)));
		var s:String = "";
		for (i in 0 ... loops)
		{
			fill.addMusicSymbol(MusicFont.VibratoLeftRight, realX, realY, layout.scale * symbolScale);
			realX += step;
		}
	}

	private function paintTrill(layout:ViewLayout, context:DrawingContext, x:Int, y:Int)
	{
		var str:String = "Tr";
		context.graphics.font = DrawingResources.effectFont;
		var size:Float = context.graphics.measureText(str);
		var scale:Float = layout.scale;
		var realX:Float = x + size - 2 * scale;
		var realY:Float = y + (DrawingResources.effectFontHeight - (5.0 * scale)) / 2.0;
		var width:Float = voiceImpl().width - size - (2.0 * scale);

		var fill:DrawingLayer = voice.index == 0 ? context.get(DrawingLayers.VoiceEffects1) : context.get(DrawingLayers.VoiceEffects2);
		fill.addString(str, DrawingResources.effectFont, x, y);
	}

	private function paintAccentuated(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var layer:DrawingLayer = voice.index == 0
								 ? context.get(DrawingLayers.Voice1)
								 : context.get(DrawingLayers.Voice2);

		layer.addMusicSymbol(MusicFont.AccentuatedNote, x, y, layout.scale);
	}

	private function paintHeavyAccentuated(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var layer:DrawingLayer = voice.index == 0
					 ? context.get(DrawingLayers.Voice1)
					 : context.get(DrawingLayers.Voice2);

		layer.addMusicSymbol(MusicFont.HeavyAccentuatedNote, x, y, layout.scale);
	}

	public function calculateBendOverflow(layout:ViewLayout) : Int
	{
		// Find Highest bend
		var point:BendPoint = null;
		for (curr in effect.bend.points)
		{
			if (point == null || point.value < curr.value)
				point = curr;
		}

		if (point == null) return 0;

		// 5px*scale movement per value 
		var fullHeight:Float = point.value * (6 * layout.scale);
		var heightToTabNote:Float = (string - 1) * layout.stringSpacing;

		return Math.round(fullHeight - heightToTabNote);
	}

}