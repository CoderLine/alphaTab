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
package alphatab.platform.cpp;

#if cpp

import alphatab.io.Stream;
import haxe.io.Bytes;
import cpp.io.File;

/**
 * A stream implementation accessing a local file. 
 */
class FileStream extends Stream
{
    private var _input:Bytes;
    private var _pos:Int;
    
    public function new(path:String) 
    {
        _input = File.getBytes(path);
        _pos = 0;
    }
    
    public override function readByte() : Int
    {
        return _input.get(_pos++);
    }
    
    public override function length() : Int
    {
       return _input.length;
    }
    
    public override function position() : Int
    {   
        return _pos;
    }
    
    public override function seek(position:Int) : Void
    {
        _pos = position;
    }
}
#end