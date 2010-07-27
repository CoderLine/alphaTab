/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.model;

class Padding 
{
	public var Right:Int;
	public var Top:Int;
	public var Left:Int;
	public var Bottom:Int;

	public function new(right:Int, top:Int, left:Int, bottom:Int) 
	{
		this.Right = right;
		this.Top = top;
		this.Left = left;
		this.Bottom = bottom;
	}
	
	public function getHorizontal() : Int
	{
		return this.Left + this.Right;
	}
		
	public function getVertical() : Int
	{
		return this.Top + this.Bottom;
	}
	
}