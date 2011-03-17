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
package alphatab.model.effects;
import alphatab.model.SongFactory;

/**
 * A harmonic effect
 */
class HarmonicEffect
{
	public static var NATURAL_FREQUENCIES:Array<Array<Int>> = [[12, 12], [9, 28], [5, 28], [7, 19], [4, 28], [3, 31]];
	
	public var data:Int;
	public var type:Int;
	
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