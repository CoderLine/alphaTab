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
package alphatab.model;

/**
 * A rectangle construct
 */
class Rectangle 
{
    public var x(default,default):Float;
    public var y(default,default):Float;
    public var width(default,default):Float;
    public var height(default,default):Float;
    
    public function new(x:Float, y:Float, width:Float, height:Float) 
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }    
}