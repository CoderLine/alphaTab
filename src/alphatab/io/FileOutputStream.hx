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

import alphatab.io.OutputStream;
#if neko
import neko.io.File;
import neko.io.FileOutput;
#elseif cpp
import cpp.io.File;
import cpp.io.FileOutput;
#end

/**
 * A stream implementation writing to a local file. 
 */
class FileOutputStream extends OutputStream
{
    private var _out:FileOutput;
    
    public function new(path:String) 
    {
        super();
        _out = File.write(path, true);
    }
       
    /**
     * Writes a 8bit unsigned integer to the stream;
     * @param data the byte value to be written to the stream.
     */
    public override function writeByte(data:Byte)
    {
        _out.writeByte(data);
    }    
    
    public override function writeString(text:String)
    {
        _out.writeString(text);
    }
    
    public override function flush()
    {
        _out.flush();
    }
    
    public override function close()
    {
        _out.close();
    }
}
#end