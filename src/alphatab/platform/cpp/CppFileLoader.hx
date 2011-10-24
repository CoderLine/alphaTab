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
package alphatab.platform.neko;

#if neko

import alphatab.io.DataStream;
import alphatab.platform.FileLoader;
import alphatab.platform.cpp.FileStream;

/**
 * This if a fileloader implementation for Neko
 */
class CppFileLoader implements FileLoader
{
    public function new() 
    {       
    }
    
    public function loadBinary(method:String, file:String, success:DataStream->Void, error:String->Void) : Void
    {        
        try 
        {
            success(new DataStream(new FileStream(file)));
        }
        catch (e:Dynamic)
        {
            error(Std.string(e));
        }
    }
}
#end