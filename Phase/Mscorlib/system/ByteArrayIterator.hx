package system;

class ByteArrayIterator
{
	private var _array:js.html.Uint8Array;
	private var _i:Int;
	
	public function new(array:js.html.Uint8Array) 
	{
		_array = array;
		_i = 0;
	}

	public function hasNext() return _i < _array.length - 1;
	public function next() : Byte
	{
		return _array[_i++];
	}
}