package system;

import system.collections.generic.IEnumerator;

class DoubleArrayEnumerator implements IEnumerator<Double>
{
	private var _array:js.html.Float64Array;
	private var _i:Int;
	
	public function new(array:js.html.Float64Array)
	{
		_array = array;
		_i = -1;
	}
	
	public var current(get, never):Double;
	public function get_current() : Double return _array[_i];
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