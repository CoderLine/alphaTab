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
package net.alphatab.model.effects;

/**
 * A single point within the BendEffect 
 */
class BendPoint 
{
	public var position:Int;
	public var value:Int;
	public var vibrato:Bool;
		
	public function new(position:Int = 0, value:Int = 0, vibrato:Bool = false)
	{
		this.position = position;
		this.value = value;
		this.vibrato = vibrato;
	}
	
	public function GetTime(duration:Int) : Int
	{
		return Math.floor(duration * position / BendEffect.MAX_POSITION);
	}
}