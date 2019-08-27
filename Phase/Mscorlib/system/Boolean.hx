package system;

abstract Boolean(Bool) from Bool to Bool
{
	public inline function new(v:Bool) this = v;
	
	public inline function toHaxeBool() : Bool return this;
	public inline function toString() : system.CsString return Std.string(this);

	@:op(!A) public inline function not() : system.Boolean return !this;
	
    @:op(A == B) public static function eq(lhs : system.Boolean, rhs : system.Boolean) : system.Boolean;
    @:op(A != B) public static function neq(lhs : system.Boolean, rhs : system.Boolean) : system.Boolean;
    @:op(A & B) public static inline function and(lhs : system.Boolean, rhs : system.Boolean) : system.Boolean return lhs && rhs;
    @:op(A | B) public static inline function or(lhs : system.Boolean, rhs : system.Boolean) : system.Boolean return lhs || rhs;
    @:op(A ^ B) public static inline function xor(lhs : system.Boolean, rhs : system.Boolean) : system.Boolean return lhs != rhs;
}