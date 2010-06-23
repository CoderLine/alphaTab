/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.midi;
import net.coderline.jsgs.model.GsMeasureHeader;
import net.coderline.jsgs.model.GsSong;

class MidiRepeatController 
{
	private var _count:Int;
	private var _song:GsSong;

	private var _lastIndex:Int;
	private var _repeatAlternative:Int;
	private var _repeatEnd:Int;
	private var _repeatNumber:Int;
	private var _repeatOpen:Bool;
	private var _repeatStart:Int;
	private var _repeatStartIndex:Int;

	public function new(song:GsSong)
	{
		_song = song;
		_count = song.MeasureHeaders.length;
		Index = 0;
		_lastIndex = -1;
		ShouldPlay = true;
		_repeatOpen = true;
		_repeatAlternative = 0;
		_repeatStart = 960;
		_repeatEnd = 0;
		RepeatMove = 0;
		_repeatStartIndex = 0;
		_repeatNumber = 0;
	}
	public function Finished() : Bool
	{
		return (Index >= _count); 
	}
	public var Index:Int;

	public var RepeatMove:Int;

	public var ShouldPlay:Bool;

	public function Process() : Void
	{
		var header:GsMeasureHeader = _song.MeasureHeaders[Index];
		ShouldPlay = true;
		if (header.IsRepeatOpen)
		{
			_repeatStartIndex = Index;
			_repeatStart = header.Start;
			_repeatOpen = true;
			if (Index > _lastIndex)
			{
				_repeatNumber = 0;
				_repeatAlternative = 0;
			}
		}
		else
		{
			if (_repeatAlternative == 0)
			{
				_repeatAlternative = header.RepeatAlternative;
			}
			if ((_repeatOpen && (_repeatAlternative > 0)) && ((_repeatAlternative & (1 << _repeatNumber)) == 0))
			{
				RepeatMove -= header.Length();
				if (header.RepeatClose > 0)
				{
					_repeatAlternative = 0;
				}
				ShouldPlay = false;
				Index++;
				return;
			}
		}
		_lastIndex = Math.round(Math.max(_lastIndex, Index));
		if (_repeatOpen && (header.RepeatClose > 0))
		{
			if ((_repeatNumber < header.RepeatClose) || (_repeatAlternative > 0))
			{
				_repeatEnd = header.Start + header.Length();
				RepeatMove += _repeatEnd - _repeatStart;
				Index = _repeatStartIndex - 1;
				_repeatNumber++;
			}
			else
			{
				_repeatStart = 0;
				_repeatNumber = 0;
				_repeatEnd = 0;
				_repeatOpen = false;
			}
			_repeatAlternative = 0;
		}
		Index++;
	}
}