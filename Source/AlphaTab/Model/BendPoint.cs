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
    /// A single point of a bending graph. Used to 
    /// describe WhammyBar and String Bending effects.
    /// </summary>
    public class BendPoint
    {
        public const int MaxPosition = 60;
        public const int MaxValue = 12;

        public int Offset { get; set; }
        public int Value { get; set; }

        public BendPoint(int offset = 0, int value = 0)
        { 
            Offset = offset;
            Value = value;
        }

        public static void CopyTo(BendPoint src, BendPoint dst)
        {
            dst.Offset = src.Offset;
            dst.Value = src.Value;
        }

        public BendPoint Clone()
        {
            var point = new BendPoint();
            CopyTo(this, point);
            return point;
        }
    }
}