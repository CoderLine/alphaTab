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
    // ReSharper disable InconsistentNaming
    /// <summary>
    /// Lists all dynamics.
    /// </summary>
    public enum DynamicValue
    {
        /// <summary>
        /// pianississimo (very very soft)
        /// </summary>
        PPP,
        /// <summary>
        /// pianissimo (very soft)
        /// </summary>
        PP, 
        /// <summary>
        /// piano (soft)
        /// </summary>
        P, 
        /// <summary>
        /// mezzo-piano (half soft)
        /// </summary>
        MP, 
        /// <summary>
        /// mezzo-forte (half loud)
        /// </summary>
        MF, 
        /// <summary>
        /// forte (loud)
        /// </summary>
        F, 
        /// <summary>
        /// fortissimo (very loud)
        /// </summary>
        FF, 
        /// <summary>
        /// fortississimo (very very loud)
        /// </summary>
        FFF
    }
    // ReSharper restore InconsistentNaming
}