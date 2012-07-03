package alphatab.audio;
import alphatab.model.Duration;

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
        var numerical = 1;
        switch(value)
        {
            case Whole: numerical = 1;
            case Half: numerical = 2;
            case Quarter: numerical = 4;
            case Eighth: numerical = 8;
            case Sixteenth: numerical = 16;
            case ThirtySecond: numerical = 32;
            case SixtyFourth: numerical = 64;
        }        
        return valueToTicks(numerical);
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