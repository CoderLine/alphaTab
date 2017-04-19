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

namespace AlphaTab.IO
{
    /// <summary>
    /// This utility public class allows bitwise reading of a stream
    /// </summary>
    public class BitReader
    {
        private const int ByteSize = 8; // size of byte in bits

        private int _currentByte; // the currently read byte
        private int _position; // the current bit position within the current byte

        private readonly IReadable _source;

        public BitReader(IReadable source)
        {
            _source = source;
            _position = ByteSize; // to ensure a byte is read on beginning
        }

        public int ReadByte() 
        {
            return ReadBits(ByteSize);
        }

        public byte[] ReadBytes(int count)
        {
            byte[] bytes = new byte[count];
            for (int i = 0; i < count; i++)
            {
                bytes[i] = (byte) ReadByte();
            }
            return bytes;
        }
    
        public int ReadBits(int count) 
        {
            var bits = 0;
            var i = count - 1; 
            while ( i >= 0 ) 
            {
                bits |= (ReadBit() << i);
                i--;
            }
            return bits;
        }
    
        public int ReadBitsReversed(int count)
        {
            var bits = 0;
            for (int i = 0; i < count; i++)
            {
                bits |= (ReadBit() << i);
            }
            return bits;
        }
    
        public int ReadBit() 
        {
            // need a new byte? 
            if (_position >= ByteSize)
            {
                _currentByte = _source.ReadByte();
                if (_currentByte == -1) throw new EndOfReaderException();
                _position = 0;
            }
        
            // shift the desired byte to the least significant bit and  
            // get the value using masking
            var value = (_currentByte >> (ByteSize - _position - 1)) & 0x01;
            _position++;
            return value;
        }

        public byte[] ReadAll()
        {
            var all = ByteBuffer.Empty();
            try
            {
                while (true)
                {
                    all.WriteByte((byte) ReadByte());
                }
            }
            catch (EndOfReaderException)
            {
            }
            return all.ToArray();
        }
    }
}