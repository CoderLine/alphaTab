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
	
	public var Current(get, never):Double;
	public function get_Current() : Double return _array[_i];
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