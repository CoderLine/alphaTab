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
namespace AlphaTab.IO
{
    public partial class ByteArray
    {
        private readonly byte[] _data;

        public byte[] Data
        {
            get
            {
                return _data;
            }
        }

        public ByteArray(int size)
        {
            _data = new byte[size];
        }

        public ByteArray(params byte[] data)
        {
            _data = data;
        }

        public int Length
        {
            get
            {
                return _data.Length;
            }
        }

        public byte this[int index]
        {
            get
            {
                return _data[index];
            }
            set
            {
                _data[index] = value;
            }
        }
    }
}
