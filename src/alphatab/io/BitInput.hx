/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
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
package alphatab.io;

import haxe.io.BytesBuffer;
import haxe.io.BytesData;
import haxe.io.BytesInput;
import haxe.io.Input;

/**
 * This utility class allows bitwise reading of a BytesInput
 */
class BitInput extends Input
{
    private static inline var ByteSize = 8; // size of byte in bits
    
    private var _currentByte:Int; // the currently read byte
    private var _position:Int; // the current bit position within the current byte
    private var _input:BytesInput;
    private var _readBytes:Int;
    
    /**
     * Gets the amount of bytes that have been read from the source buffer
     */
    public function getReadBytes()
    {
        return _readBytes;
    }
    
    public function new(input:BytesInput) 
    {
        _input = input;
        _readBytes = 0;
        _position = ByteSize; // to ensure a byte is read on beginning
    }
    
    public override function readByte():Int 
    {
        return readBits(8);
    }
    
    public function readBits(count:Int) : Int
    {
        var bits = 0;
        var i = count - 1; 
        while ( i >= 0 ) 
        {
            bits |= (readBit() << i);
            i--;
        }
        return bits;
    }
    
    public function readBitsReversed(count:Int) : Int
    {
        var bits = 0;
        var i = 0; 
        while ( i < count) 
        {
            bits |= (readBit() << i);
            i++;
        }
        return bits;
    }
    
    
    public function readBit() : Int
    {
        var bit = -1;
        // need a new byte? 
        if (_position >= ByteSize)
        {
            _currentByte = _input.readByte();
            _readBytes++;
            _position = 0;
        }
        
        // shift the desired byte to the least significant bit and  
        // get the value using masking
        var value = (_currentByte >> (ByteSize - _position - 1)) & 0x01;
        _position++;
        return value;
    }    
    
}