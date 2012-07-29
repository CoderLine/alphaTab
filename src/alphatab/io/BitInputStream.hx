/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.io;

/**
 * This stream implementation allows bitwise reading from another stream.
 */
class BitInputStream extends DelegatedInputStream
{
    private static inline var BYTE_SIZE = 8; // size of byte in bits
    
    private var _currentByte:Byte; // the currently read byte
    private var _position:Int; // the current bit position within the current byte
    
    public function new(stream:InputStream) 
    {
        super(stream);
        _position = BYTE_SIZE; // mark end of byte to ensure a new byte is read
    }
    
    public override function readByte() : Byte
    {
        return readBits(8);
    }
    
    public override function seek(position:Int) : Void
    {
        _position = BYTE_SIZE;
        _stream.seek(position);
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
    
    public function readBit() : Byte
    {
        var bit = -1;
        // need a new byte? 
        if (_position >= BYTE_SIZE)
        {
            _currentByte = _stream.readByte();
            _position = 0;
        }
        
        // shift the desired byte to the least significant bit and  
        // get the value using masking
        var value = (_currentByte >> (BYTE_SIZE - _position - 1)) & 0x01;
        _position++;
        return value;
    }
}