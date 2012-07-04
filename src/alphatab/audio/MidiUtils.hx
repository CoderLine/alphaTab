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
    public static inline var QUARTER_TIME:Int = 960;
    
    /**
     * Converts a duration value to its ticks equivalent.
     */
    public static function durationToTicks(value:Duration)
    {      
        return valueToTicks(value.getDurationValue());
    }    
    
    /**
     * Converts a numerical value to its ticks equivalent.
     * @param value the numerical proportion to convert. (i.E. timesignature tenominator, note duration,...)
     */
    public static function valueToTicks(value:Int)
    {
        return Std.int(QUARTER_TIME * (4.0 / value));
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
        return Std.int(ticks * numerator / denominator);
    }
}