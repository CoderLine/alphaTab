/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package net.alphatab.tablature.model;
import net.alphatab.model.Duration;
import net.alphatab.model.MeasureClefConverter;
import net.alphatab.model.Note;
import net.alphatab.model.SongFactory;
import net.alphatab.model.Tuplet;
import net.alphatab.model.Voice;
import net.alphatab.model.VoiceDirection;
import net.alphatab.model.Point;
import net.alphatab.model.SlideType;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayer;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.drawing.NotePainter;
import net.alphatab.tablature.drawing.SilencePainter;
import net.alphatab.tablature.TrackSpacingPositions;
import net.alphatab.tablature.ViewLayout;


/**
 * This Voice implementation extends the default voice with drawing and layouting features. 
 */
class VoiceImpl extends Voice
{
	private var _usedStrings:Array<Bool>;
	private var _hiddenSilence:Bool;
	private var _silenceY:Float;
	private var _silenceHeight:Float;
	
	public var width:Int;
	public var minNote:NoteImpl;
	public var maxNote:NoteImpl;
	
	public var join1:VoiceImpl;
	public var join2:VoiceImpl;

	public var isJoinedGreaterThanQuarter:Bool;

	public var joinedType:JoinedType;

	public var previousBeat:VoiceImpl;
	public var nextBeat:VoiceImpl;

	public var beatGroup:BeatGroup;
	public var tripletGroup:TripletGroup;
	
	public var maxString:Int;
	public var minString:Int;
	public var maxY:Int;
	public var minY:Int;
	public var isHiddenSilence:Bool;
	
	public function posX() : Int
	{
		return beatImpl().posX;
	}

	public inline function beatImpl() : BeatImpl
	{
		return cast beat;
	}

	public inline function measureImpl() : MeasureImpl
	{
		return cast beat.measure;
	}

	public function usedStrings() : Array<Bool>
	{
		if (_usedStrings == null)
		{
			_usedStrings = new Array<Bool>();
			for (i in 0 ... beat.measure.track.stringCount())
			{
				_usedStrings.push(false);
			}
		}
		return _usedStrings;
	}

	public function getPaintPosition(iIndex:TrackSpacingPositions) : Int
	{
		return measureImpl().ts.get(iIndex);
	}


	public function new(factory:SongFactory, index:Int) 
	{
		super(factory, index);
	}
	
	public function reset() : Void
	{
		maxNote = null;
		minNote = null;
		_hiddenSilence = false;
		_usedStrings = new Array<Bool>();
		for (i in 0 ... beat.measure.track.stringCount())
		{
			_usedStrings.push(false);
		}
		maxString = 1;
		minString = beat.measure.track.stringCount();
	}

	public function check(note:NoteImpl) : Void
	{
		var value:Int = note.realValue();
		if (maxNote == null || value > maxNote.realValue()) maxNote = note;
		if (minNote == null || value < minNote.realValue()) minNote = note;

		usedStrings()[note.string - 1] = true;
		if (note.string > maxString) maxString = note.string;
		if (note.string < minString) minString = note.string;
	}

	public function update(layout:ViewLayout): Void
	{
		minY = 0;
		maxY = 0;
		if (isRestVoice()) updateSilenceSpacing(layout);
		else updateNoteVoice(layout);
		// try to add on tripletgroup of previous beat or create a new group
		if (duration.tuplet != null && !duration.tuplet.equals(Tuplet.NORMAL))
		{
			if (previousBeat == null || previousBeat.tripletGroup == null || !previousBeat.tripletGroup.check(this))
			{			
				tripletGroup = new TripletGroup(index);
				tripletGroup.check(this);
			}
			else
			{
				tripletGroup = previousBeat.tripletGroup;
			}
		}
	}
	
	public function updateNoteVoice(layout:ViewLayout) : Void
	{
		joinedType = JoinedType.NoneRight;
		isJoinedGreaterThanQuarter = false;
		join1 = this;
		join2 = this;
		var noteJoined:Bool = false;
		var withPrev:Bool = false;

		if (previousBeat != null && !previousBeat.isRestVoice())
		{
			if (measureImpl().canJoin(layout.songManager(), this, previousBeat))
			{
				withPrev = true;
				if (previousBeat.duration.value >= duration.value)
				{
					join1 = previousBeat;
					join2 = this;
					joinedType = JoinedType.Left;
					noteJoined = true;
				}
				if (previousBeat.duration.value > Duration.QUARTER)
				{
					isJoinedGreaterThanQuarter = true;
				}
			}
		}

		if (nextBeat != null && !nextBeat.isRestVoice())
		{
			if (measureImpl().canJoin(layout.songManager(), this, nextBeat))
			{
				if (nextBeat.duration.value >= duration.value)
				{
					join2 = nextBeat;
					if (previousBeat == null || previousBeat.isRestVoice() || previousBeat.duration.value < duration.value)
						join1 = this;
					noteJoined = true;
					joinedType = JoinedType.Right;
				}
				if (nextBeat.duration.value > Duration.QUARTER) isJoinedGreaterThanQuarter = true;
			}
		}

		if (!noteJoined && withPrev) joinedType = JoinedType.NoneLeft;

		minY = 0;
		maxY = beatImpl().measureImpl().trackImpl().tabHeight;
		if (beatGroup.direction == VoiceDirection.Down)
		{ 
			maxY += Math.floor((layout.stringSpacing / 2) * 5) + 1;
		}
		else
		{
			minY -=  Math.floor((layout.stringSpacing / 2) * 5) + 1;
		}
	}

	public function updateSilenceSpacing(layout:ViewLayout) : Void
	{
		_silenceY = 0;
		_silenceHeight = 0;

		if (!_hiddenSilence)
		{
			var lineSpacing:Int = cast layout.scoreLineSpacing;
			var LineCount:Int = 5;
			var scale:Float = (lineSpacing / 9.0);

			var duration:Int = duration.value;
			if (duration == Duration.WHOLE)
			{
				_silenceHeight = lineSpacing;
				_silenceY = (lineSpacing);
			}
			else if (duration == Duration.HALF)
			{
				_silenceHeight = lineSpacing;
				_silenceY = (lineSpacing * 2) - _silenceHeight;
			}
			else if (duration == Duration.QUARTER)
			{
				_silenceHeight = (scale * 16);
				_silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (_silenceHeight / 2);
			}
			else if (duration == Duration.EIGHTH)
			{
				_silenceHeight = (scale * 12);
				_silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (_silenceHeight / 2);
			}
			else if (duration == Duration.SIXTEENTH)
			{
				_silenceHeight = (scale * 16);
				_silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (_silenceHeight / 2);
			}
			else if (duration == Duration.THIRTY_SECOND)
			{
				_silenceHeight = (scale * 24);
				_silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (_silenceHeight / 2);
			}
			else if (duration == Duration.SIXTY_FOURTH)
			{
				_silenceHeight = (scale * 28);
				_silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (_silenceHeight / 2);
			}

			for (v in 0 ... beat.voices.length)
			{
				if (v != index)
				{
					var voice:VoiceImpl = beatImpl().getVoiceImpl(v);
					if (!voice.isEmpty)
					{
						if (voice.isRestVoice())
						{
							if (!voice.isHiddenSilence)
							{
								var maxSilenceHeight:Float = (lineSpacing * 3);
								var firstPosition:Float = (_silenceY - (maxSilenceHeight / beat.voices.length));
								_silenceY = (firstPosition + (maxSilenceHeight * index));
							}
						}
					}
				}
			}
			minY = cast _silenceY;
			maxY = cast (_silenceY + _silenceHeight);
		}
	}
	
	// Painting
	// Voice Drawing/Layouting
	public function paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		if (!isEmpty)
		{
			if (isRestVoice() && !isHiddenSilence)
			{
				paintSilence(layout, context, x, y);
			}
			else
			{
				for (note in notes)
				{
					var noteImpl:NoteImpl = cast note;
					noteImpl.paint(layout, context, x, y);
				}
				paintBeat(layout, context, x, y);
			}
		}
	}
	
	// Silence
	public function paintSilence(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var realX:Int = cast (x + 3 * layout.scale);
		var realY:Int = y + getPaintPosition(TrackSpacingPositions.ScoreMiddleLines);
		var lineSpacing:Int = cast layout.scoreLineSpacing;
		var scale:Float = lineSpacing;

		var fill:DrawingLayer = index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);

		switch (duration.value)
		{ 
			case Duration.WHOLE:
				SilencePainter.paintWhole(fill, realX, cast realY, layout);
			case Duration.HALF:
				SilencePainter.paintHalf(fill, realX, realY, layout);
			case Duration.QUARTER:
				SilencePainter.paintQuarter(fill, realX, realY, layout);
			case Duration.EIGHTH:
				SilencePainter.paintEighth(fill, realX, realY, layout);
			case Duration.SIXTEENTH:
				SilencePainter.paintSixteenth(fill, realX, realY, layout);
			case Duration.THIRTY_SECOND:
				SilencePainter.paintThirtySecond(fill, realX, realY, layout);
			case Duration.SIXTY_FOURTH:
				SilencePainter.paintSixtyFourth(fill, realX, realY, layout);
		}


		if (duration.isDotted || duration.isDoubleDotted)
		{
			fill.moveTo(realX + 10, realY + 1);
			fill.circleTo(1);

			if (duration.isDoubleDotted)
			{
				fill.moveTo((realX + 13), realY + 1);
				fill.circleTo(1);
			}
		}
		
		paintTriplet(layout, context, x, y);
	}
	
	// Triplet
	public function paintTriplet(layout:ViewLayout, context:DrawingContext, x:Int, y:Int)
	{
		var realX:Int = cast (x + 3 * layout.scale);
		var fill:DrawingLayer = index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);
		
		if (!duration.tuplet.equals(Tuplet.NORMAL))
		{  
			// paint group if group is full and is first of group
			//  otherwise only a number
			if (tripletGroup.isFull() && 
				(previousBeat == null  || previousBeat.tripletGroup == null || previousBeat.tripletGroup != tripletGroup) )
			{
				tripletGroup.paint(layout, context, x, y);
			}
			else if(!tripletGroup.isFull())
			{
				fill.addString(Std.string(duration.tuplet.enters), DrawingResources.defaultFont, Math.round(realX), Math.round(y + getPaintPosition(TrackSpacingPositions.Tupleto)));
			}
		}
	}
	
	// hammer
	private function paintHammer(layout:ViewLayout, context:DrawingContext, x:Int, y:Int)
	{
		/*// check if hammer drawing is needed
		var drawHammer = false;
		for(note in notes)
		{
			var noteImpl:NoteImpl = cast note;
			if(noteImpl.effect.hammer || (noteImpl.effect.slide && noteImpl.effect.slideType == SlideType.SlowSlideTo))
			{
				drawHammer = true;
				break;
			}
		}
		
		if(drawHammer)
		{
			 TODO: Correct score note tie painting
			var noteHeight = DrawingResources.getScoreNoteSize(layout, false).height;
			var startX = x + (DrawingResources.getScoreNoteSize(layout, false).width/2);
			var startNote = beatGroup.direction == VoiceDirection.Up ? minNote : maxNote;
			var noteHeight = DrawingResources.getScoreNoteSize(layout, false).height + 3*layout.scale;
			
			if(beatGroup.direction == VoiceDirection.Down)
				noteHeight *= -1; 
			
			var startY = measureImpl().posY + startNote.scorePosY + startNote.getPaintPosition(TrackSpacingPositions.ScoreMiddleLines) + noteHeight;

			var nextVoice:VoiceImpl = cast nextBeat;
			var endX = nextVoice != null ?
						nextVoice.beatImpl().getRealPosX(layout) :
						startX + (15 * layout.scale);
			var endNote = nextVoice == null || nextVoice.isRestVoice() ? null : (nextVoice.beatGroup.direction == VoiceDirection.Up ? minNote : maxNote); 
				
			var endY = endNote != null ? 
						endNote.beatImpl().measureImpl().posY + endNote.scorePosY + endNote.getPaintPosition(TrackSpacingPositions.ScoreMiddleLines) + noteHeight
						: startY;
			var down = endNote != null?
						endNote.voiceImpl().beatGroup.direction == VoiceDirection.Up
						: beatGroup.direction == VoiceDirection.Up;
			var fill:DrawingLayer = index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);
			NoteImpl.paintTie(layout, fill, startX, startY, endX, endY, down);
			//paintHammer(layout, context, nextNote, realX, realY1);
			 
		}*/
	}
	
	// Beat
	public function paintBeat(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		if (!isRestVoice())
		{
			var spacing:Int= beatImpl().spacing();
			paintScoreBeat(
				layout,
				context,
				x,
				y + getPaintPosition(TrackSpacingPositions.ScoreMiddleLines),
				spacing);
		}
	}
	
	// ScoreBeat
	public function paintScoreBeat(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, spacing:Int) : Void
	{
		var vX:Int = cast (x + 4 * layout.scale);

		var fill:DrawingLayer = index == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);
		var draw:DrawingLayer = index == 0 ? context.get(DrawingLayers.VoiceDraw1) : context.get(DrawingLayers.VoiceDraw2);
		// Tupleto
		paintTriplet(layout, context, x, (y - getPaintPosition(TrackSpacingPositions.ScoreMiddleLines)));
		
		// Hammer
		paintHammer(layout, context, x, y);
		
		if (duration.value >= Duration.HALF)
		{
			var scale:Float = layout.scale;
			var lineSpacing:Float = layout.scoreLineSpacing;
			var direction:VoiceDirection = this.beatGroup.direction;

			var key:Int = beat.measure.keySignature();
			var clef:Int  = MeasureClefConverter.toInt(beat.measure.clef);

			var xMove:Int = direction == VoiceDirection.Up
							? DrawingResources.getScoreNoteSize(layout, false).width
							: 0;
			var yMove:Int = direction == VoiceDirection.Up
							? Math.round(layout.scoreLineSpacing / 3) + 1
							: Math.round(layout.scoreLineSpacing / 3) * 2;
			var vY1:Int = y + ((direction == VoiceDirection.Down)
									? maxNote.scorePosY
									: minNote.scorePosY);
			var vY2:Int = y + beatGroup.getY2(layout, posX() + spacing, key, clef);

			draw.startFigure();
			draw.moveTo(vX + xMove, vY1 + yMove);
			draw.lineTo(vX + xMove, vY2);

			if (duration.value >= Duration.EIGHTH)
			{
				var index:Int = duration.index() - 3;
				if (index >= 0)
				{
					var dir:Int = direction == VoiceDirection.Down ? 1 : -1;

					var bJoinedGreaterThanQuarter:Bool = isJoinedGreaterThanQuarter;

					if ((joinedType == JoinedType.NoneLeft || joinedType == JoinedType.NoneRight) &&
						!bJoinedGreaterThanQuarter)
					{
						var hY:Float = ((y + beatGroup.getY2(layout, posX() + spacing, key, clef)) -
									((lineSpacing * 2) * dir));
						
						NotePainter.paintFooter(
							fill, vX, vY2, duration.value, dir, layout);
					}
					else
					{
						var startX:Int;
						var endX:Int;

						// These two variables have to be set for the calculation of our y position
						var startXforCalculation:Int;
						var endXforCalculation:Int;

						if (joinedType == JoinedType.NoneRight)
						{
							startX = Math.round(beatImpl().getRealPosX(layout) + xMove);
							endX = Math.round(beatImpl().getRealPosX(layout) + (6*scale) + xMove);
							startXforCalculation = posX() + spacing;
							endXforCalculation = Math.floor(posX() + spacing + (6*scale));
						}
						else if (joinedType == JoinedType.NoneLeft)
						{
							startX = Math.round(beatImpl().getRealPosX(layout) - (6*scale) + xMove);
							endX = Math.round(beatImpl().getRealPosX(layout) + xMove);
							startXforCalculation = Math.floor(posX() + spacing - (6*scale));
							endXforCalculation = posX() + spacing;
						}
						else
						{
							startX = Math.round(join1.beatImpl().getRealPosX(layout) + xMove);
							endX = Math.round(join2.beatImpl().getRealPosX(layout) + xMove + (1*scale));
							startXforCalculation = join1.posX() + join1.beatImpl().spacing();
							endXforCalculation = join2.posX() + join2.beatImpl().spacing();
						}

						var hY1:Int = y + this.beatGroup.getY2(layout, startXforCalculation, key, clef);
						var hY2:Int = y + this.beatGroup.getY2(layout, endXforCalculation, key, clef);
						var x1:Float = startX;
						var x2:Float = endX;

						NotePainter.paintBar(fill, cast x1, hY1, cast x2, hY2, index + 1, dir, scale);
					}
				}
			}
		}
	}
	
	public function paintDot(layout:ViewLayout, layer:DrawingLayer, x:Float, y:Float, scale:Float) : Void
	{
		var dotSize:Float = 3.0 * scale;
		layer.addCircle(Math.round(x - (dotSize / 2.0)), Math.round(y - (dotSize / 2.0)), dotSize);

		if (duration.isDoubleDotted)
		{
			layer.addCircle(Math.round((x + (dotSize + 2.0)) - (dotSize / 2.0)), Math.round(y - (dotSize / 2.0)), dotSize);
		}
	}
}