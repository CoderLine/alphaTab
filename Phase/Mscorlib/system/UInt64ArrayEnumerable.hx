package system;

import system.collections.generic.IEnumerable;
import system.collections.generic.IEnumerator;

class UInt64ArrayEnumerable implements IEnumerable<UInt64>
{
	private var _array:js.html.Uint32Array;
	public function new(array:js.html.Uint32Array)
	{
		_array= array;
	}

	public function GetEnumerator() : IEnumerator<UInt64>
	{
		return new UInt64ArrayEnumerator(_array);
	}
}