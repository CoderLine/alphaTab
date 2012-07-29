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
import haxe.Int64;

/**
 * This utility allows reading of datatypes from a stream instance.
 * readFloat and readDouble are based on jeash
 *   Copyright (c) 2010, Jeash contributors.
 *    readFloat: http://mercurial.intuxication.org/hg/jeash/file/a4255cd99f9c/jeash/utils/ByteArray.hx#l240 (15.10.2011)
 *    readDouble http://mercurial.intuxication.org/hg/jeash/file/a4255cd99f9c/jeash/utils/ByteArray.hx#l158 (15.10.2011)
 */
class DataInputStream extends DelegatedInputStream
{ 
    // the main type handling logic is implemented as big endian,
    // but the bytes get reversed on reading if little endian is requested
        
    public var bigEndian:Bool;
    
    public function new(stream:InputStream, bigEndian:Bool = true) 
    {
        super(stream);
        this.bigEndian = bigEndian;
    }
	
    private function readEndianAwareBytes(count:Int) : Array<Int>
    {
        var bytes = readBytes(count);
        if (!bigEndian)
        {
            bytes.reverse();
        }
        return bytes;
    }
	
	public function readString(length:Int) : String
	{
		if (Std.is(this._stream, StringInputStream))
		{
			var ss:StringInputStream = cast(this._stream, StringInputStream);
			return ss.readString(length);
		}
		else
		{
			var text:String = "";
			for (i in 0 ... length)
			{
				// TODO: Check for unicode support
				text += String.fromCharCode(readByte());
			}
			return text;
		}
	}
   
    public function readBool() : Bool
    { 
        return this.readByte() != 0; 
    }
    
    public function readShort() : Int
    { 
        var bytes = readEndianAwareBytes(2);
        var short = (bytes[0] << 8) | bytes[1];
        return short > 32767 ? -65536 + short : short;
    }
    
    public function readInt() : Int
    { 
        var bytes = readEndianAwareBytes(4);
        var int = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
        return int; // TODO: overflow handling? crossplatform int range in haxe?
    }
    
    public function readFloat() : Float 
    {
        var bytes = readEndianAwareBytes(4);
        var sign = 1 - ((bytes[0] >> 7) << 1);
        var exp = (((bytes[0] << 1) & 0xFF) | (bytes[1] >> 7)) - 127;
        var sig = ((bytes[1] & 0x7F) << 16) | (bytes[2] << 8) | bytes[3];
        if (sig == 0 && exp == -127)
            return 0.0;
        
        return sign*(1 + Math.pow(2, -23)*sig)*Math.pow(2, exp);
    }
    
    public function readDouble() : Float
    {
        var bytes = readEndianAwareBytes(8);
        var sign = 1 - ((bytes[0] >> 7) << 1); // sign = bit 0
        var exp = (((bytes[0] << 4) & 0x7FF) | (bytes[1] >> 4)) - 1023; // exponent = bits 1..11
        var sig = getDoubleSig(bytes);
        if (sig == 0 && exp == -1023)
            return 0.0;
        return sign*(1.0 + Math.pow(2, -52)*sig)*Math.pow(2, exp);
    } 
    
    #if (js && !cs)
    public function getDoubleSig(bytes:Array<Byte>) : Int
    {
        // This crazy toString() stuff works around the fact that js ints are
        // only 32 bits and signed, giving us 31 bits to work with
        var sig = untyped 
        {
            parseInt(((((bytes[1]&0xF) << 16) | (bytes[2] << 8) | bytes[3] ) * Math.pow(2, 32)).toString(2), 2) +
            parseInt(((bytes[4] >> 7) * Math.pow(2,31)).toString(2), 2) +
            parseInt((((bytes[4]&0x7F) << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7]).toString(2), 2);    // significand = bits 12..63
        }
        return sig;
    }
    #else
    public function getDoubleSig(bytes:Array<Byte>) : Int
    {
        return ((bytes[1] & 0x0F) << 48) | (bytes[2] << 40) | (bytes[3] << 32)
               | (bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7];
    }
    #end
    
}