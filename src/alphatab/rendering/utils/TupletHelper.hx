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
package alphatab.rendering.utils;

import alphatab.model.Beat;

class TupletHelper
{
    public var beats:Array<Beat>;
    public var voiceIndex:Int;
    public var tuplet : Int;
    
    private var _isFinished:Bool;

    public function new(voice:Int) 
    {
        voiceIndex = voice;
        beats = new Array<Beat>();
    }
        
    public inline function isFull()
    {
        return beats.length == tuplet;
    }
    
    public function finish()
    {
        _isFinished = true;
    }
    
    public function check(beat:Beat) : Bool
    {
        if (beats.length == 0)
        { 
            tuplet = beat.tupletNumerator;
        }
        else
        {
            if (beat.voice.index != voiceIndex || beat.tupletNumerator != tuplet || isFull() || _isFinished) return false;
        }
        beats.push(beat);        
        return true;
    }    
}