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

using AlphaTab.Platform;

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class contains some utilities for working with model public classes
    /// </summary>
    public static class ModelUtils
    {
        public static int GetIndex(this Duration duration)
        {
            var index = 0;
            var value = (int)duration;
            if (value < 0)
            {
                return index;
            }

            return (int)Std.Log2((int)duration);
        }

        // TODO: Externalize this into some model public class
        public static bool KeySignatureIsFlat(int ks)
        {
            return ks < 0;
        }

        public static bool KeySignatureIsNatural(int ks)
        {
            return ks == 0;
        }

        public static bool KeySignatureIsSharp(int ks)
        {
            return ks > 0;
        }

        public static void ApplyPitchOffsets(Settings settings, Score score)
        {
            for (var i = 0; i < score.Tracks.Count; i++)
            {
                if (i < settings.DisplayTranspositionPitches.Length)
                {
                    score.Tracks[i].DisplayTranspositionPitch = -settings.DisplayTranspositionPitches[i];
                }
                if (i < settings.TranspositionPitches.Length)
                {
                    score.Tracks[i].TranspositionPitch = -settings.TranspositionPitches[i];
                }
            }
        }
    }
}