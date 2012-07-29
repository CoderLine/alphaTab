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

class DelegatedInputStream extends InputStream 
{
    private var _stream:InputStream;

    public function new(stream:InputStream) 
    {
        _stream = stream;
    }
    
    public override function canSeek():Bool 
    {
        return _stream.canSeek();
    }
    
    public override function close() 
    {
        _stream.close();
    }
    
    public override function eof():Bool 
    {
        return _stream.eof();
    }
    
    public override function length():Int 
    {
        return _stream.length();
    }
    
    public override function position():Int 
    {
        return _stream.position();
    }
    
    public override function readByte():Byte 
    {
        return _stream.readByte();
    }
    
    public override function readBytes(count:Int):Array<Byte> 
    {
        return _stream.readBytes(count);
    }
    
    public override function readSignedByte():SByte 
    {
        return _stream.readSignedByte();
    }
    
    public override function readChar():String 
    {
        return _stream.readChar();
    }
    
    public override function seek(position:Int):Void 
    {
        _stream.seek(position);
    }
    
    public override function skip(count:Int) 
    {
        _stream.skip(count);
    }
}