package net.alphatab.model;

/**
 * A padding construct. 
 */
class Padding 
{
	public var right:Int;
	public var top:Int;
	public var left:Int;
	public var bottom:Int;

	public function new(right:Int, top:Int, left:Int, bottom:Int) 
	{
		this.right = right;
		this.top = top;
		this.left = left;
		this.bottom = bottom;
	}
	
	public function getHorizontal() : Int
	{
		return left + right;
	}
		
	public function getVertical() : Int
	{
		return top + bottom;
	}
	
}