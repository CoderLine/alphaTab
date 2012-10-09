package alphatab.util;

class LazyVar<T>
{
	private var _val:T;
	private var _loader:Void->T;
	private var _loaded:Bool;
	
	public function getValue() 
	{
		if (!_loaded) {
			_val = _loader();
			_loaded = true;
		}
		return _val;
	}
	
	public function new(loader: Void->T) 
	{
		_loader = loader;
	}
	
}