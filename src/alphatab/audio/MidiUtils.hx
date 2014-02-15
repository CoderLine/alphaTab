/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
package alphatab.audio;

import alphatab.audio.generator.MidiPlaybackController;
import alphatab.audio.model.MidiTickLookup;
import alphatab.model.Duration;
import alphatab.model.DynamicValue;
import alphatab.model.MasterBar;
import alphatab.model.Score;
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
    
    private static inline var MinVelocity :Int = 15;
    private static inline var VelocityIncrement :Int = 16;

    public static function dynamicToVelocity(dynamicValue:DynamicValue)
    {
        return (MinVelocity + (Type.enumIndex(dynamicValue) * VelocityIncrement));
        // switch(dynamicValue)
        // {
        //     case PPP:   return (MinVelocity + (0 * VelocityIncrement));
        //     case PP:    return (MinVelocity + (1 * VelocityIncrement));
        //     case P:     return (MinVelocity + (2 * VelocityIncrement));
        //     case MP:    return (MinVelocity + (3 * VelocityIncrement));
        //     case MF:    return (MinVelocity + (4 * VelocityIncrement));
        //     case F:     return (MinVelocity + (5 * VelocityIncrement));
        //     case FF:    return (MinVelocity + (6 * VelocityIncrement));
        //     case FFF:   return (MinVelocity + (7 * VelocityIncrement));
        // }
    }
    
    public static function buildTickLookup(score:Score)
    {
        var lookup = new MidiTickLookup();
        
        var controller = new MidiPlaybackController(score);
        var tick:Int = 0;
        while (!controller.finished())
        {
            var index = controller.index;
            var repeatMove = controller.repeatMove;
            controller.process();
            
            if (controller.shouldPlay)
            {
                var bar = new BarTickLookup();
                bar.bar = score.masterBars[index];
                bar.start = controller.repeatMove + bar.bar.start;
                bar.end = bar.start + bar.bar.calculateDuration();
                lookup.bars.push(bar);
            }
        }
        
        return lookup;
    }
}