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
namespace AlphaTab.Model
{
    /// <summary>
    /// Lists all durations of a beat.
    /// </summary>
    public enum Duration
    {
        QuadrupleWhole = -4, 
        DoubleWhole = -2, 
        Whole = 1, 
        Half = 2, 
        Quarter = 4, 
        Eighth = 8,  
        Sixteenth = 16, 
        ThirtySecond = 32,
        SixtyFourth = 64,
        OneHundredTwentyEighth = 128,
        TwoHundredFiftySixth = 256
    }
}