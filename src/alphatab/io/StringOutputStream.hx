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
 * A stream which stores the data in a StringBuf instance
 */
class StringOutputStream extends OutputStream
{
    private var _buffer:StringBuf;
    
    public function new() 
    {
        super();
        _buffer = new StringBuf();
    }
    
    /**
     * Writes a 8bit unsigned integer to the stream;
     * @param data the byte value to be written to the stream.
     */
    public override function writeByte(data:Byte)
    {
        _buffer.add(String.fromCharCode(data));
    }    
    
    public override function writeString(text:String)
    {
        _buffer.add(text);
    }
    
    public function toString() : String
    {
        return _buffer.toString();
    }
}