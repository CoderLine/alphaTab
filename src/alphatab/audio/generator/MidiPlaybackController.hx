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
package alphatab.audio.generator;
import alphatab.model.Score;

class MidiPlaybackController
{
    private var _score:Score;
    
    private var _lastIndex:Int;
    private var _repeatAlternative:Int;
    private var _repeatStart:Int;
    private var _repeatStartIndex:Int;
    private var _repeatNumber:Int;
    private var _repeatEnd:Int;
    private var _repeatOpen:Bool;

    public var shouldPlay:Bool;
    public var repeatMove:Int;
    public var index:Int;
    
    public function new(score:Score) 
    {
        _score = score;
        
        shouldPlay = true;
        repeatMove = 0;
        index = 0;
    }
    
    public inline function finished() :Bool
    {
        return index >= _score.masterBars.length;
    }
    
    public function process()
    {
        var masterBar = _score.masterBars[index];
        
		// if the repeat group wasn't closed we reset the repeating 
		// on the last group opening
		if (!masterBar.repeatGroup.isClosed && masterBar.repeatGroup.openings[masterBar.repeatGroup.openings.length -1] == masterBar)
		{
			_repeatStart = 0;
			_repeatNumber = 0;
			_repeatEnd = 0;
			_repeatOpen = false;
		}
		
        if (masterBar.isRepeatStart)
        {
            _repeatStartIndex = index;
            _repeatStart = masterBar.start;
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
                _repeatAlternative = masterBar.alternateEndings;
            }
            if ((_repeatOpen && (_repeatAlternative > 0)) && ((_repeatAlternative & (1 << _repeatNumber)) == 0))
            {
                repeatMove -= masterBar.calculateDuration();
                if (masterBar.repeatCount > 0)
                {
                    _repeatAlternative = 0;
                }
                shouldPlay = false;
                index++;
                return;
            }
        }
        _lastIndex = Std.int(Math.max(_lastIndex, index));
        if (_repeatOpen && (masterBar.repeatCount > 0))
        {
            if ((_repeatNumber < masterBar.repeatCount) || (_repeatAlternative > 0))
            {
                _repeatEnd = masterBar.start + masterBar.calculateDuration();
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