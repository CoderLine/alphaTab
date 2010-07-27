/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class GsColor
{
	public static var Black:GsColor = new GsColor(0, 0, 0);
	public static var Red:GsColor = new GsColor(255, 0, 0);
	
	public var R:Int;
	public var G:Int;
	public var B:Int; 
	
	public function new(r:Int = 0, g:Int = 0, b:Int = 0)
	{
		this.R = r;
		this.G = g;
		this.B = b;
	}
	
	public function toString() : String
	{
		var s:String = "rgb(";
		s += Std.string(this.R) + "," ;
		s += Std.string(this.G) + "," ;
		s += Std.string(this.B) + ")" ;
		return s;
	}
}