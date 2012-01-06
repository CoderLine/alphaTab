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
package alphatab.midi;
import alphatab.model.Duration;
import alphatab.model.MeasureHeader;
import alphatab.model.Song;

/**
 * This controller provides correct the measure indexes. (Repeating)
 */
class MidiRepeatController 
{
    private var _count:Int;
    private var _song:Song;

    private var _lastIndex:Int;
    private var _repeatAlternative:Int;
    private var _repeatEnd:Int;
    private var _repeatNumber:Int;
    private var _repeatOpen:Bool;
    private var _repeatStart:Int;
    private var _repeatStartIndex:Int;
    
    public var index(default,default):Int;
    public var repeatMove(default,default):Int;
    public var shouldPlay(default,default):Bool;

    public function new(song:Song)
    {
        _song = song;
        _count = song.measureHeaders.length;
        index = 0;
        _lastIndex = -1;
        shouldPlay = true;
        _repeatOpen = true;
        _repeatAlternative = 0;
        _repeatStart = Duration.QUARTER_TIME;
        _repeatEnd = 0;
        repeatMove = 0;
        _repeatStartIndex = 0;
        _repeatNumber = 0;
    }
    
    public function finished() : Bool
    {
        return (index >= _count); 
    }


    public function process() : Void
    {
        var header:MeasureHeader = _song.measureHeaders[index];
        shouldPlay = true;
        if (header.isRepeatOpen)
        {
            _repeatStartIndex = index;
            _repeatStart = header.start;
            _repeatOpen = true;
            if (index > _lastIndex)
            {
                _repeatNumber = 0;
                _repeatAlternative = 0;
            }
        }
        else
        {
            if (_repeatAlternative == 0)
            {
                _repeatAlternative = header.repeatAlternative;
            }
            if ((_repeatOpen && (_repeatAlternative > 0)) && ((_repeatAlternative & (1 << _repeatNumber)) == 0))
            {
                repeatMove -= header.length();
                if (header.repeatClose > 0)
                {
                    _repeatAlternative = 0;
                }
                shouldPlay = false;
                index++;
                return;
            }
        }
        _lastIndex = Math.round(Math.max(_lastIndex, index));
        if (_repeatOpen && (header.repeatClose > 0))
        {
            if ((_repeatNumber < header.repeatClose) || (_repeatAlternative > 0))
            {
                _repeatEnd = header.start + header.length();
                repeatMove += _repeatEnd - _repeatStart;
                index = _repeatStartIndex - 1;
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
        index++;
    }
}