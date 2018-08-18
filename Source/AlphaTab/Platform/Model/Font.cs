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

using AlphaTab.Collections;

namespace AlphaTab.Platform.Model
{
    /// <summary>
    /// This container public class can store the definition for a font and it's style.
    /// </summary>
    public class Font
    {
        private readonly string _css;

        /// <summary>
        /// Gets or sets the font family name. 
        /// </summary>
        public string Family { get; set; }
        /// <summary>
        /// Gets or sets the font size in pixels. 
        /// </summary>
        public float Size { get; set; }
        /// <summary>
        /// Gets or sets the font style. 
        /// </summary>
        public FontStyle Style { get; set; }

        /// <summary>
        /// Gets a value indicating whether the font is bold. 
        /// </summary>
        public bool IsBold => (Style & FontStyle.Bold) != 0;

        /// <summary>
        /// Gets a value indicating whether the font is italic. 
        /// </summary>
        public bool IsItalic => (Style & FontStyle.Italic) != 0;

        /// <summary>
        /// Initializes a new instance of the <see cref="Font"/> class.
        /// </summary>
        /// <param name="family">The family.</param>
        /// <param name="size">The size.</param>
        /// <param name="style">The style.</param>
        public Font(string family, float size, FontStyle style = FontStyle.Plain)
        {
            Family = family;
            Size = size;
            Style = style;
            _css = ToCssString();
        }

        internal Font Clone()
        {
            return new Font(Family, Size, Style);
        }

        internal string ToCssString(float scale = 1)
        {
            if (_css != null && scale == 1)
            {
                return _css;
            }

            var buf = new StringBuilder();

            if (IsBold)
            {
                buf.Append("bold ");
            }
            if (IsItalic)
            {
                buf.Append("italic ");
            }

            buf.Append(Size * scale);
            buf.Append("px ");
            buf.Append("'");
            buf.Append(Family);
            buf.Append("'");

            return buf.ToString();
        }
    }
}
