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
package alphatab.compiler;

/**
 * A wrapper class for haXe documentation.
 */
class HaXeDoc 
{
    public var fullComment(default,default):String;
    
    public var summary(default,default):String;
    public var tags(default,default):Array<HaXeDocTag>;
    
    public function new() 
    {
        summary = "";
        tags = new Array<HaXeDocTag>();
    }
    
}