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
using System;

namespace AlphaTab.Platform.Model
{
    public class Color
    {
        public const string BlackRgb = "#000000";

        public Color(byte r, byte g, byte b, byte a = 0xFF)
        {
            Raw = (a << 24) | (r << 16) | (g << 8) | b;
            if (A == 0xFF)
            {
                RGBA = "#" + Std.ToHexString(R, 2) + Std.ToHexString(G, 2) + Std.ToHexString(B, 2);
            }
            else
            {
                RGBA = "rgba(" + R + "," + G + "," + B + "," + (A / 255.0) + ")";
            }
        }

        public int Raw
        {
            get;
            set;
        }

        public byte A
        {
            get
            {
                return (byte)((Raw >> 24) & 0xFF);
            }
        }

        public byte R
        {
            get
            {
                return (byte)((Raw >> 16) & 0xFF);
            }
        }

        public byte G
        {
            get
            {
                return (byte)((Raw >> 8) & 0xFF);
            }
        }

        public byte B
        {
            get
            {
                return (byte)(Raw & 0xFF);
            }
        }

        public string RGBA
        {
            get; internal set;
        }

    }
}
