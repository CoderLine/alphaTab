package system;

class DoubleArrayIterator
{
	private var _array:js.html.Float64Array;
	private var _i:Int;
	
	public function new(array:js.html.Float64Array) 
	{
		_array = array;
		_i = 0;
	}

	public function hasNext() return _i < _array.length - 1;
	public function next() : Double
	{
		return _array[_i++];
	}
}