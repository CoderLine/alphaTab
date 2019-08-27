package system;

abstract Nullable<T>(Null<T>) from T
{
	public inline function new(t:T) this = t;
	
	public var value(get, never):T;
	public inline function get_value() : T return this;
}