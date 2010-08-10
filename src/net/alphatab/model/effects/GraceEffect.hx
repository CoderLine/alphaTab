package net.alphatab.model.effects;

import net.alphatab.model.Duration;
import net.alphatab.model.Velocities;
import net.alphatab.model.SongFactory;

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
