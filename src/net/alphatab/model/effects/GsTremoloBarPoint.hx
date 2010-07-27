/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model.effects;

class GsTremoloBarPoint 
{
	public var Position:Int;
	public var Value:Int;
	public var Vibrato:Bool;
	
	public static inline var SemiToneLength =  1;
	public static inline var MaxPositionLength =  12;
	public static inline var MaxValueLength = SemiToneLength * 12;

	public function new(position:Int = 0, value:Int = 0, vibrato:Bool = false)
	{
		this.Position = position;
		this.Value = value;
		this.Vibrato = vibrato;
	}
	
	public function GetTime(duration:Int) : Int
	{
		return Math.floor(duration * this.Position / GsTremoloBarEffect.MaxPositionLength);	
	}
}