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

namespace AlphaTab.Model
{
    /// <summary>
    /// A single point of a bending graph. Used to 
    /// describe WhammyBar and String Bending effects.
    /// </summary>
    public class BendPoint
    {
        /// <summary>
        /// The maximum offset for points
        /// </summary>
        public const int MaxPosition = 60;
        /// <summary>
        /// The maximum value for points. 
        /// </summary>
        public const int MaxValue = 12;

        /// <summary>
        /// Gets or sets offset of the point relative to the note duration (0-60)
        /// </summary>
        public int Offset { get; set; }
        /// <summary>
        /// Gets or sets the 1/4 note value offsets for the bend. 
        /// </summary>
        public int Value { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="BendPoint"/> class.
        /// </summary>
        /// <param name="offset">The offset.</param>
        /// <param name="value">The value.</param>
        public BendPoint(int offset = 0, int value = 0)
        { 
            Offset = offset;
            Value = value;
        }

        internal static void CopyTo(BendPoint src, BendPoint dst)
        {
            dst.Offset = src.Offset;
            dst.Value = src.Value;
        }

        internal BendPoint Clone()
        {
            var point = new BendPoint();
            CopyTo(this, point);
            return point;
        }
    }
}