package system;

import system.collections.generic.IEnumerator;

class Int64ArrayEnumerator implements IEnumerator<Int64>
{
	private var _array:js.html.Int32Array;
	private var _i:Int;
	
	public function new(array:js.html.Int32Array)
	{
		_array = array;
		_i = -1;
	}
	
	public var Current(get, never):Int64;
	public function get_Current() : Int64 return _array[_i];
	public function MoveNext() : Bool
	{
		if(_i >= _array.length - 1) return false;
		_i++;
		return true;
		
	}
	public function Reset():Void
	{
		_i = -1;
	}
}