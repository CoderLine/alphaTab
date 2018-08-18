/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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
namespace AlphaTab.Model
{
    /// <summary>
    /// Lists all durations of a beat.
    /// </summary>
    public enum Duration
    {
        /// <summary>
        /// A quadruple whole note duration 
        /// </summary>
        QuadrupleWhole = -4,
        /// <summary>
        /// A double whole note duration 
        /// </summary>
        DoubleWhole = -2,
        /// <summary>
        /// A whole note duration 
        /// </summary>
        Whole = 1,
        /// <summary>
        /// A 1/2 note duration 
        /// </summary>
        Half = 2,
        /// <summary>
        /// A 1/4 note duration 
        /// </summary>
        Quarter = 4,
        /// <summary>
        /// A 1/8 note duration 
        /// </summary>
        Eighth = 8,
        /// <summary>
        /// A 1/16 note duration 
        /// </summary>
        Sixteenth = 16,
        /// <summary>
        /// A 1/32 note duration 
        /// </summary>
        ThirtySecond = 32,
        /// <summary>
        /// A 1/64 note duration 
        /// </summary>
        SixtyFourth = 64,
        /// <summary>
        /// A 1/128 note duration 
        /// </summary>
        OneHundredTwentyEighth = 128,
        /// <summary>
        /// A 1/256 note duration 
        /// </summary>
        TwoHundredFiftySixth = 256
    }
}