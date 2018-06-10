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

using System;

namespace AlphaTab.IO
{
    class ByteBuffer : IWriteable, IReadable
    {
        private byte[] _buffer;
        private int _capacity;

        public int Length { get; private set; }

        public int Position { get; set; }

        public virtual byte[] GetBuffer()
        {
            return _buffer;
        }


        public static ByteBuffer Empty()
        {
            return WithCapactiy(0);
        }

        public static ByteBuffer WithCapactiy(int capacity)
        {
            ByteBuffer buffer = new ByteBuffer();
            buffer._buffer = new byte[capacity];
            buffer._capacity = capacity;
            return buffer;
        }

        public static ByteBuffer FromBuffer(byte[] data)
        {
            ByteBuffer buffer = new ByteBuffer();
            buffer._buffer = data;
            buffer._capacity = buffer.Length = data.Length;
            return buffer;
        }

        private ByteBuffer()
        {
        }

        public void Reset()
        {
            Position = 0;
        }

        public void Skip(int offset)
        {
            Position += offset;
        }

        private void SetCapacity(int value)
        {
            if (value != _capacity)
            {
                if (value > 0)
                {
                    var newBuffer = new byte[value];
                    if (Length > 0) Platform.Platform.BlockCopy(_buffer, 0, newBuffer, 0, Length);
                    _buffer = newBuffer;
                }
                else
                {
                    _buffer = null;
                }
                _capacity = value;
            }
        }

        public int ReadByte()
        {
            int n = Length - Position;
            if (n <= 0)
                return -1;

            return _buffer[Position++];
        }

        public int Read(byte[] buffer, int offset, int count)
        {
            int n = Length - Position;
            if (n > count) n = count;
            if (n <= 0)
                return 0;

            if (n <= 8)
            {
                int byteCount = n;
                while (--byteCount >= 0)
                    buffer[offset + byteCount] = _buffer[Position + byteCount];
            }
            else
                Platform.Platform.BlockCopy(_buffer, Position, buffer, offset, n);
            Position += n;

            return n;
        }

        public void WriteByte(byte value)
        {
            byte[] buffer = new byte[1];
            buffer[0] = value;
            Write(buffer, 0, 1);
        }

        public void Write(byte[] buffer, int offset, int count)
        {
            int i = Position + count;

            if (i > Length)
            {
                if (i > _capacity)
                {
                    EnsureCapacity(i);
                }
                Length = i;
            }
            if ((count <= 8) && (buffer != _buffer))
            {
                int byteCount = count;
                while (--byteCount >= 0)
                    _buffer[Position + byteCount] = buffer[offset + byteCount];
            }
            else
            {
                Platform.Platform.BlockCopy(buffer, offset, _buffer, Position, Math.Min(count, buffer.Length - offset));
            }
            Position = i;
        }

        private void EnsureCapacity(int value)
        {
            if (value > _capacity)
            {
                int newCapacity = value;
                if (newCapacity < 256)
                    newCapacity = 256;
                if (newCapacity < _capacity * 2)
                    newCapacity = _capacity * 2;
                SetCapacity(newCapacity);
            }
        }

        public byte[] ReadAll()
        {
            return ToArray();
        }

        public virtual byte[] ToArray()
        {
            byte[] copy = new byte[Length];
            Platform.Platform.BlockCopy(_buffer, 0, copy, 0, Length);
            return copy;
        }
    }
}