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
    /// This public enumeration lists all available key signatures
    /// </summary>
    public enum KeySignature
    {
        /// <summary>
        /// Cb (7 flats)
        /// </summary>
        Cb = -7,
        /// <summary>
        /// Gb (6 flats)
        /// </summary>
        Gb = -6,
        /// <summary>
        /// Db (5 flats)
        /// </summary>
        Db = -5,
        /// <summary>
        /// Ab (4 flats)
        /// </summary>
        Ab = -4,
        /// <summary>
        /// Eb (3 flats)
        /// </summary>
        Eb = -3,
        /// <summary>
        /// Bb (2 flats)
        /// </summary>
        Bb = -2,
        /// <summary>
        /// F (1 flat)
        /// </summary>
        F = -1,
        /// <summary>
        /// C (no signs)
        /// </summary>
        C = 0,
        /// <summary>
        /// G (1 sharp)
        /// </summary>
        G = 1,
        /// <summary>
        /// D (2 sharp)
        /// </summary>
        D = 2,
        /// <summary>
        /// A (3 sharp)
        /// </summary>
        A = 3,
        /// <summary>
        /// E (4 sharp)
        /// </summary>
        E = 4,
        /// <summary>
        /// B (5 sharp)
        /// </summary>
        B = 5,
        /// <summary>
        /// F# (6 sharp)
        /// </summary>
        FSharp = 6,
        /// <summary>
        /// C# (8 sharp)
        /// </summary>
        CSharp = 7
    }
    /// <summary>
    /// This public enumeration lists all available types of KeySignatures
    /// </summary>
    public enum KeySignatureType
    {
        /// <summary>
        /// Major
        /// </summary>
        Major,
        /// <summary>
        /// Minor
        /// </summary>
        Minor
    }
}
