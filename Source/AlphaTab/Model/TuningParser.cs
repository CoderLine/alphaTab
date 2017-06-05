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
    public class TuningParseResult
    {
        public string Note { get; set; }
        public int NoteValue { get; set; }
        public int Octave { get; set; }

        public int RealValue
        {
            get
            {
                return (Octave * 12) + NoteValue;
            }
        }
    }

    public static class TuningParser
    {
        /// <summary>
        /// Checks if the given string is a tuning inticator.
        /// </summary>Checks if the given string is a tuning inticator.
        /// <param name="name"></param>
        /// <returns></returns>
        public static bool IsTuning(string name)
        {
            return Parse(name) != null;
        }

        public static TuningParseResult Parse(string name)
        {
            string note = "";
            string octave = "";

            for (int i = 0; i < name.Length; i++)
            {
                var c = (int)name[i];
                if (Std.IsCharNumber(c, false))
                {
                    // number without note?
                    if (string.IsNullOrEmpty(note))
                    {
                        return null;
                    }
                    octave += Std.StringFromCharCode(c);
                }
                else if ((c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A) || c == 0x23)
                {
                    note += Std.StringFromCharCode(c);
                }
                else
                {
                    return null;
                }
            }

            if (string.IsNullOrEmpty(octave) || string.IsNullOrEmpty(note))
            {
                return null;
            }

            var result = new TuningParseResult();
            result.Octave = Std.ParseInt(octave) + 1;
            result.Note = note.ToLower();
            result.NoteValue = GetToneForText(result.Note);
            return result;
        }

        public static int GetTuningForText(string str)
        {
            var result = Parse(str);
            if (result == null)
            {
                return -1;
            }

            return result.RealValue;
        }

        public static int GetToneForText(string note)
        {
            int b;
            switch (note.ToLower())
            {
                case "c":
                    b = 0;
                    break;
                case "c#":
                case "db":
                    b = 1;
                    break;
                case "d":
                    b = 2;
                    break;
                case "d#":
                case "eb":
                    b = 3;
                    break;
                case "e":
                    b = 4;
                    break;
                case "f":
                    b = 5;
                    break;
                case "f#":
                case "gb":
                    b = 6;
                    break;
                case "g":
                    b = 7;
                    break;
                case "g#":
                case "ab":
                    b = 8;
                    break;
                case "a":
                    b = 9;
                    break;
                case "a#":
                case "bb":
                    b = 10;
                    break;
                case "b":
                    b = 11;
                    break;
                default:
                    return 0;
            }

            return b;
        }

    }
}
