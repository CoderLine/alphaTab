/**
 * ...
 * @author Zenas
 */

package net.alphatab.platform.flash;

class Line {
	public var a : Float;
	public var b : Float;
	public var c : Float;
	
	public function IsCSet() : Bool
	{
		return c == 0;
	}
	
	public function new(a:Float=0,b:Float=0,?c:Float){
			this.a = a;
			this.b = b;
			this.c = c;
	}
}