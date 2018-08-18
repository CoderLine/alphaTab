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
    /// Lists all harmonic types.
    /// </summary>
    public enum HarmonicType
    {
        /// <summary>
        /// No harmonics. 
        /// </summary>
        None, 
        /// <summary>
        /// Natural harmonic
        /// </summary>
        Natural, 
        /// <summary>
        /// Artificial harmonic
        /// </summary>
        Artificial, 
        /// <summary>
        /// Pinch harmonics
        /// </summary>
        Pinch, 
        /// <summary>
        /// Tap harmonics
        /// </summary>
        Tap, 
        /// <summary>
        /// Semi harmonics
        /// </summary>
        Semi, 
        /// <summary>
        /// Feedback harmonics
        /// </summary>
        Feedback
    }
}