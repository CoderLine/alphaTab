package system;

import system.collections.generic.IEnumerable;
import system.collections.generic.IEnumerator;

class Int16ArrayEnumerable implements IEnumerable<Int16>
{
	private var _array:js.html.Int16Array;
	public function new(array:js.html.Int16Array)
	{
		_array= array;
	}

	public function GetEnumerator() : IEnumerator<Int16>
	{
		return new Int16ArrayEnumerator(_array);
	}
}