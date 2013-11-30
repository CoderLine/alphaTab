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
package alphatab.model;

/**
 * A voice represents a group of beats 
 * that can be played during a bar. 
 */
class Voice 
{
    public var index:Int;
    
    public var bar:Bar;
    public var beats:Array<Beat>;
    
    public function new() 
    {
        beats = new Array<Beat>();
    }
    
    public function addBeat(beat:Beat)
    {
        beat.voice = this;
        beat.index = beats.length;
        beats.push(beat);
    }
    
    public function addGraceBeat(beat:Beat)
    {
        if (beats.length == 0) 
        {
            addBeat(beat);
            return;
        }
        
        // remove last beat
        var lastBeat = beats.splice(beats.length - 1, 1)[0];
        
        // insert grace beat
        addBeat(beat);
        // reinsert last beat
        addBeat(lastBeat);
    }
    
    public function isEmpty() : Bool
    {
        return beats.length == 0;
    }    
}