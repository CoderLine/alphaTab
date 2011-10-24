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
 * This utility allows reading of datatypes from a stream instance.
 * readFloat and readDouble are based on jeash
 *   Copyright (c) 2010, Jeash contributors.
 *    readFloat: http://mercurial.intuxication.org/hg/jeash/file/a4255cd99f9c/jeash/utils/ByteArray.hx#l240 (15.10.2011)
 *    readDouble http://mercurial.intuxication.org/hg/jeash/file/a4255cd99f9c/jeash/utils/ByteArray.hx#l158 (15.10.2011)
 */
class DataStream extends Stream
{ 
    private static var TWOeN23 = Math.pow(2, -23);
    
    private var _stream:Stream;
    
    public function new(stream:Stream) 
    {
        _stream = stream;
    }
   
    public function readBool() : Bool
    { 
        return this.readByte() != 0; 
    }
    
    public function readShort() : Int
    { 
        var bytes = readBytes(2);
        return (bytes[1] << 8) | bytes[0];
    }
    
    public function readInt() : Int
    { 
        var bytes = readBytes(4);
        return (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    }
    
    public function readFloat() : Float 
    {
        var bytes = readBytes(4);
        var sign = 1 - ((bytes[0] >> 7) << 1);
        var exp = (((bytes[0] << 1) & 0xFF) | (bytes[1] >> 7)) - 127;
        var sig = ((bytes[1] & 0x7F) << 16) | (bytes[2] << 8) | bytes[3];
        if (sig == 0 && exp == -127)
            return 0.0;
        
        return sign*(1 + TWOeN23*sig)*Math.pow(2, exp);
    }
    
    public function readDouble() : Float
    {
        var bytes = readBytes(8);

        var sign = 1 - ((bytes[0] >> 7) << 1); // sign = bit 0
        var exp = (((bytes[0] << 4) & 0x7FF) | (bytes[1] >> 4)) - 1023; // exponent = bits 1..11
        var sig = getDoubleSig(bytes);
        if (sig == 0 && exp == -1023)
            return 0.0;
        
        return sign*(1.0 + Math.pow(2, -52)*sig)*Math.pow(2, exp);
    } 
    
    #if js
    public function getDoubleSig(bytes:Array<Int>) : Int
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
    public function getDoubleSig(bytes:Array<Int>) : Int
    {
        // we need the lower 4 bits of the [1] byte and all other complete.
        var sig = ((bytes[1] & 0x0F) << 48) | (bytes[2] << 40) | (bytes[3] << 32) | 
                   (bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7];
        return sig;
    }
    #end
    
    public override function readByte() : Int
    {
        return _stream.readByte();
    }
    
    public override function seek(position:Int) : Void 
    {
        _stream.seek(position);
    }
    
    public override function position() : Int
    {
        return _stream.position();
    }
    
    public override function length() :Int 
    {
        return _stream.length();
    }    
    
}