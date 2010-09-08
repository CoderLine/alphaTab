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
import net.alphatab.model.SongFactory;

/**
 * A harmonic effect
 */
class HarmonicEffect
{
	public static var NATURAL_FREQUENCIES:Array<Array<Int>> = {
			var a = new Array<Array<Int>>();			
			a.push([12, 12]);
			a.push([9 , 28]);
			a.push([5 , 28]);
			a.push([7 , 19]); 
			a.push([4 , 28]);
			a.push([3 , 31]);
			a;
	};
	
	public var data:Int;
	public var type:HarmonicType;
	
	public function new()
	{
	}
	
	public function clone(factory:SongFactory) : HarmonicEffect
	{
		var effect:HarmonicEffect = factory.newHarmonicEffect();
		effect.type = type;
		effect.data = data;
		return effect;	
	}
}