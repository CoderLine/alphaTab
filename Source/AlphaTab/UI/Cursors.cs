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
namespace AlphaTab.UI
{
    /// <summary>
    /// This wrapper holds all cursor related elements. 
    /// </summary>
    public class Cursors
    {
        /// <summary>
        /// Gets the element that spans across the whole music sheet and holds the other cursor elements.  
        /// </summary>
        public IContainer CursorWrapper { get; }
        /// <summary>
        /// Gets the element that is positioned above the bar that is currently played. 
        /// </summary>
        public IContainer BarCursor { get; }
        /// <summary>
        /// Gets the element that is positioned above the beat that is currently played. 
        /// </summary>
        public IContainer BeatCursor { get; }
        /// <summary>
        /// Gets the element that spans across the whole music sheet and will hold any selection related elements. 
        /// </summary>
        public IContainer SelectionWrapper { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="Cursors"/> class.
        /// </summary>
        /// <param name="cursorWrapper"></param>
        /// <param name="barCursor"></param>
        /// <param name="beatCursor"></param>
        /// <param name="selectionWrapper"></param>
        public Cursors(IContainer cursorWrapper, IContainer barCursor, IContainer beatCursor, IContainer selectionWrapper)
        {
            CursorWrapper = cursorWrapper;
            BarCursor = barCursor;
            BeatCursor = beatCursor;
            SelectionWrapper = selectionWrapper;
        }
    }
}