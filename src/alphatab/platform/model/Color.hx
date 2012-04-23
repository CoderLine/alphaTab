package alphatab.platform.model;
import haxe.Int32;

/**
 * A RGB color number which stores the number as a 4byte integer;
 */
class Color 
{
	private var _value:Int32;
	
	public function new(r:Int, g:Int, b:Int, a:Int = 0xFF) 
	{
		var upper = ((a & 0xFF) << 16) | (r & 0xFF);
		var lower = ((g & 0xFF) << 16) | (b & 0xFF);
		_value = Int32.make(upper, lower);
	}
	
	public inline function getA() : Int
	{
		return Int32.toInt(Int32.and(_value, Int32.make(0xFF00, 0x0000)));
	}	
	
	public inline function getR() : Int
	{
		return Int32.toInt(Int32.and(_value, Int32.make(0x00FF, 0x0000)));
	}
		
	public inline function getG() : Int
	{
		return Int32.toInt(Int32.and(_value, Int32.make(0x0000, 0xFF00)));
	}
			
	public inline function getB() : Int
	{
		return Int32.toInt(Int32.and(_value, Int32.make(0x0000, 0x00FF)));
	}
	
	public function toHexString() : String
	{
		return "#" + StringTools.hex(getA(), 2) + StringTools.hex(getR(), 2) + StringTools.hex(getG(), 2) + StringTools.hex(getB(), 2);
	}
}