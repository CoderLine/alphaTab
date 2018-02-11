package system;

import system.collections.generic.IEnumerator;

class Int16ArrayEnumerator implements IEnumerator<Int16>
{
	private var _array:js.html.Int16Array;
	private var _i:Int;
	
	public function new(array:js.html.Int16Array)
	{
		_array = array;
		_i = -1;
	}
	
	public var Current(get, never):Int16;
	public function get_Current() : Int16 return _array[_i];
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