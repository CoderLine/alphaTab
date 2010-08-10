package net.alphatab.model.effects;
import net.alphatab.model.SongFactory;

/**
 * A harmonic effect
 */
class HarmonicEffect
{
	public static var NATURAL_FREQUENCIES:Array<Array<Int>> = {
			var a = new Array<Array<Int>>();			
			a.push([12, 12]);
			a.push([9 , 28]);
			a.push([5 , 28]);
			a.push([7 , 19]); 
			a.push([4 , 28]);
			a.push([3 , 31]);
			a;
	};
	
	public var data:Int;
	public var type:HarmonicType;
	
	public function new()
	{
	}
	
	public function clone(factory:SongFactory) : HarmonicEffect
	{
		var effect:HarmonicEffect = factory.newHarmonicEffect();
		effect.type = type;
		effect.data = data;
		return effect;	
	}
}