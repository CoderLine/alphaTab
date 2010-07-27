/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model.effects;
import net.alphatab.model.GsSongFactory;

class GsBendEffect
{
	public static inline var SemitoneLength:Int = 1;
	public static inline var MaxPositionLength:Int = 12;
	public static inline var MaxValueLength:Int = SemitoneLength * 12;
	
	public var Type:GsBendTypes;
	public var Value:Int;
	public var Points:Array<GsBendPoint>;
	 
	
	public function new()
	{
		this.Type = GsBendTypes.None;
		this.Value = 0;
		this.Points = new Array<GsBendPoint>();
	}
	
	public function Clone(factory:GsSongFactory) : GsBendEffect
	{
		var effect:GsBendEffect = factory.NewBendEffect();
		effect.Value = this.Value;
		effect.Type = this.Type;
		for(i in 0 ... this.Points.length)
		{
			var point:GsBendPoint = this.Points[i];
			effect.Points.push(new GsBendPoint(point.Position, point.Value, point.Vibrato));
		}
		return effect;
	}

}