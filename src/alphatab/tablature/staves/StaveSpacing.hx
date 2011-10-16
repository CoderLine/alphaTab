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
package alphatab.tablature.staves;

/**
 * Encapsulates the storage of spacing offsets for a stave.
 */
class StaveSpacing 
{
    public var spacing:Array<Int>;
    
    public function new(size:Int) 
    {
        spacing = new Array<Int>();
        for (i in 0 ... size)
        {
            spacing.push(0);
        }
    }
    
    public function get(index:Int) : Int
    {
        var size:Int = 0;
        for (i in 0 ... index) 
        {
            size += spacing[i];
        }
        return size;
    }
    
    public function set(index:Int, value:Float) : Void
    {
        spacing[index] = Math.round(value);
    }
    
    public function getSize() : Int
    {
        return this.get(spacing.length);
    }
    
}