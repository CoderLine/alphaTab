package system;

import system.collections.generic.IEnumerable;
import system.collections.generic.IEnumerator;

class SByteArrayEnumerable implements IEnumerable<SByte>
{
	private var _array:js.html.Int8Array;
	public function new(array:js.html.Int8Array)
	{
		_array= array;
	}

	public function GetEnumerator() : IEnumerator<SByte>
	{
		return new SByteArrayEnumerator(_array);
	}
}