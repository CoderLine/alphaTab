package system;

import system.collections.generic.IEnumerable;
import system.collections.generic.IEnumerator;

class ByteArrayEnumerable implements IEnumerable<Byte>
{
	private var _array:js.html.Uint8Array;
	public function new(array:js.html.Uint8Array)
	{
		_array= array;
	}

	public function GetEnumerator() : IEnumerator<Byte>
	{
		return new ByteArrayEnumerator(_array);
	}
}