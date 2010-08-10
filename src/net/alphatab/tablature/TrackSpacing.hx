package net.alphatab.tablature;

/**
 * A container which contains a value for each track spacing. 
 */
class TrackSpacing 
{
	public var spacing:Array<Int>;
	
	public function new() 
	{
		spacing = new Array<Int>();
		for (i in 0 ... 24) 
		{
			spacing.push(0);
		}
	}
	
	public function get(index:TrackSpacingPositions) : Int
	{
		var size = 0;
		var realIndex:Int = TrackSpacingPositionConverter.toInt(index);
		for (i in 0 ... realIndex)
		{
			size += spacing[i];
		}
		return size;
	}
	
	public function set(index:TrackSpacingPositions, value:Int) : Void
	{
		var realIndex:Int = TrackSpacingPositionConverter.toInt(index);
		spacing[realIndex] = value;
	}
	
	public function getSize() : Int
	{
		return this.get(TrackSpacingPositions.Bottom);
	}
}