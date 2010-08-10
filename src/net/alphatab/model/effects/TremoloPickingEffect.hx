package net.alphatab.model.effects;
import net.alphatab.model.Duration;
import net.alphatab.model.SongFactory;

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