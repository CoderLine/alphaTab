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
package alphatab.audio;

import alphatab.model.Duration;
using alphatab.model.ModelUtils;

/**
 * This class contains some utility stuff for working with 
 * the midi system.
 */
class MidiUtils 
{
    /**
     * The amount of ticks per quarter note used within this midi system.
     * (Pulses Per Quarter Note)
     */
    public static inline var QuarterTime:Int = 960;
    
    /**
     * The default midi channel used for percussion
     */
    public static inline var PercussionChannel:Int = 9;
    
    /**
     * Converts a duration value to its ticks equivalent.
     */
    public static function durationToTicks(value:Duration)
    {      
        return valueToTicks(value.getDurationValue());
    }    
    
    /**
     * Converts a numerical value to its ticks equivalent.
     * @param value the numerical proportion to convert. (i.E. timesignature denominator, note duration,...)
     */
    public static function valueToTicks(value:Int)
    {
        return Std.int(QuarterTime * (4.0 / value));
    }
    
    public static function applyDot(ticks:Int, doubleDotted:Bool)
    {
        if (doubleDotted)  
        {
            return ticks + Std.int((ticks / 4) * 3);
        }
        else
        {
            return ticks + Std.int(ticks / 2);
        }
    }
    
    public static function applyTuplet(ticks:Int, numerator:Int, denominator:Int)
    {
        return Std.int(ticks * denominator / numerator);
    }
}