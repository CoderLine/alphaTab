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
 * A base class for creating input streams on multiple platforms.
 */
class InputStream 
{
    /**
     * Reads a 8bit unsigned integer from the stream and returns it value 
     * in the range of 0 to 255
     */
    public function readByte() : Byte
    {
        return 0;
    }
    
    public function readChar() : String
    {
        return String.fromCharCode(readByte());
    }
    
    /**
     * Reads a 8bit signed integer from the stream and returns it value in the
     * range of -128 to 127
     */
    public function readSignedByte()  : SByte
    {
        // convert to signed byte
        var data = readByte() & 0xFF;
        return data > 127 ? -256 + data : data;
    }
    
    public function readBytes(count:Int) : Array<Byte>
    {
        var bytes = new Array<Int>();
        for (i in 0 ... count) 
        {
           bytes.push(readByte());
        }
        
        return bytes;
    }
    
    public function eof() : Bool
    {
        return position() >= length();
    }
    
    public function length() : Int
    {
        return 0;
    }
    
    public function position() : Int
    {
        return 0; // not implemented
    }
    
    public function canSeek() : Bool
    {
        return false;
    }
    
    public function seek(position:Int) : Void
    {
    }
    
    public function skip(count:Int) 
    {
        for (i in 0 ... count)
        {
            if(!eof())
                readByte();
        }
    }
    
    public function close()
    {
        
    }
    
}