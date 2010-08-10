package net.alphatab.model;

/**
 * A RGB Color.
 */
class Color
{
	public static inline var Black:Color = new Color(0, 0, 0);
	public static inline var Red:Color = new Color(255, 0, 0);
	
	public var r:Int;
	public var g:Int;
	public var b:Int; 
	
	public function new(r:Int = 0, g:Int = 0, b:Int = 0)
	{
		this.r = r;
		this.g = g;
		this.b = b;
	}
	
	public function toString() : String
	{
		var s:String = "rgb(";
		s += Std.string(this.r) + "," ;
		s += Std.string(this.g) + "," ;
		s += Std.string(this.b) + ")" ;
		return s;
	}
}