/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model.effects;
import net.alphatab.model.GsSongFactory;

class GsHarmonicEffect
{
	public static var NaturalFrequencies:Array<Array<Int>> = {
			var a = new Array<Array<Int>>();			
			a.push([12, 12]);
			a.push([9 , 28]);
			a.push([5 , 28]);
			a.push([7 , 19]); 
			a.push([4 , 28]);
			a.push([3 , 31]);
			a;
	};
	
	public var Data:Int;
	public var Type:GsHarmonicType;
	
	public function new()
	{
	}
	
	public function Clone(factory:GsSongFactory) : GsHarmonicEffect
	{
		var effect:GsHarmonicEffect = factory.NewHarmonicEffect();
		effect.Type = this.Type;
		effect.Data = this.Data;
		return effect;	
	}
}