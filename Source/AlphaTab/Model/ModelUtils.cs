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

using AlphaTab.Audio;

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class contains some utilities for working with model public classes
    /// </summary>
    static class ModelUtils
    {
        public static int GetIndex(this Duration duration)
        {
            var index = 0;
            var value = (int)duration;
            if (value < 0)
            {
                return index;
            }

            return (int)Platform.Platform.Log2((int)duration);
        }

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
                    foreach (var staff in score.Tracks[i].Staves)
                    {
                        staff.DisplayTranspositionPitch = -settings.DisplayTranspositionPitches[i];
                    }
                }
                if (i < settings.TranspositionPitches.Length)
                {
                    foreach (var staff in score.Tracks[i].Staves)
                    {
                        staff.TranspositionPitch = -settings.TranspositionPitches[i];
                    }
                }
            }
        }

        public static string FingerToString(Settings settings, Beat beat, Fingers finger, bool leftHand)
        {
            if (settings.ForcePianoFingering || GeneralMidi.IsPiano(beat.Voice.Bar.Staff.Track.PlaybackInfo.Program))
            {
                switch (finger)
                {
                    case Fingers.Unknown:
                    case Fingers.NoOrDead:
                        return null;
                    case Fingers.Thumb:
                        return "1";
                    case Fingers.IndexFinger:
                        return "2";
                    case Fingers.MiddleFinger:
                        return "3";
                    case Fingers.AnnularFinger:
                        return "4";
                    case Fingers.LittleFinger:
                        return "5";
                    default:
                        return null;
                }
            }
            else if (leftHand)
            {
                switch (finger)
                {
                    case Fingers.Unknown:
                    case Fingers.NoOrDead:
                        return "0";
                    case Fingers.Thumb:
                        return "T";
                    case Fingers.IndexFinger:
                        return "1";
                    case Fingers.MiddleFinger:
                        return "2";
                    case Fingers.AnnularFinger:
                        return "3";
                    case Fingers.LittleFinger:
                        return "4";
                    default:
                        return null;
                }
            }
            else
            {
                switch (finger)
                {
                    case Fingers.Unknown:
                    case Fingers.NoOrDead:
                        return null;
                    case Fingers.Thumb:
                        return "p";
                    case Fingers.IndexFinger:
                        return "i";
                    case Fingers.MiddleFinger:
                        return "m";
                    case Fingers.AnnularFinger:
                        return "a";
                    case Fingers.LittleFinger:
                        return "c";
                    default:
                        return null;
                }
            }
        }
    }
}