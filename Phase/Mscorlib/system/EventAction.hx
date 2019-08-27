package system;

abstract EventAction(Array<Void->Void>) 
{
	public inline function new(v:Void->Void) this = v == null ? null : [v];
	
	@:to public inline function toLambda() : Void->Void return invoke;
	
	public inline function toArray() return this;
	@:op(A + B) public static function add(lhs : EventAction, rhs : Void->Void) : EventAction
	{
		if(lhs == null)
		{
			lhs = new EventAction(rhs);
		}
		else
		{
			lhs.toArray().push(rhs);
		}	
		return lhs;
	}
	
    @:op(A - B) public static function sub(lhs : EventAction, rhs : Void->Void) : EventAction
	{
		var raw = lhs.toArray();
		var index = raw.indexOf(rhs);
		if(index != -1)
		{
			raw.splice(index, 1);
			if(raw.length == 0)
			{
				return null;
			}
		}
		return lhs;
	}
	
	public function invoke() : Void
	{
		if(this == null) return;
		for (x in this)
		{
			x();
		}
	}
}