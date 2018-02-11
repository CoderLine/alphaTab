package system;

import system.collections.generic.IEnumerable;
import system.collections.generic.IEnumerator;

class SingleArrayEnumerable implements IEnumerable<Single>
{
	private var _array:js.html.Float32Array;
	public function new(array:js.html.Float32Array)
	{
		_array= array;
	}

	public function GetEnumerator() : IEnumerator<Single>
	{
		return new SingleArrayEnumerator(_array);
	}
}