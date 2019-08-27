package system;

abstract EventAction1<T1>(Array<T1->Void>) 
{
	public inline function new(v:T1->Void) this = v == null ? null : [v];
	
	
	@:to public inline function toLambda() : T1->Void return invoke;
	
	public inline function toArray() return this;
	@:op(A + B) public static function add<T1>(lhs : EventAction1<T1>, rhs : T1->Void) : EventAction1<T1>
	{
		if(lhs == null)
		{
			lhs = new EventAction1(rhs);
		}
		else
		{
			lhs.toArray().push(rhs);
		}	
		return lhs;
	}
	
    @:op(A - B) public static function sub<T1>(lhs : EventAction1<T1>, rhs : T1->Void) : EventAction1<T1>
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
	
	
	public function invoke(p:T1) : Void
	{
		if(this == null) return;
		for (x in this)
		{
			x(p);
		}
	}
}