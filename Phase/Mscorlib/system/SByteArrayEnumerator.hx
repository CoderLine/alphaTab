package system;

import system.collections.generic.IEnumerator;

class SByteArrayEnumerator implements IEnumerator<SByte>
{
	private var _array:js.html.Int8Array;
	private var _i:Int;
	
	public function new(array:js.html.Int8Array)
	{
		_array = array;
		_i = -1;
	}
	
	public var Current(get, never):SByte;
	public function get_Current() : SByte return _array[_i];
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