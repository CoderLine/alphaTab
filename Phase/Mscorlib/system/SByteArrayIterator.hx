package system;

class SByteArrayIterator
{
	private var _array:js.html.Int8Array;
	private var _i:Int;
	
	public function new(array:js.html.Int8Array) 
	{
		_array = array;
		_i = 0;
	}

	public function hasNext() return _i < _array.length - 1;
	public function next() : SByte
	{
		return _array[_i++];
	}
}