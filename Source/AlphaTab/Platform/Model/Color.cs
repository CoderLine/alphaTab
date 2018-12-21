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

namespace AlphaTab.Platform.Model
{
    /// <summary>
    /// A color object which allows accessing each color component individually. 
    /// </summary>
    public class Color
    {
        /// <summary>
        /// Gets the hex string for black. 
        /// </summary>
        public const string BlackRgb = "#000000";

        /// <summary>
        /// Initializes a new instance of the <see cref="Color"/> class.
        /// </summary>
        /// <param name="r">The red component.</param>
        /// <param name="g">The green component.</param>
        /// <param name="b">The blue component.</param>
        /// <param name="a">The alpha component.</param>
        public Color(byte r, byte g, byte b, byte a = 0xFF)
        {
            Raw = (a << 24) | (r << 16) | (g << 8) | b;
            UpdateRgba();
        }

        internal void UpdateRgba()
        {
            if (A == 0xFF)
            {
                RGBA = "#" + Platform.ToHexString(R, 2) + Platform.ToHexString(G, 2) + Platform.ToHexString(B, 2);
            }
            else
            {
                RGBA = "rgba(" + R + "," + G + "," + B + "," + (A / 255.0) + ")";
            }
        }

        /// <summary>
        /// Gets or sets the raw RGBA value. 
        /// </summary>
        public int Raw
        {
            get;
            internal set;
        }

        /// <summary>
        /// Gets or sets the alpha component of the color. 
        /// </summary>
        public byte A => (byte)((Raw >> 24) & 0xFF);

        /// <summary>
        /// Gets or sets the red component of the color. 
        /// </summary>
        public byte R => (byte)((Raw >> 16) & 0xFF);

        /// <summary>
        /// Gets or sets the green component of the color. 
        /// </summary>
        public byte G => (byte)((Raw >> 8) & 0xFF);

        /// <summary>
        /// Gets or sets the blue component of the color. 
        /// </summary>
        public byte B => (byte)(Raw & 0xFF);

        /// <summary>
        /// Gets the RGBA hex string to use in CSS areas. 
        /// </summary>
        public string RGBA
        {
            get; internal set;
        }

        internal static Color Random(byte opacity = 100)
        {
            return new Color((byte)Platform.Random(255),
                (byte)Platform.Random(255),
                (byte)Platform.Random(255),
                opacity);
        }
    }
}
