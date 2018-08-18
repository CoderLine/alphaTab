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
    /// This public class is used to describe the beginning of a 
    /// section within a song. It acts like a marker. 
    /// </summary>
    public class Section
    {
        /// <summary>
        /// Gets or sets the marker ID for this section. 
        /// </summary>
        public string Marker { get; set; }
        /// <summary>
        /// Gets or sets the descriptional text of this section.
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="Section"/> class.
        /// </summary>
        public Section()
        {
            Text = Marker = "";
        }

        internal static void CopyTo(Section src, Section dst)
        {
            dst.Marker = src.Marker;
            dst.Text = src.Text;
        }
    }
}