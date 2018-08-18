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
namespace AlphaTab.Importer
{
    /// <summary>
    /// The exception thrown by a <see cref="ScoreImporter"/> in case the
    /// binary data does not contain a reader compatible structure. 
    /// </summary>
    public class UnsupportedFormatException : AlphaTabException
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UnsupportedFormatException"/> class.
        /// </summary>
        /// <param name="message">The message that describes the error.</param>
        public UnsupportedFormatException(string message = "Unsupported format")
            : base(message)
        {
        }
    }
}