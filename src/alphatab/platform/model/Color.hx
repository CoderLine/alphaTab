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
package alphatab.platform.model;

/**
 * A RGB color number which stores the number as a 2 integer variables.
 * On several target platforms the runtime cannot use the full 32bit for storing values. (sign)
 * That is why the color is stored as 2 integers. 
 */
class Color 
{
	private var _lowerBits:Int;
	private var _higherBits:Int;
	
	public function new(r:Int, g:Int, b:Int, a:Int = 0xFF) 
	{
		_higherBits = ((a & 0xFF) << 8) | (r & 0xFF);
		_lowerBits = ((g & 0xFF) << 8) | (b & 0xFF);
	}
	
	public function getA() : Int
	{
		return (_higherBits >> 8) & 0xFF;
	}	
	
	public function getR() : Int
	{
		return _higherBits & 0xFF;
	}
		
	public function getG() : Int
	{
		return (_lowerBits >> 8) & 0xFF;
	}
			
	public function getB() : Int
	{
		return _lowerBits & 0xFF;
	}
	
	public function toHexString() : String
	{
		return "#" + StringTools.hex(getA(), 2) + StringTools.hex(getR(), 2) + StringTools.hex(getG(), 2) + StringTools.hex(getB(), 2);
	}	
	public function toRgbaString() : String
	{
		return "rgba(" + getR() + "," + getG() + "," + getB() + "," + (getA() / 255.0) + ")";
	}
}