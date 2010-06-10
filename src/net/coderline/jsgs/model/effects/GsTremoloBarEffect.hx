/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.model.effects;
import net.coderline.jsgs.model.GsSongFactory;

class GsTremoloBarEffect
{
	public static inline var MaxPositionLength:Int = 12;
	public static inline var MaxValueLength:Int = 12;
	
	public var Type:GsBendTypes;
	public var Value:Int;
	public var Points:Array<GsTremoloBarPoint>;
	
	public function new()
	{
		Points = new Array<GsTremoloBarPoint>();
	}
	
	public function Clone(factory:GsSongFactory) : GsTremoloBarEffect
	{
		var effect:GsTremoloBarEffect = factory.NewTremoloBarEffect();
		effect.Type = this.Type;
		effect.Value = this.Value;
		for(i in 0 ... this.Points.length)
		{
			var point:GsTremoloBarPoint = this.Points[i];
			effect.Points.push(new GsTremoloBarPoint(point.Position, point.Value, point.Vibrato));	
		}
		return effect;
	}
}