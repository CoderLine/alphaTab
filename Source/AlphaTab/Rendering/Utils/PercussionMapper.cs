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
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    public class PercussionMapper
    {
        private static readonly int[][] ElementVariationToMidi =
        {        
            new []{35, 35, 35}, // [ 0] - [0] Kick (hit)
            new []{38, 38, 37}, // [ 1] - [0] Snare (hit), [1] Snare (rim shot), [2] Snare (side stick)
            new []{56, 56, 56}, // [ 2] - [0] Cowbell low (hit)
            new []{56, 56, 56}, // [ 3] - [0] Cowbell medium (hit)
            new []{56, 56, 56}, // [ 4] - [0] Cowbell high (hit)
            new []{41, 41, 41}, // [ 5] - [0] Tom very low (hit)
            new []{43, 43, 43}, // [ 6] - [0] Tom low (hit)
            new []{45, 45, 45}, // [ 7] - [0] Tom medium (hit)
            new []{47, 47, 47}, // [ 8] - [0] Tom high (hit)
            new []{48, 48, 48}, // [ 9] - [0] Tom very high (hit)
            new []{42, 46, 46}, // [10] - [0] Hihat (closed), [1] Hihat (half), [2] Hihat (open)
            new []{44, 44, 44}, // [11] - [0] Pedal hihat
            new []{49, 49, 49}, // [12] - [0] Crash medium (hit)
            new []{57, 57, 57}, // [13] - [0] Crash high (hit)
            new []{55, 55, 55}, // [14] - [0] Splash (hit)
            new []{51, 59, 53}, // [15] - [0] Ride (middle), [1] Ride (edge), [2] Ride (bell)
            new []{52, 52, 52}  // [16] - [0] China (hit)
        };

        public static int MidiFromElementVariation(Note note)
        {
            return ElementVariationToMidi[note.Element][note.Variation];
        }

        /// <summary>
        /// Maps the given note to a normal note value to place the note at the 
        /// correct line on score notation
        /// </summary>
        /// <param name="note"></param>
        /// <returns></returns>
        public static int MapNoteForDisplay(Note note)
        {
            var value = note.RealValue;
            if (value == 61 || value == 66)
            {
                return 50;
            }
            else if (value == 60 || value == 65)
            {
                return 52;
            }
            else if ((value >= 35 && value <= 36) || value == 44)
            {
                return 53;
            }
            else if (value == 41 || value == 64)
            {
                return 55;
            }
            else if (value == 43 || value == 62)
            {
                return 57;
            }
            else if (value == 45 || value == 63)
            {
                return 59;
            }
            else if (value == 47 || value == 54)
            {
                return 62;
            }
            else if (value == 48 || value == 56)
            {
                return 64;
            }
            else if (value == 50)
            {
                return 65;
            }
            else if (value == 42 || value == 46 || (value >= 49 && value <= 53) || value == 57 || value == 59)
            {
                return 67;
            }
            return 60;
        }
    }
}
