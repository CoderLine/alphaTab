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
namespace AlphaTab.IO
{
    /// <summary>
    /// Represents a writer where binary data can be written to. 
    /// </summary>
    public interface IWriteable
    {
        /// <summary>
        /// Write a single byte to the stream. 
        /// </summary>
        /// <param name="value">The value to write.</param>
        void WriteByte(byte value);
        /// <summary>
        /// Write data from the given buffer. 
        /// </summary>
        /// <param name="buffer">The buffer to get the data from. </param>
        /// <param name="offset">The offset where to start reading the data.</param>
        /// <param name="count">The number of bytes to write</param>
        void Write(byte[] buffer, int offset, int count);
    }
}