package net.alphatab.model.effects;
import net.alphatab.model.Duration;
import net.alphatab.model.SongFactory;

/**
 * A trill effect. 
 */
class TrillEffect
{
	public var fret:Int;
	public var duration:Duration;
	
	public function new(factory:SongFactory)
	{
		fret = 0;
		duration = factory.newDuration();
	}
	
	public function clone(factory:SongFactory) : TrillEffect
	{
		var effect:TrillEffect = factory.newTrillEffect();
		effect.fret = this.fret;
		effect.duration.value = duration.value;
		effect.duration.isDotted = duration.isDotted;
		effect.duration.isDoubleDotted = duration.isDoubleDotted;
		effect.duration.tuplet.enters = duration.tuplet.enters;
		effect.duration.tuplet.times = duration.tuplet.times;
		return effect;
	}

}