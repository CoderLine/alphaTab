package system;

import system.collections.generic.IEnumerable;
import system.collections.generic.IEnumerator;

class DoubleArrayEnumerable implements IEnumerable<Double>
{
	private var _array:js.html.Float64Array;
	public function new(array:js.html.Float64Array)
	{
		_array= array;
	}

	public function GetEnumerator() : IEnumerator<Double>
	{
		return new DoubleArrayEnumerator(_array);
	}
}