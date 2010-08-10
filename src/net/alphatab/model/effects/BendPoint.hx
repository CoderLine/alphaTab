package net.alphatab.model.effects;

/**
 * A single point within the BendEffect 
 */
class BendPoint 
{
	public var position:Int;
	public var value:Int;
	public var vibrato:Bool;
		
	public function new(position:Int = 0, value:Int = 0, vibrato:Bool = false)
	{
		this.position = position;
		this.value = value;
		this.vibrato = vibrato;
	}
	
	public function GetTime(duration:Int) : Int
	{
		return Math.floor(duration * position / BendEffect.MAX_POSITION);
	}
}