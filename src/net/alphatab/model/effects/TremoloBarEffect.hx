package net.alphatab.model.effects;
import net.alphatab.model.SongFactory;

/**
 * A tremolo bar (whammy) effect. 
 */
class TremoloBarEffect
{
	public static inline var MAX_POSITION:Int = 12;
	public static inline var MAX_VALUE:Int = 12;
	
	public var type:BendTypes;
	public var value:Int;
	public var points:Array<BendPoint>;
	
	public function new()
	{
		points = new Array<BendPoint>();
	}
	
	public function clone(factory:SongFactory) : TremoloBarEffect
	{
		var effect:TremoloBarEffect = factory.newTremoloBarEffect();
		effect.type = type;
		effect.value = value;
		for(i in 0 ... points.length)
		{
			var point:BendPoint = points[i];
			effect.points.push(new BendPoint(point.position, point.value, point.vibrato));	
		}
		return effect;
	}
}