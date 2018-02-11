package system;

import system.collections.generic.IEnumerator;

class UInt32ArrayEnumerator implements IEnumerator<UInt32>
{
	private var _array:js.html.Uint32Array;
	private var _i:Int;
	
	public function new(array:js.html.Uint32Array)
	{
		_array = array;
		_i = -1;
	}
	
	public var Current(get, never):UInt32;
	public function get_Current() : UInt32 return _array[_i];
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