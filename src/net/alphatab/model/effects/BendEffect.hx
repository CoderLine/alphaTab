package net.alphatab.model.effects;
import net.alphatab.model.SongFactory;

/**
 * A bend effect.
 */
class BendEffect
{
	public static inline var SEMITONE_LENGTH:Int = 1;
	public static inline var MAX_POSITION:Int = 12;
	public static inline var MAX_VALUE:Int = SEMITONE_LENGTH * 12;
	
	public var type:BendTypes;
	public var value:Int;
	public var points:Array<BendPoint>;
	 
	public function new()
	{
		type = BendTypes.None;
		value = 0;
		points = new Array<BendPoint>();
	}
	
	public function clone(factory:SongFactory) : BendEffect
	{
		var effect:BendEffect = factory.newBendEffect();
		effect.value = value;
		effect.type = type;
		for(i in 0 ... this.points.length)
		{
			var point:BendPoint = this.points[i];
			effect.points.push(new BendPoint(point.position, point.value, point.vibrato));
		}
		return effect;
	}

}