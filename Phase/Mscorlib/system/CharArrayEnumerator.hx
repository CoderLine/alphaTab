package system;

import system.collections.generic.IEnumerator;

class CharArrayEnumerator implements IEnumerator<Char>
{
	private var _array:js.html.Uint16Array;
	private var _i:Int;
	
	public function new(array:js.html.Uint16Array)
	{
		_array = array;
		_i = -1;
	}
	
	public var current(get, never):Char;
	public function get_current() : Char return _array[_i];
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