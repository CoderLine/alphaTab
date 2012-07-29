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

class MemoryInputStream extends InputStream
{
    private var _pos:Int;
    private var _buffer:Array<Byte>;
    
    public function new(buffer:Array<Byte>) 
    {
        _buffer = buffer;
        _pos = 0;
    }
    
    public override function readByte() : Byte
    {
        if (_pos >= _buffer.length)
        {
            return -1;
        }
        return _buffer[_pos++] & 0xFF;
    }
    
    public override function length() : Int
    {
       return _buffer.length;
    }
    
    public override function position() : Int
    {   
        return _pos;
    }
    
    public override function seek(position:Int) : Void
    {
        _pos = position;
    }
    
    public override function canSeek():Bool 
    {
        return true;
    }
    
    public override function skip(count:Int):Dynamic 
    {
        _pos += count;
    }
}