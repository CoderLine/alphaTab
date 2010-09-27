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
 * A bend effect.
 */
class BendEffect
{
	public static inline var SEMITONE_LENGTH:Int = 1;
	public static inline var MAX_POSITION:Int = 12;
	public static inline var MAX_VALUE:Int = SEMITONE_LENGTH * 12;
	
	public var type:Int;
	public var value:Int;
	public var points:Array<BendPoint>;
	 
	public function new()
	{
		type = BendTypes.None;
		value = 0;
		points = new Array<BendPoint>();
	}
	
	public function clone(factory:SongFactory) : BendEffect
	{
		var effect:BendEffect = factory.newBendEffect();
		effect.value = value;
		effect.type = type;
		for(i in 0 ... this.points.length)
		{
			var point:BendPoint = this.points[i];
			effect.points.push(new BendPoint(point.position, point.value, point.vibrato));
		}
		return effect;
	}

}