package system;

import system.collections.generic.IEnumerable;
import system.collections.generic.IEnumerator;

class Int32ArrayEnumerable implements IEnumerable<Int32>
{
	private var _array:js.html.Int32Array;
	public function new(array:js.html.Int32Array)
	{
		_array= array;
	}

	public function GetEnumerator() : IEnumerator<Int32>
	{
		return new Int32ArrayEnumerator(_array);
	}
}