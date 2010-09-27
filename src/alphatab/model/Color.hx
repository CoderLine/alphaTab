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
 * A RGB Color.
 */
class Color
{
	public static inline var Black:Color = new Color(0, 0, 0);
	public static inline var Red:Color = new Color(255, 0, 0);
	
	public var r:Int;
	public var g:Int;
	public var b:Int; 
	
	public function new(r:Int = 0, g:Int = 0, b:Int = 0)
	{
		this.r = r;
		this.g = g;
		this.b = b;
	}
	
	public function toString() : String
	{
		var s:String = "rgb(";
		s += Std.string(this.r) + "," ;
		s += Std.string(this.g) + "," ;
		s += Std.string(this.b) + ")" ;
		return s;
	}
}