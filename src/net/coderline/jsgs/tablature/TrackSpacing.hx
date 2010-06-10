/**
 * ...
 * @author Daniel Kuschny
 */

package net.coderline.jsgs.tablature;

class TrackSpacing 
{
	public var Spacing:Array<Int>;
	public function new() 
	{
		this.Spacing = new Array<Int>();
		for (i in 0 ... 22) 
		{
			this.Spacing.push(0);
		}
	}
	
	public function Get(index:TrackSpacingPositions) : Int
	{
		var spacing = 0;
		var realIndex:Int = TrackSpacingPositionConverter.ToInt(index);
		for (i in 0 ... realIndex)
		{
			spacing += this.Spacing[i];
		}
		return spacing;
	}
	
	public function Set(index:TrackSpacingPositions, value:Int) : Void
	{
		var realIndex:Int = TrackSpacingPositionConverter.ToInt(index);
		this.Spacing[realIndex] = value;
	}
	
	public function GetSize() : Int
	{
		return this.Get(TrackSpacingPositions.Bottom);
	}
}