package alphatab.rendering.staves;

/**
 * This class stores size information about a stave. 
 * It is used by the layout engine to collect the sizes of score parts
 * to align the parts across multiple staves.
 */
class BarSizeInfo 
{
	public var fullWidth:Int;
	public var sizes:Hash<Array<Int>>;
	
	public function new() 
	{
		sizes = new Hash<Array<Int>>();
	}
	
	public function setSize(key:String, size:Int)
	{
		sizes.set(key, [size]);
	}
	
	public function getSize(key:String)
	{
		if (sizes.exists(key))
		{
			return sizes.get(key)[0];
		}
		return 0;
	}
	
	public function getIndexedSize(key:String, index:Int)
	{
		if (sizes.exists(key))
		{
			return sizes.get(key)[index];
		}
		return 0;
	}
	
	public function setIndexedSize(key:String, index:Int, size:Int) 
	{
		if (!sizes.exists(key))
		{
			sizes.set(key, new Array<Int>());
		}
		
		sizes.get(key)[index] = size;
	}
}