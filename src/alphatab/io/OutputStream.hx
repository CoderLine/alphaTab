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
 * A base class for creating output streams on multiple platforms.
 */
class OutputStream 
{

    public function new() 
    {
        
    }
    
    /**
     * Writes a 8bit unsigned integer to the stream;
     * @param data the byte value to be written to the stream.
     */
    public function writeByte(data:Byte)
    {
        
    }    
    /**
     * Writes a 8bit unsigned integer to the stream;
     * @param data the byte value to be written to the stream.
     */
    public function writeBytes(data:Array<Byte>)
    {
        for (d in data)
        {
            writeByte(d);
        }
    }
    
    public function writeAsString(value:Dynamic)
    {
        var text:String;
        if (Std.is(value, String))
        {
            text = cast value;
        }
        else
        {
            text = Std.string(value);
        }
        writeString(text);
    }
    
    public function writeString(text:String)
    {
        for (i in 0 ... text.length)
        {
            writeByte(text.charCodeAt(i) & 0xFF);
        }
    }
    
    public function flush()
    {
        
    }
    
    public function close()
    {
        
    }
   
}