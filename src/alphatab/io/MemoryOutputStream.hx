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
 * This stream implementation stores the written data in a array backstore
 */
class MemoryOutputStream extends OutputStream
{
    private var _buffer:Array<Byte>;
    
    public function new() 
    {
        super();
        _buffer = new Array<Byte>();
    }
    
    public function getBuffer()
    {
        return _buffer;
    }
    
    public override function writeByte(data:Byte) 
    {
        _buffer.push(data & 0xFF);
    }    
}