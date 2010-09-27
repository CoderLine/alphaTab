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
 *  
 *  This code is based on the code of TuxGuitar. 
 *  	Copyright: J.Jørgen von Bargen, Julian Casadesus <julian@casadesus.com.ar>
 *  	http://tuxguitar.herac.com.ar/
 */
package alphatab.file.gpx;

import alphatab.platform.BinaryReader;

class ByteBuffer 
{
	private static inline var BUFFER_TYPE_BITS:Int = 8;
	
	private var _position:Int;
	private var _buffer:BinaryReader;
	
	public function new(buffer:BinaryReader)
	{
		_buffer = buffer;
		_position = 0;
	}
	
	public function length() : Int
	{
		return _buffer.getSize();	
	}
	
	public function offset() : Int
	{
		return Math.floor(_position / BUFFER_TYPE_BITS);
	}
	
	public function end() : Bool
	{
		return this.offset() >= this.length();
	}
	
	public function readBit() : Int
	{
		var bit:Int = -1;
		var byteIndex:Int = Math.floor(this._position / BUFFER_TYPE_BITS);
		var byteOffset:Int = ( (BUFFER_TYPE_BITS - 1) - (this._position % BUFFER_TYPE_BITS));
		if( byteIndex >= 0 && byteIndex < this._buffer.getSize())
		{
			bit = ( ((_buffer.getByte(byteIndex) & 0xff) >> byteOffset ) & 0x01 ); 
			_position++;
		}
		return bit;
	}
	
	public function readBits(count:Int) : Int
	{
		var bits:Int = 0;
		var i:Int = count -1;
		while(i >= 0)
		{
			bits |= (readBit() << i);
			i--;
		}
		return bits;
	}
	
	public function readBitsReversed(count:Int) : Int
	{
		var bits:Int = 0;
		var i:Int = 0;
		while(i < count)
		{
			bits |= (readBit() << i);
			i++;
		}
		return bits;
	}
	
	public function readBytes(count:Int) : Array<Int>
	{
		var bytes:Array<Int> = new Array<Int>();
		var i:Int = 0; 
		while(i < count)
		{
			bytes.push(readBits(8));
			i++;
		}
		return bytes;
	}
}
