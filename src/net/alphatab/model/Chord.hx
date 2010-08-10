package net.alphatab.model;

/**
 * A chord annotation for beats
 */
class Chord
{
	public var beat:Beat;
	public var firstFret:Int;
	public var strings:Array<Int>;	
	public var name:String;
	
	public function stringCount() : Int
	{
		return strings.length;
	}
	
	public function noteCount() : Int
	{
		var count:Int = 0;
		for(i in 0 ... strings.length)
		{
			if(strings[i] >= 0)
				count++;
		}
		return count;
	}
	
	public function new(length:Int)
	{
		strings = new Array<Int>();
		for(i in 0 ... length)
		{
			strings.push(-1);
		}
	}
}