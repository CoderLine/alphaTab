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
    /// This public enum lists all different types of finger slides on a string.
    /// </summary>
    public enum SlideType
    {
        /// <summary>
        /// No slide. 
        /// </summary>
        None, 
        /// <summary>
        /// Shift slide to next note on same string
        /// </summary>
        Shift, 
        /// <summary>
        /// Legato slide to next note on same string. 
        /// </summary>
        Legato, 
        /// <summary>
        /// Slide into the note from below on the same string.
        /// </summary>
        IntoFromBelow,
        /// <summary>
        /// Slide into the note from above on the same string.
        /// </summary>
        IntoFromAbove,
        /// <summary>
        /// Slide out from the note from upwards on the same string.
        /// </summary>
        OutUp,
        /// <summary>
        /// Slide out from the note from downwards on the same string.
        /// </summary>
        OutDown,
        /// <summary>
        /// Pickslide down on this note
        /// </summary>
        PickSlideDown,
        /// <summary>
        /// Pickslide up on this note
        /// </summary>
        PickSlideUp
    }
}