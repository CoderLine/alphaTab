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
import alphatab.model.Duration;
import alphatab.model.SongFactory;

/**
 * A tremolo picking effect. 
 */
class TremoloPickingEffect
{
	public var duration:Duration;
	
	public function new(factory:SongFactory)
	{
		duration = factory.newDuration();
	}
	
	public function clone(factory:SongFactory) : TremoloPickingEffect
	{
		var effect:TremoloPickingEffect = factory.newTremoloPickingEffect();
		effect.duration.value = duration.value; 
		effect.duration.isDotted = duration.isDotted; 
		effect.duration.isDoubleDotted = duration.isDoubleDotted; 
		effect.duration.tuplet.enters = duration.tuplet.enters; 
		effect.duration.tuplet.times = duration.tuplet.times; 
		return effect;
	}

}