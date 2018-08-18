package system;

abstract CsType<T>(Class<T>) from Class<T> to Class<T>
{
	public function new(cls : Class<T>) this = cls;
	
	public var Name(get,never):CsString;
	public function get_Name() : CsString 
	{
		var fullName = Type.getClassName(this);
		var i = fullName.lastIndexOf(".");
		return i >= 0 ? fullName.substring(i + 1) : fullName;
	}
	
	@:op(A == B) public inline static function eq<T1, T2>(lhs : CsType<T1>, rhs : CsType<T2>) : system.Boolean return Type.getClassName(lhs) == Type.getClassName(rhs);
	
    @:op(A != B) public inline static function neq<T1, T2>(lhs : CsType<T1>, rhs : CsType<T2>) : system.Boolean return Type.getClassName(lhs) != Type.getClassName(rhs);

}