package system;

import system.collections.generic.IEnumerator;

class UInt64ArrayEnumerator implements IEnumerator<UInt64>
{
	private var _array:js.html.Uint32Array;
	private var _i:Int;
	
	public function new(array:js.html.Uint32Array)
	{
		_array = array;
		_i = -1;
	}
	
	public var current(get, never):UInt64;
	public function get_current() : UInt64 return _array[_i];
	public function moveNext() : Bool
	{
		if(_i >= _array.length - 1) return false;
		_i++;
		return true;
		
	}
	public function reset():Void
	{
		_i = -1;
	}
}