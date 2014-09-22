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
using System;
using AlphaTab.Collections;

namespace AlphaTab.Platform.Model
{
    [Flags]
    public enum FontStyle
    {
        Plain = 0,
        Bold = 1,
        Italic = 2
    }

    /// <summary>
    /// This container public class can store the definition for a font and it's style.
    /// </summary>
    public class Font
    {
        public string Family { get; set; }
        public float Size { get; set; }
        public FontStyle Style { get; set; }

        public bool IsBold
        {
            get
            {
                return (Style & FontStyle.Bold) != 0;
            }
        }

        public bool IsItalic
        {
            get
            {
                return (Style & FontStyle.Italic) != 0;
            }
        }

        public Font(string family, float size, FontStyle style = FontStyle.Plain)
        {
            Family = family;
            Size = size;
            Style = style;
        }

        public Font Clone()
        {
            return new Font(Family, Size, Style);
        }

        public string ToCssString()
        {
            var buf = new StringBuilder();

            if (IsBold)
            {
                buf.Append("bold ");
            }
            if (IsItalic)
            {
                buf.Append("italic ");
            }

            buf.Append(Size);
            buf.Append("px ");
            buf.Append("'");
            buf.Append(Family);
            buf.Append("'");

            return buf.ToString();
        }

    }
}
