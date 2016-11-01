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
using System.IO;

namespace AlphaTab.IO
{
    public sealed class StreamWrapper : IReadable, IWriteable, IDisposable
    {
        private readonly Stream _stream;

        public StreamWrapper(Stream stream)
        {
            _stream = stream;
        }

        public void Reset()
        {
            _stream.Seek(0, SeekOrigin.Begin);
        }

        public void Skip(int offset)
        {
            _stream.Seek(offset, SeekOrigin.Current);
        }

        public int ReadByte()
        {
            return _stream.ReadByte();
        }

        public int Read(byte[] buffer, int offset, int count)
        {
            return _stream.Read(buffer, offset, count);
        }

        public void WriteByte(byte value)
        {
            _stream.WriteByte(value);
        }

        public void Write(byte[] buffer, int offset, int count)
        {
            _stream.Write(buffer, offset, count);
        }

        public byte[] ReadAll()
        {
            using (var ms = new MemoryStream())
            {
                _stream.CopyTo(ms);
                return ms.ToArray();
            }
        }

        public void Dispose()
        {
            _stream.Dispose();
        }
    }
}
