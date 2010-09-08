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
import net.alphatab.model.VoiceDirection;
import net.alphatab.tablature.ViewLayout;

/**
 * A beatgroup contains a set of notes which are grouped by bars.
 */
class BeatGroup 
{
	private static var SCORE_MIDDLE_KEYS:Array<Int> = [ 55, 40, 40, 50 ];
	private static var SCORE_SHARP_POSITIONS:Array<Int> = [7, 7, 6, 6, 5, 4, 4, 3, 3, 2, 2, 1 ];
	private static var SCORE_FLAT_POSITIONS:Array<Int> = [ 7, 6, 6, 5, 5, 4, 3, 3, 2, 2, 1, 1 ];

	private static inline var UP_OFFSET:Int = 28;
	private static inline var DOWN_OFFSET:Int = 35;
	
	private var _voice:Int;
	private var _voices:Array<VoiceImpl>;
	private var _firstMinNote:NoteImpl;
	private var _firstMaxNote:NoteImpl;
	private var _lastMinNote:NoteImpl;
	private var _lastMaxNote:NoteImpl;

	public var direction:VoiceDirection;
	public var minNote:NoteImpl;
	public var maxNote:NoteImpl;

	public function new(voice:Int) 
	{
		_voice = voice;
		_voices = new Array<VoiceImpl>();
		direction = VoiceDirection.None;
		_firstMinNote = null;
		_firstMaxNote = null;
		_lastMinNote = null;
		_lastMaxNote = null;
		maxNote = null;
		minNote = null;
	}
	
	public function checkVoice(voice:VoiceImpl) : Void
	{
		checkNote(voice.maxNote);
		checkNote(voice.minNote);
		_voices.push(voice);

		if (voice.direction != VoiceDirection.None)
		{
			voice.direction = voice.direction;
		}
	}
	
	private function checkNote(note:NoteImpl) : Void
	{
		var value:Int = note.realValue();

		//FIRST MIN NOTE
		if (_firstMinNote == null || note.voice.beat.start < _firstMinNote.voice.beat.start)
		{
			_firstMinNote = note;
		}
		else if (note.voice.beat.start == _firstMinNote.voice.beat.start)
		{
			if (note.realValue() < _firstMinNote.realValue())
			{
				_firstMinNote = note;
			}
		}
		//FIRST MAX NOTE
		if (_firstMaxNote == null || note.voice.beat.start < _firstMaxNote.voice.beat.start)
		{
			_firstMaxNote = note;
		}
		else if (note.voice.beat.start == _firstMaxNote.voice.beat.start)
		{
			if (note.realValue() > _firstMaxNote.realValue())
			{
				_firstMaxNote = note;
			}
		}

		//LAST MIN NOTE
		if (_lastMinNote == null || note.voice.beat.start > _lastMinNote.voice.beat.start)
		{
			_lastMinNote = note;
		}
		else if (note.voice.beat.start == _lastMinNote.voice.beat.start)
		{
			if (note.realValue() < _lastMinNote.realValue())
			{
				_lastMinNote = note;
			}
		}
		//LAST MIN NOTE
		if (_lastMaxNote == null || note.voice.beat.start > _lastMaxNote.voice.beat.start)
		{
			_lastMaxNote = note;
		}
		else if (note.voice.beat.start == _lastMaxNote.voice.beat.start)
		{
			if (note.realValue() > _lastMaxNote.realValue())
			{
				_lastMaxNote = note;
			}
		}

		if (maxNote == null || value > maxNote.realValue())
		{
			maxNote = note;
		}
		if (minNote == null || value < minNote.realValue())
		{
			minNote = note;
		}
	}
	
	public function finish(layout:ViewLayout, measure:MeasureImpl)
	{
		if (direction == VoiceDirection.None)
		{
			if (measure.notEmptyVoices > 1)
			{
				direction = _voice == 0 ? VoiceDirection.Up : VoiceDirection.Down;
			}
			else
			{
				var max:Float = Math.abs(minNote.realValue() - (SCORE_MIDDLE_KEYS[MeasureClefConverter.toInt(measure.clef) - 1] + 100));
				var min:Float = Math.abs(maxNote.realValue() - (SCORE_MIDDLE_KEYS[MeasureClefConverter.toInt(measure.clef) - 1] - 100));
				direction = max > min ? VoiceDirection.Up : VoiceDirection.Down;
			}
		}
	}
	
	public function getY1(layout:ViewLayout, note:NoteImpl, key:Int, clef:Int) : Int
	{
		var scale:Float = (layout.scoreLineSpacing / 2.00);
		var noteValue:Int = note.realValue();
		var index:Int = noteValue % 12;
		var step:Int = Math.floor(noteValue / 12);
		var offset:Float = (7 * step) * scale;
		var scoreLineY:Int= key <= 7
							 ? Math.floor((SCORE_SHARP_POSITIONS[index]*scale) - offset)
							 : Math.floor((SCORE_FLAT_POSITIONS[index]*scale) - offset);

		scoreLineY += Math.floor(MeasureImpl.SCORE_KEY_OFFSETS[clef - 1] * scale);

		return scoreLineY;
	}
	
	public function getY2(layout:ViewLayout, x:Int, key:Int, clef:Int) : Int
	{
		var MaxDistance:Int = 10;
		var upOffset:Float = getUpOffset(layout);
		var downOffset:Float = getDownOffset(layout);
		var y:Int;
		var x1:Int;
		var x2:Int;
		var y1:Int;
		var y2:Int;
		if (direction == VoiceDirection.Down)
		{
			if (minNote != _firstMinNote && minNote != _lastMinNote)
			{
				return Math.round(getY1(layout, minNote, key, clef) + downOffset);
			}

			y = 0;
			x1 = Math.round(_firstMinNote.posX() + _firstMinNote.beatImpl().spacing());
			x2 = Math.round(_lastMinNote.posX() + _lastMinNote.beatImpl().spacing());
			y1 = Math.round(getY1(layout, _firstMinNote, key, clef) + downOffset);
			y2 = Math.round(getY1(layout, _lastMinNote, key, clef) + downOffset);

			if (y1 > y2 && (y1 - y2) > MaxDistance) y2 = (y1 - MaxDistance);
			if (y2 > y1 && (y2 - y1) > MaxDistance) y1 = (y2 - MaxDistance);

			if ((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0)
			{
				y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
			}
			return y1 - y;
		}
		if (maxNote != _firstMaxNote && maxNote != _lastMaxNote)
		{
			return Math.round(getY1(layout, maxNote, key, clef) - upOffset);
		}
		y = 0;
		x1 = Math.round(_firstMaxNote.posX() + _firstMaxNote.beatImpl().spacing());
		x2 = Math.round(_lastMaxNote.posX() + _lastMaxNote.beatImpl().spacing());
		y1 = Math.round(getY1(layout, _firstMaxNote, key, clef) - upOffset);
		y2 = Math.round(getY1(layout, _lastMaxNote, key, clef) - upOffset);

		if (y1 < y2 && (y2 - y1) > MaxDistance) y2 = (y1 + MaxDistance);
		if (y2 < y1 && (y1 - y2) > MaxDistance) y1 = (y2 + MaxDistance);

		if ((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0)
		{
			y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
		}
		return y1 - y;
	}
	
	public static function getUpOffset(layout:ViewLayout) : Float
	{
		return UP_OFFSET * (layout.scoreLineSpacing / 8.0);
	}

	public static function getDownOffset(layout:ViewLayout) : Float
	{
		return DOWN_OFFSET * (layout.scoreLineSpacing / 8.0);
	}

}