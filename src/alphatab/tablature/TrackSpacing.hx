package alphatab.tablature;

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
	
	public function get(index:Int) : Int
	{
		var size = 0;
		for (i in 0 ... index)
		{
			size += spacing[i];
		}
		return size;
	}
	
	public function set(index:Int, value:Int) : Void
	{
		spacing[index] = value;
	}
	
	public function getSize() : Int
	{
		return this.get(TrackSpacingPositions.Bottom);
	}
}