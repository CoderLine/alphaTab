/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model.effects;
import net.alphatab.model.GsDuration;
import net.alphatab.model.GsSongFactory;

class GsTrillEffect
{
	public var Fret:Int;
	public var Duration:GsDuration;
	
	public function new(factory:GsSongFactory)
	{
		this.Fret = 0;
		Duration = factory.NewDuration();
	}
	
	public function Clone(factory:GsSongFactory) : GsTrillEffect
	{
		var effect:GsTrillEffect = factory.NewTrillEffect();
		effect.Fret = this.Fret;
		effect.Duration.Value = this.Duration.Value;
		effect.Duration.IsDotted = this.Duration.IsDotted;
		effect.Duration.IsDoubleDotted = this.Duration.IsDoubleDotted;
		effect.Duration.Triplet.Enters = this.Duration.Triplet.Enters;
		effect.Duration.Triplet.Times = this.Duration.Triplet.Times;
		return effect;
	}

}