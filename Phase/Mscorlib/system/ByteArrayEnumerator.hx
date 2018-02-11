package system;

import system.collections.generic.IEnumerator;

class ByteArrayEnumerator implements IEnumerator<Byte>
{
	private var _array:js.html.Uint8Array;
	private var _i:Int;
	
	public function new(array:js.html.Uint8Array)
	{
		_array = array;
		_i = -1;
	}
	
	public var Current(get, never):Byte;
	public function get_Current() : Byte return _array[_i];
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