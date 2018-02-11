package system;

class ObjectExtensions 
{
	public static inline function ToString(v:system.Object) : CsString  return Std.string(v);
	public static inline function ReferenceEquals(a:system.Object, b:system.Object) : system.Boolean return a == b;
	public static inline function GetType<T>(a:T) : system.CsType<T> return new system.CsType<T>(Type.getClass(a));
	
	public static function Equals_Object<T1, T2>(left:T1, right:T2) : Bool
	{
		var equals = Reflect.field(left, "Equals");
		if(equals == null)
		{
			equals = Reflect.field(left, "Equals_Object");
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