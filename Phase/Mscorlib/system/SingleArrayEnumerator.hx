package system;

import system.collections.generic.IEnumerator;

class SingleArrayEnumerator implements IEnumerator<Single>
{
	private var _array:js.html.Float32Array;
	private var _i:Int;
	
	public function new(array:js.html.Float32Array)
	{
		_array = array;
		_i = -1;
	}
	
	public var Current(get, never):Single;
	public function get_Current() : Single return _array[_i];
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