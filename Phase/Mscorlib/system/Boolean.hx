package system;

abstract Boolean(Bool) from Bool to Bool
{
	public inline function new(v:Bool) this = v;
	
	public inline function ToHaxeBool() : Bool return this;
	public inline function ToString() : system.CsString return Std.string(this);

	@:op(!A) public inline function not() : system.Boolean return !this;
	
    @:op(A == B) public static function eq(lhs : system.Boolean, rhs : system.Boolean) : system.Boolean;
    @:op(A != B) public static function neq(lhs : system.Boolean, rhs : system.Boolean) : system.Boolean;
    @:op(A & B) public static function and(lhs : system.Boolean, rhs : system.Boolean) : system.Boolean;
    @:op(A | B) public static function or(lhs : system.Boolean, rhs : system.Boolean) : system.Boolean;
    @:op(A ^ B) public static function xor(lhs : system.Boolean, rhs : system.Boolean) : system.Boolean;
}