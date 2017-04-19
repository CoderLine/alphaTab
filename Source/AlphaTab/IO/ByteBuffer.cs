/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Platform;

namespace AlphaTab.IO
{
    public partial class ByteBuffer : IWriteable, IReadable
    {
        private byte[] _buffer;
        private int _position;
        private int _length;
        private int _capacity;

        public long Length
        {
            get
            {
                return _length;
            }
        }

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
            buffer._capacity = buffer._length = data.Length;
            return buffer;
        }

        private ByteBuffer()
        {
        }

        public void Reset()
        {
            _position = 0;
        }

        public void Skip(int offset)
        {
            _position += offset;
        }

        private void SetCapacity(int value)
        {
            if (value != _capacity)
            {
                if (value > 0)
                {
                    var newBuffer = new byte[value];
                    if (_length > 0) Std.BlockCopy(_buffer, 0, newBuffer, 0, _length);
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
            int n = _length - _position;
            if (n <= 0)
                return -1;

            return _buffer[_position++];
        }

        public int Read(byte[] buffer, int offset, int count)
        {
            int n = _length - _position;
            if (n > count) n = count;
            if (n <= 0)
                return 0;

            if (n <= 8)
            {
                int byteCount = n;
                while (--byteCount >= 0)
                    buffer[offset + byteCount] = _buffer[_position + byteCount];
            }
            else
                Std.BlockCopy(_buffer, _position, buffer, offset, n);
            _position += n;

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
            int i = _position + count;

            if (i > _length)
            {
                if (i > _capacity)
                {
                    EnsureCapacity(i);
                }
                _length = i;
            }
            if ((count <= 8) && (buffer != _buffer))
            {
                int byteCount = count;
                while (--byteCount >= 0)
                    _buffer[_position + byteCount] = buffer[offset + byteCount];
            }
            else
            {
                Std.BlockCopy(buffer, offset, _buffer, _position, Math.Min(count, buffer.Length - offset));
            }
            _position = i;
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
            byte[] copy = new byte[_length];
            Std.BlockCopy(_buffer, 0, copy, 0, _length);
            return copy;
        }
    }
}