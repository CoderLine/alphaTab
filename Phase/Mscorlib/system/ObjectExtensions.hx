package system;

class ObjectExtensions 
{
	public static inline function toString(v:system.Object) : CsString  return Std.string(v);
	public static inline function referenceEquals(a:system.Object, b:system.Object) : system.Boolean return a == b;
	public static inline function getType<T>(a:T) : system.CsType<T> return new system.CsType<T>(Type.getClass(a));
	
	public static function equals_Object<T1, T2>(left:T1, right:T2) : Bool
	{
		var equals = Reflect.field(left, "equals");
		if(equals == null)
		{
			equals = Reflect.field(left, "equals_Object");
		}
		
		if(equals != null)
		{
			return Reflect.callMethod(left, cast equals, [right]);
		}
		else
		{
			return untyped left == untyped right;
		}
	}
}