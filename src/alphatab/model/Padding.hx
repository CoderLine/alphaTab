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
 * A padding construct. 
 */
class Padding 
{
	public var right:Int;
	public var top:Int;
	public var left:Int;
	public var bottom:Int;

	public function new(right:Int, top:Int, left:Int, bottom:Int) 
	{
		this.right = right;
		this.top = top;
		this.left = left;
		this.bottom = bottom;
	}
	
	public function getHorizontal() : Int
	{
		return left + right;
	}
		
	public function getVertical() : Int
	{
		return top + bottom;
	}
	
}