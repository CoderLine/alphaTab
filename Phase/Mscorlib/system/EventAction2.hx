package system;

abstract EventAction2<T1, T2>(Array<T1->T2->Void>) 
{
	public inline function new(v:T1->T2->Void) this = v == null ? null : [v];
		
	@:to public inline function ToLambda() : T1->T2->Void return Invoke;
	
	public inline function ToArray() return this;
	@:op(A + B) public static function add<T1, T2>(lhs : EventAction2<T1, T2>, rhs : T1->T2->Void) : EventAction2<T1, T2>
	{
		if(lhs == null)
		{
			lhs = new EventAction2(rhs);
		}
		else
		{
			lhs.ToArray().push(rhs);
		}	
		return lhs;
	}
	
    @:op(A - B) public static function sub<T1, T2>(lhs : EventAction2<T1, T2>, rhs : T1->T2->Void) : EventAction2<T1, T2>
	{
		var raw = lhs.ToArray();
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
	
	public function Invoke(p1:T1, p2:T2) : Void
	{
		if(this == null) return;
		for (x in this)
		{
			x(p1, p2);
		}
	}
}