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
    public enum Fingers
    {
        /// <summary>
        /// Unknown type (not documented)
        /// </summary>
        Unknown = -2,
        /// <summary>
        /// No finger, dead note
        /// </summary>
        NoOrDead = -1,
        /// <summary>
        /// The thumb
        /// </summary>
        Thumb = 0,
        /// <summary>
        /// The index finger
        /// </summary>
        IndexFinger = 1,
        /// <summary>
        /// The middle finger
        /// </summary>
        MiddleFinger = 2,
        /// <summary>
        /// The annular finger
        /// </summary>
        AnnularFinger = 3,
        /// <summary>
        /// The little finger
        /// </summary>
        LittleFinger = 4
    }
}