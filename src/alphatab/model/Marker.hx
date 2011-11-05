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
 * A marker annotation for beats
 */
class Marker
{
    private static inline var DEFAULT_COLOR:Color = Color.Red;
    private static inline var DEFAULT_TITLE:String = "Untitled";
    
    public var title(default,default):String;
    public var color(default,default):Color;
    public var measureHeader(default,default):MeasureHeader;
    
    public function new()
    {
    }
}