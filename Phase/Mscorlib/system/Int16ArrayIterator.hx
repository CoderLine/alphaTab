package system;

class Int16ArrayIterator
{
	private var _array:js.html.Int16Array;
	private var _i:Int;
	
	public function new(array:js.html.Int16Array) 
	{
		_array = array;
		_i = 0;
	}

	public function hasNext() return _i < _array.length - 1;
	public function next() : Int16
	{
		return _array[_i++];
	}
}