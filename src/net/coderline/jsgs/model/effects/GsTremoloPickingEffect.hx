/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model.effects;
import net.coderline.jsgs.model.GsDuration;
import net.coderline.jsgs.model.GsSongFactory;

class GsTremoloPickingEffect
{
	public var Duration:GsDuration;
	
	public function new(factory:GsSongFactory)
	{
		this.Duration = factory.NewDuration();
	}
	
	public function Clone(factory:GsSongFactory) : GsTremoloPickingEffect
	{
		var effect:GsTremoloPickingEffect = factory.NewTremoloPickingEffect();
		effect.Duration.Value = this.Duration.Value; 
		effect.Duration.IsDotted = this.Duration.IsDotted; 
		effect.Duration.IsDoubleDotted = this.Duration.IsDoubleDotted; 
		effect.Duration.Triplet.Enters = this.Duration.Triplet.Enters; 
		effect.Duration.Triplet.Times = this.Duration.Triplet.Times; 
		return effect;
	}

}