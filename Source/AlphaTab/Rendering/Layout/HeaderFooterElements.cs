/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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

namespace AlphaTab.Rendering.Layout
{
    /// <summary>
    /// A list of the elements which can be shown in the header and footer 
    /// of a rendered song sheet. All values can be combined using bit-operators as they are flags. 
    /// </summary>
    [Flags]
    public enum HeaderFooterElements
    {
        /// <summary>
        /// No elements get rendered. 
        /// </summary>
        None = 0x0,
        /// <summary>
        /// Enables rendering of the title.
        /// </summary>
        Title = 0x1,
        /// <summary>
        /// Enables rendering of the subtitle.
        /// </summary>
        SubTitle = 0x2,
        /// <summary>
        /// Enables rendering of the artist.
        /// </summary>
        Artist = 0x4,
        /// <summary>
        /// Enables rendering of the album.
        /// </summary>
        Album = 0x8,
        /// <summary>
        /// Enables rendering of the words.
        /// </summary>
        Words = 0x10,
        /// <summary>
        /// Enables rendering of the music.
        /// </summary>
        Music = 0x20,
        /// <summary>
        /// Enables rendering of the words and music.
        /// </summary>
        WordsAndMusic = 0x40,
        /// <summary>
        /// Enables rendering of the copyright.
        /// </summary>
        Copyright = 0x80,
        /// <summary>
        /// Enables rendering of the page number.
        /// </summary>
        PageNumber = 0x100,
        /// <summary>
        /// Enables rendering of all elements. 
        /// </summary>
        All = None | Title | SubTitle | Artist | Album | Words | Music | WordsAndMusic | Copyright | PageNumber
    }
}
