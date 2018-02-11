package system;

import system.collections.generic.IEnumerable;
import system.collections.generic.IEnumerator;

class UInt32ArrayEnumerable implements IEnumerable<UInt32>
{
	private var _array:js.html.Uint32Array;
	public function new(array:js.html.Uint32Array)
	{
		_array= array;
	}

	public function GetEnumerator() : IEnumerator<UInt32>
	{
		return new UInt32ArrayEnumerator(_array);
	}
}