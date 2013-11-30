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
package alphatab.rendering.staves;

import haxe.ds.StringMap;

/**
 * This class stores size information about a stave. 
 * It is used by the layout engine to collect the sizes of score parts
 * to align the parts across multiple staves.
 */
class BarSizeInfo 
{
    public var fullWidth:Int;
    public var sizes:StringMap<Array<Int>>;
    
    public function new() 
    {
        sizes = new StringMap<Array<Int>>();
        fullWidth = 0;
    }
    
    public function setSize(key:String, size:Int)
    {
        sizes.set(key, [size]);
    }
    
    public function getSize(key:String)
    {
        if (sizes.exists(key))
        {
            return sizes.get(key)[0];
        }
        return 0;
    }
    
    public function getIndexedSize(key:String, index:Int)
    {
        if (sizes.exists(key) && index < sizes.get(key).length)
        {
            return sizes.get(key)[index];
        }
        return 0;
    }
    
    public function setIndexedSize(key:String, index:Int, size:Int) 
    {
        if (!sizes.exists(key))
        {
            sizes.set(key, new Array<Int>());
        }
        
        sizes.get(key)[index] = size;
    }
}