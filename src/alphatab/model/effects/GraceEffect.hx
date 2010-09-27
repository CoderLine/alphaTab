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
import alphatab.model.Velocities;
import alphatab.model.SongFactory;

/**
 * A grace note effect.
 */
class GraceEffect
{
	public var isDead:Bool;
	public var duration:Int;
	public var velocity:Int;
	public var fret:Int;
	public var isOnBeat:Bool;
	public var transition:GraceEffectTransition;
	
	public function durationTime() : Int 
	{
		return Math.floor((Duration.QUARTER_TIME / 16.00) * duration);	
	}
	
	public function new()
	{
		fret = 0;
		duration = 1;
		velocity = Velocities.DEFAULT;
		transition = GraceEffectTransition.None;
		isOnBeat = false;
		isDead = false;
	}

	public function clone(factory : SongFactory) : GraceEffect 
	{
		var effect:GraceEffect = factory.newGraceEffect();
		effect.fret = fret;
		effect.duration = duration;
		effect.velocity= velocity;
		effect.transition = transition;
		effect.isOnBeat = isOnBeat;
		effect.isDead = isDead;
		return effect;
	}
}
