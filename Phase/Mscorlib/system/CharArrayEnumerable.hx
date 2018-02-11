package system;

import system.collections.generic.IEnumerable;
import system.collections.generic.IEnumerator;

class CharArrayEnumerable implements IEnumerable<Char>
{
	private var _array:js.html.Uint16Array;
	public function new(array:js.html.Uint16Array)
	{
		_array= array;
	}

	public function GetEnumerator() : IEnumerator<Char>
	{
		return new CharArrayEnumerator(_array);
	}
}