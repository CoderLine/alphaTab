package system.collections.generic;

class IteratorEnumerator<T> implements IEnumerator<T>
{
	private var _it:Iterator<T>;
	private var _current:T;
	
	public function new(i:Iterator<T>)
	{
		_it = i;
	}
	
	public var Current(get, never):T;
	public function get_Current() : T return _current;
	public function MoveNext() : Bool
	{
		if(_it.hasNext())
		{
			_current = _it.next();
			return true;
		}
		return false;
		
	}
	public function Reset():Void
	{
		throw "not supported";
	}
}