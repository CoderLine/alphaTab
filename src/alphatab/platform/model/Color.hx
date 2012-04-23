package alphatab.platform.model;
import haxe.Int32;

/**
 * A RGB color number which stores the number as a 4byte integer;
 */
class Color 
{
	private var _lowerBits:Int;
	private var _higherBits:Int;
	
	public function new(r:Int, g:Int, b:Int, a:Int = 0xFF) 
	{
		_higherBits = ((a & 0xFF) << 8) | (r & 0xFF);
		_lowerBits = ((g & 0xFF) << 8) | (b & 0xFF);
	}
	
	public function getA() : Int
	{
		return (_higherBits >> 8) & 0xFF;
	}	
	
	public function getR() : Int
	{
		return _higherBits & 0xFF;
	}
		
	public function getG() : Int
	{
		return (_lowerBits >> 8) & 0xFF;
	}
			
	public function getB() : Int
	{
		return _lowerBits & 0xFF;
	}
	
	public function toHexString() : String
	{
		return "#" + StringTools.hex(getA(), 2) + StringTools.hex(getR(), 2) + StringTools.hex(getG(), 2) + StringTools.hex(getB(), 2);
	}	
	public function toRgbaString() : String
	{
		return "rgba(" + getR() + "," + getG() + "," + getB() + "," + (getA() / 255.0) + ")";
	}
}