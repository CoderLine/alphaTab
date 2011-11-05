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
 * A chord annotation for beats
 */
class Chord
{
    public var beat(default,default):Beat;
    public var firstFret(default,default):Int;
    public var strings(default,default):Array<Int>;    
    public var name(default,default):String;
    
    public function stringCount() : Int
    {
        return strings.length;
    }
    
    public function noteCount() : Int
    {
        var count:Int = 0;
        for(i in 0 ... strings.length)
        {
            if(strings[i] >= 0)
                count++;
        }
        return count;
    }
    
    public function new(length:Int)
    {
        strings = new Array<Int>();
        for(i in 0 ... length)
        {
            strings.push(-1);
        }
    }
}