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

#if (neko || cpp)

import alphatab.io.InputStream;

#if neko
import neko.io.File;
import neko.io.FileInput;
#elseif cpp
import cpp.io.File;
import cpp.io.FileInput;
#end

/**
 * A stream implementation accessing a local file. 
 */
class FileInputStream extends InputStream
{
    private var _input:FileInput;
    private var _pos:Int;
    
    public function new(path:String) 
    {
        _input = File.read(path, true);
        _pos = 0;
    }
    
    public override function readByte() : Byte
    {
        if (_input.eof())
        {
            return -1;
        }
        else
        {
            _pos++;
            return _input.readByte();
       }
    }
    
    public override function readChar():String 
    {
        return _input.readString(1);
    }
    
    public override function length() : Int
    {
        // TODO: Filesize?
       return 0;
    }
    
    override public function eof():Bool 
    {
        return _input.eof();
    }
    
    public override function position() : Int
    {   
        return _pos;
    }
    
    public override function seek(position:Int) : Void
    {
        _input.seek(position, FileSeek.SeekBegin);
    }
    
    public override function canSeek():Bool 
    {
        return true;
    }
    
    public override function close() 
    {
        _input.close();
    }
    
    public override function skip(count:Int) 
    {
        _input.seek(count, FileSeek.SeekCur);
    }
}

#end