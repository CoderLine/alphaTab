package net.alphatab.model;

/**
 * represents a n:m tuplet
 */
class Tuplet
{
	public static inline var NORMAL:Tuplet = new Tuplet();
	
	public var enters:Int;
	public var times:Int;
	
	public function new()
	{
		enters = 1;
		times = 1;
	}
	
	public function copy(tuplet:Tuplet) : Void
	{
		tuplet.enters = enters;
		tuplet.times = times;
	}
	
	public function convertTime(time:Int) : Int
	{
		return Math.floor(time * times / enters);
	}
	
	public function equals(tuplet:Tuplet) : Bool
	{
		return enters == tuplet.enters && times == tuplet.times;
	}
		
	public function clone(factory:SongFactory) : Tuplet
	{
		var tuplet:Tuplet = factory.newTuplet();
		copy(tuplet);
		return tuplet;
	}
}