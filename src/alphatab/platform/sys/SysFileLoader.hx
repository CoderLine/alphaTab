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
package alphatab.platform.sys;

#if (neko || cpp)
import alphatab.platform.IFileLoader;
import haxe.io.Bytes;
import sys.io.File;

/**
 * This file loader loads binary files using the standard haxe system IOs
 */
class SysFileLoader implements IFileLoader
{

    public function new() 
    {
    }
    
    public function loadBinary(path:String) : Bytes
    {
        return File.getBytes(path);
    }
    
    public function loadBinaryAsync(path:String, success:Bytes->Void, error:String->Void) : Void
    {
        try
        {
            success(loadBinary(path));
        }
        catch (e:Dynamic)
        {
            error(Std.string(e));
        }
    }

}
#end