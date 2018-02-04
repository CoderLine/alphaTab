package system.collections.generic;

class IterableEnumerable<T> implements IEnumerable<T>
{
	private var _iterable:Iterable<T>;
	public function new(i:Iterable<T>)
	{
		_iterable= i;
	}

	public function GetEnumerator() : IEnumerator<T>
	{
		return new IteratorEnumerator(_iterable.iterator());
	}
}