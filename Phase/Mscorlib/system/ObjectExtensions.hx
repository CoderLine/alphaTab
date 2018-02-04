package system;

class ObjectExtensions 
{
	public static inline function ToString(v:system.Object) : CsString  return Std.string(v);
	public static inline function ReferenceEquals(a:system.Object, b:system.Object) : system.Boolean return a == b;
	public static inline function GetType<T>(a:T) : system.CsType<T> return new system.CsType<T>(Type.getClass(a));
	
}