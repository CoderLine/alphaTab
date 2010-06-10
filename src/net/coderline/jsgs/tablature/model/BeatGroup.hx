/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature.model;
import net.coderline.jsgs.model.GsDuration;
import net.coderline.jsgs.model.GsMeasureClefConverter;
import net.coderline.jsgs.model.GsVoiceDirection;
import net.coderline.jsgs.tablature.ViewLayout;

class BeatGroup 
{
	private static var ScoreMiddleKeys:Array<Int> = [ 55, 40, 40, 50 ];
	private static var ScoreSharpPositions:Array<Int> = [7, 7, 6, 6, 5, 4, 4, 3, 3, 2, 2, 1 ];
	private static var ScoreFlatPositions:Array<Int> = [ 7, 6, 6, 5, 5, 4, 3, 3, 2, 2, 1, 1 ];

	private static inline var UpOffset:Int = 28;
	private static inline var DownOffset:Int = 35;
	
	private var _voice:Int;

	private var _voices:Array<GsVoiceImpl>;
	private var _firstMinNote:GsNoteImpl;
	private var _firstMaxNote:GsNoteImpl;
	private var _lastMinNote:GsNoteImpl;
	private var _lastMaxNote:GsNoteImpl;

	public var Direction:GsVoiceDirection;
	public var MinNote:GsNoteImpl;
	public var MaxNote:GsNoteImpl;

	public function new(voice:Int) 
	{
		_voice = voice;
		_voices = new Array<GsVoiceImpl>();
		Direction = GsVoiceDirection.None;
		_firstMinNote = null;
		_firstMaxNote = null;
		_lastMinNote = null;
		_lastMaxNote = null;
		MaxNote = null;
		MinNote = null;
	}
	
	public function CheckVoice(voice:GsVoiceImpl) : Void
	{
		CheckNote(voice.MaxNote);
		CheckNote(voice.MinNote);
		_voices.push(voice);

		if (voice.Direction != GsVoiceDirection.None)
		{
			voice.Direction = voice.Direction;
		}
	}
	
	private function CheckNote(note:GsNoteImpl) : Void
	{
		var value:Int = note.RealValue();

		//FIRST MIN NOTE
		if (_firstMinNote == null || note.Voice.Beat.Start < _firstMinNote.Voice.Beat.Start)
		{
			_firstMinNote = note;
		}
		else if (note.Voice.Beat.Start == _firstMinNote.Voice.Beat.Start)
		{
			if (note.RealValue() < _firstMinNote.RealValue())
			{
				_firstMinNote = note;
			}
		}
		//FIRST MAX NOTE
		if (_firstMaxNote == null || note.Voice.Beat.Start < _firstMaxNote.Voice.Beat.Start)
		{
			_firstMaxNote = note;
		}
		else if (note.Voice.Beat.Start == _firstMaxNote.Voice.Beat.Start)
		{
			if (note.RealValue() > _firstMaxNote.RealValue())
			{
				_firstMaxNote = note;
			}
		}

		//LAST MIN NOTE
		if (_lastMinNote == null || note.Voice.Beat.Start > _lastMinNote.Voice.Beat.Start)
		{
			_lastMinNote = note;
		}
		else if (note.Voice.Beat.Start == _lastMinNote.Voice.Beat.Start)
		{
			if (note.RealValue() < _lastMinNote.RealValue())
			{
				_lastMinNote = note;
			}
		}
		//LAST MIN NOTE
		if (_lastMaxNote == null || note.Voice.Beat.Start > _lastMaxNote.Voice.Beat.Start)
		{
			_lastMaxNote = note;
		}
		else if (note.Voice.Beat.Start == _lastMaxNote.Voice.Beat.Start)
		{
			if (note.RealValue() > _lastMaxNote.RealValue())
			{
				_lastMaxNote = note;
			}
		}

		if (MaxNote == null || value > MaxNote.RealValue())
		{
			MaxNote = note;
		}
		if (MinNote == null || value < MinNote.RealValue())
		{
			MinNote = note;
		}
	}
	
	public function Finish(layout:ViewLayout, measure:GsMeasureImpl)
	{
		if (Direction == GsVoiceDirection.None)
		{
			if (measure.NotEmptyVoices > 1)
			{
				Direction = _voice == 0 ? GsVoiceDirection.Up : GsVoiceDirection.Down;
			}
			else
			{
				var max:Float = Math.abs(MinNote.RealValue() - (ScoreMiddleKeys[GsMeasureClefConverter.ToInt(measure.Clef) - 1] + 100));
				var min:Float = Math.abs(MaxNote.RealValue() - (ScoreMiddleKeys[GsMeasureClefConverter.ToInt(measure.Clef) - 1] - 100));
				Direction = max > min ? GsVoiceDirection.Up : GsVoiceDirection.Down;
			}
		}
	}
	
	public function GetY1(layout:ViewLayout, note:GsNoteImpl, key:Int, clef:Int) : Int
	{
		var scale:Float = (layout.ScoreLineSpacing / 2.00);
		var noteValue:Int = note.RealValue();
		var index:Int = noteValue % 12;
		var step:Int = Math.floor(noteValue / 12);
		var offset:Float = (7 * step) * scale;
		var scoreLineY:Int= key <= 7
							 ? Math.floor((ScoreSharpPositions[index]*scale) - offset)
							 : Math.floor((ScoreFlatPositions[index]*scale) - offset);

		scoreLineY += Math.floor(GsMeasureImpl.ScoreKeyOffsets[clef - 1] * scale);

		return scoreLineY;
	}
	
	public function GetY2(layout:ViewLayout, x:Int, key:Int, clef:Int) : Int
	{
		var MaxDistance:Int = 10;
		var upOffset:Float = GetUpOffset(layout);
		var downOffset:Float = GetDownOffset(layout);
		var y:Int;
		var x1:Int;
		var x2:Int;
		var y1:Int;
		var y2:Int;
		if (Direction == GsVoiceDirection.Down)
		{
			if (MinNote != _firstMinNote && MinNote != _lastMinNote)
			{
				return Math.round(GetY1(layout, MinNote, key, clef) + downOffset);
			}

			y = 0;
			x1 = Math.round(_firstMinNote.PosX() + _firstMinNote.BeatImpl().Spacing());
			x2 = Math.round(_lastMinNote.PosX() + _lastMinNote.BeatImpl().Spacing());
			y1 = Math.round(GetY1(layout, _firstMinNote, key, clef) + downOffset);
			y2 = Math.round(GetY1(layout, _lastMinNote, key, clef) + downOffset);

			if (y1 > y2 && (y1 - y2) > MaxDistance) y2 = (y1 - MaxDistance);
			if (y2 > y1 && (y2 - y1) > MaxDistance) y1 = (y2 - MaxDistance);

			if ((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0)
			{
				y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
			}
			return y1 - y;
		}
		if (MaxNote != _firstMaxNote && MaxNote != _lastMaxNote)
		{
			return Math.round(GetY1(layout, MaxNote, key, clef) - upOffset);
		}
		y = 0;
		x1 = Math.round(_firstMaxNote.PosX() + _firstMaxNote.BeatImpl().Spacing());
		x2 = Math.round(_lastMaxNote.PosX() + _lastMaxNote.BeatImpl().Spacing());
		y1 = Math.round(GetY1(layout, _firstMaxNote, key, clef) - upOffset);
		y2 = Math.round(GetY1(layout, _lastMaxNote, key, clef) - upOffset);

		if (y1 < y2 && (y2 - y1) > MaxDistance) y2 = (y1 + MaxDistance);
		if (y2 < y1 && (y1 - y2) > MaxDistance) y1 = (y2 + MaxDistance);

		if ((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0)
		{
			y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
		}
		return y1 - y;
	}
	
	public static function GetUpOffset(layout:ViewLayout) : Float
	{
		return UpOffset * (layout.ScoreLineSpacing / 8.0);
	}

	public static function GetDownOffset(layout:ViewLayout) : Float
	{
		return DownOffset * (layout.ScoreLineSpacing / 8.0);
	}

}