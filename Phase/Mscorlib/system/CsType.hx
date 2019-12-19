package system;

abstract CsType(Class<Dynamic>) from Class<Dynamic> to Class<Dynamic>
{
	public function new(cls : Class<Dynamic>) this = cls;
	
	public var name(get,never):CsString;
	public function get_name() : CsString 
	{
		var fullName = Type.getClassName(this);
		var i = fullName.lastIndexOf(".");
		return i >= 0 ? fullName.substring(i + 1) : fullName;
	}
    
	@:op(A == B) public inline static function eq(lhs : CsType, rhs : CsType) : system.Boolean return Type.getClassName(lhs) == Type.getClassName(rhs);
	
    @:op(A != B) public inline static function neq(lhs : CsType, rhs : CsType) : system.Boolean return Type.getClassName(lhs) != Type.getClassName(rhs);

}