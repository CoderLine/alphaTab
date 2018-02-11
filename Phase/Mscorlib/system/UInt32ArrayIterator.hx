package system;

class UInt32ArrayIterator
{
	private var _array:js.html.Uint32Array;
	private var _i:Int;
	
	public function new(array:js.html.Uint32Array) 
	{
		_array = array;
		_i = 0;
	}

	public function hasNext() return _i < _array.length - 1;
	public function next() : UInt32
	{
		return _array[_i++];
	}
}