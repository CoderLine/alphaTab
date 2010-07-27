/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model.effects;

import net.alphatab.model.GsDuration;
import net.alphatab.model.GsVelocities;
import net.alphatab.model.GsSongFactory;


class GsGraceEffect
{
	public var IsDead:Bool;
	public var Duration:Int;
	public var Dynamic:Int;
	public var Fret:Int;
	public var IsOnBeat:Bool;
	public var Transition:GsGraceEffectTransition;
	
	public function DurationTime() : Int 
	{
		return Math.floor((GsDuration.QuarterTime / 16.00) * this.Duration);	
	}
	
	public function new()
	{
		this.Fret = 0;
		this.Duration = 1;
		this.Dynamic = GsVelocities.Default;
		this.Transition = GsGraceEffectTransition.None;
		this.IsOnBeat = false;
		this.IsDead = false;
	}

	public function Clone(factory : GsSongFactory) : GsGraceEffect 
	{
		var effect:GsGraceEffect = factory.NewGraceEffect();
		effect.Fret = this.Fret;
		effect.Duration = this.Duration;
		effect.Dynamic = this.Dynamic;
		effect.Transition = this.Transition;
		effect.IsOnBeat = this.IsOnBeat;
		effect.IsDead = this.IsDead;
		return effect;
	}
}
