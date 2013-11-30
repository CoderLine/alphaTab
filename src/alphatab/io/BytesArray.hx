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

import haxe.io.Bytes;
import haxe.io.BytesData;
import haxe.io.Error;

/**
 * A Byte Array supporting dynamic writing and random data access.  
 */
class BytesArray 
{
    private var _data:Bytes;
    
    /**
     * Gets the capacity of this array. The capacity is the amount
     * of bytes that the internal buffer currently has allocated.
     */
    public var capacity(get_capacity, never) : Int;
    
    /**
     * Gets the count of elements currently stored in this array.
     */
    public var length(default, null) : Int;
    
    /**
     * Creates a new empty byte array
     */
    public function new(initialSize:Int = 4) 
    {
        _data = Bytes.alloc(initialSize); // alloc some small amout for the beginning
        length = 0;
    }
    
    /**
     * Gets the byte at the specified index
     * @param  pos the index of the byte to get
     * @return the unsigned 8bit value of the byte (0-255)
     * @throws Error.OutsideBounds thrown if the index is greater or equal the array size
     */
    public function get(pos:Int) : Int
    {
        if (pos >= length)
        {
            throw Error.OutsideBounds;
        }
        return _data.get(pos);
    }
    
    /**
     * Sets the byte at the specified index
     * @param pos the index of the byte to get
     * @param v the unsigned 8bit value of the byte (0-255) to set. Bigger values will be reduced to 255
     * @throws Error.OutsideBounds thrown if the index is greater or equal the array size
     */
    public function set(pos:Int, v:Int) : Void
    {
        if (pos >= length)
        {
            throw Error.OutsideBounds;
        }
        _data.set(pos, v & 0xFF);
    }
    
    /**
     * Returns a sub Bytes of the given offset and size
     * @param pos the offset to start copying from 
     * @param len the size of the requested subbuffer
     */
    public function sub(pos:Int, len:Int) : Bytes
    {
        if (pos < 0 || len < 0 || pos + len > length)
        {
            throw Error.OutsideBounds;
        }
        return _data.sub(pos, len);
    }
    
    /**
     * Adds a single byte to the end of this array.
     * @param v the unsigned 8bit value of the byte (0-255) to add. Bigger values will be reduced to 255 
     */
    public function add(v:Int) : Void
    {
        updateCapacity(length + 1); // update size if we need more space
        _data.set(length++, v & 0xFF);
    }
    
    /**
     * Adds a list of bytes to the end of this array.
     * @param v the bytes to add to this value. 
     */
    public function addBytes(v:Bytes) : Void
    {
        if (v.length > 0) // only do something if needed
        {
            updateCapacity(length + v.length); // more space!!
            // now we blit the data to our buffer
            _data.blit(length, v, 0, v.length);
            length += v.length; 
        }
    }
    
    /**
     * Gets the actual buffer used for storing the data. This buffer
     * might be bigger than the elements stored.
     */
    public function getBuffer() : Bytes
    {
        return _data;
    }
    
    /**
     * Returns a copy of the elements stored within this array.
     */
    public function getBytes(offset:Int=0) : Bytes
    {
        var copy = Bytes.alloc(length);
        copy.blit(0, _data, offset, length - offset);
        return copy;
    }
    
    // returns the current capacity
    private function get_capacity() : Int
    {
        return _data.length;
    }
    
    /**
     * Updates the underlying bytes buffer to the requested capacity
     * @param capacity the new capacity requested for the buffer
     */
    private function setCapacity(capacity:Int) : Void
    {
        // create the bigger buffer and copy the old data to the new array
        var newData = Bytes.alloc(capacity);
        newData.blit(0, _data, 0, _data.length); 
        _data = newData;
    }    
    
    /**
     * Updates the capacity to the requested size. The underlying buffer size
     * is doubled if more space is needed to place more elements. If this is not enough, 
     * it will resize to the requested size. 
     * @param    min the minimum amount of elements which need to have place in the array
     */
    private function updateCapacity(min:Int) : Void
    {
        if (min < 0) 
        {
            throw Error.Overflow; // oh no! int-overflow!
        }
        // only resize if needed
        if (_data.length < min)
        {
            var c = Std.int(Math.max(_data.length * 2, min));
            setCapacity(c);
        }
    }
    
    /**
     * Returns a new BytesArray based on the given Bytes instance
     * @param    b the Bytes instance to use as initial buffer
     * @return the new BytesArray instance storing the given Bytes as buffer.
     */
    public static function ofBytes(b:Bytes) : BytesArray
    {
        var a = new BytesArray();
        a._data = b;
        a.length = a._data.length;
        return a;
    }
}