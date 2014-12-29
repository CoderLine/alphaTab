/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.Collections;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Utils
{
    /// <summary>
    /// A utility which can parse and deliver single tokens from a svg pathdata string
    /// </summary>
    public class SvgPathParser
    {
        private int _currentIndex;

        public string Svg { get; set; }
        public string LastCommand { get; set; }
        public string CurrentToken { get; set; }

        public SvgPathParser(string svg)
        {
            Svg = svg;
        }

        public void Reset()
        {
            _currentIndex = 0;
            NextToken();
        }

        public bool Eof
        {
            get
            {
                return _currentIndex >= Svg.Length;
            }
        }

        public string GetString()
        {
            var t = CurrentToken;
            NextToken();
            return t;
        }

        public float GetNumber()
        {
            return Std.ParseFloat(GetString());
        }

        public bool CurrentTokenIsNumber
        {
            get
            {
                return Std.IsStringNumber(CurrentToken);
            }
        }

        public int NextChar()
        {
            if (Eof) return 0;
            return Svg[_currentIndex++];
        }

        public int PeekChar()
        {
            if (Eof) return 0;
            return Svg[_currentIndex];
        }

        public void NextToken()
        {
            var token = new StringBuilder();

            int c;
            bool skipChar;

            // skip leading spaces and separators
            do
            {
                c = NextChar();
                skipChar = Std.IsWhiteSpace(c) || c == 0x20;
            } while (!Eof && skipChar);

            // read token itself 
            if (!Eof || !skipChar)
            {
                token.AppendChar(c);
                if (Std.IsCharNumber(c)) // do we have a number?
                {
                    c = PeekChar(); // get first upcoming character
                    while (!Eof && (Std.IsCharNumber(c, false) || c == 0x2E)) // while we have number characters add them 
                    {
                        token.AppendChar(NextChar());
                        // peek next character for check
                        c = PeekChar();
                    }
                }
                else
                {
                    LastCommand = token.ToString();
                }
            }

            CurrentToken = token.ToString();
        }
    }
}
