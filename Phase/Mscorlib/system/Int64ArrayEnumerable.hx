package system;

import system.collections.generic.IEnumerable;
import system.collections.generic.IEnumerator;

class Int64ArrayEnumerable implements IEnumerable<Int64>
{
	private var _array:js.html.Int32Array;
	public function new(array:js.html.Int32Array)
	{
		_array= array;
	}

	public function GetEnumerator() : IEnumerator<Int64>
	{
		return new Int64ArrayEnumerator(_array);
	}
}