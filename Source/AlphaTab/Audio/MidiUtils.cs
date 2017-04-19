/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Model;
using AlphaTab.Model;

namespace AlphaTab.Audio
{
    public static class MidiUtils
    {
        /// <summary>
        /// The amount of ticks per quarter note used within this midi system.
        /// (Pulses Per Quarter Note)
        /// </summary>
        public const int QuarterTime = 960;

        /// <summary>
        /// The default midi channel used for percussion
        /// </summary>
        public const int PercussionChannel = 9;

        private const int MinVelocity = 15;
        private const int VelocityIncrement = 16;


        /// <summary>
        /// Converts a duration value to its ticks equivalent.
        /// </summary>
        /// <param name="duration"></param>
        /// <returns></returns>
        public static int TicksToMillis(int ticks, int tempo)
        {
            return (int)(ticks * (60000.0 / (tempo * QuarterTime)));
        }



        /// <summary>
        /// Converts a duration value to its ticks equivalent.
        /// </summary>
        /// <param name="duration"></param>
        /// <returns></returns>
        public static int ToTicks(this Duration duration)
        {
            return ValueToTicks((int)duration);
        }

        /// <summary>
        /// Converts a numerical value to its ticks equivalent.
        /// </summary>
        /// <param name="duration">the numerical proportion to convert. (i.E. timesignature denominator, note duration,...)</param>
        /// <returns></returns>
        public static int ValueToTicks(int duration)
        {
            float denomninator = duration;
            if (denomninator < 0)
            {
                denomninator = 1 / -denomninator;
            }
            return (int)(QuarterTime * (4.0 / denomninator));
        }

        public static int ApplyDot(int ticks, bool doubleDotted)
        {
            if (doubleDotted)
            {
                return ticks + (ticks / 4) * 3;
            }
            return ticks + ticks / 2;
        }

        public static int ApplyTuplet(int ticks, int numerator, int denominator)
        {
            return ticks * denominator / numerator;
        }

        public static int DynamicToVelocity(DynamicValue dyn)
        {
            return (MinVelocity + ((int)(dyn) * VelocityIncrement));
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
    }
}
