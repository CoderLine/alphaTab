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
 * represents a n:m tuplet
 */
class Tuplet
{
    public static inline var NORMAL:Tuplet = new Tuplet();
    
    public var enters(default,default):Int;
    public var times(default,default):Int;
    
    public function new()
    {
        enters = 1;
        times = 1;
    }
    
    public function copy(tuplet:Tuplet) : Void
    {
        tuplet.enters = enters;
        tuplet.times = times;
    }
    
    public function convertTime(time:Int) : Int
    {
        return Math.floor(time * times / enters);
    }
    
    public function equals(tuplet:Tuplet) : Bool
    {
        return enters == tuplet.enters && times == tuplet.times;
    }
        
    public function clone(factory:SongFactory) : Tuplet
    {
        var tuplet:Tuplet = factory.newTuplet();
        copy(tuplet);
        return tuplet;
    }
}