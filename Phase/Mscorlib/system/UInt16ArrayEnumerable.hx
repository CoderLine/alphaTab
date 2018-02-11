package system;

import system.collections.generic.IEnumerable;
import system.collections.generic.IEnumerator;

class UInt16ArrayEnumerable implements IEnumerable<UInt16>
{
	private var _array:js.html.Uint16Array;
	public function new(array:js.html.Uint16Array)
	{
		_array= array;
	}

	public function GetEnumerator() : IEnumerator<UInt16>
	{
		return new UInt16ArrayEnumerator(_array);
	}
}