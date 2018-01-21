package system;

abstract Nullable<T>(Null<T>) from T
{
	public inline function new(t:T) this = t;
	
	public var Value(get, never):T;
	public inline function get_Value() : T return this;
}