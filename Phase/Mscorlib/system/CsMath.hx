package system;

class CsMath 
{
	public static inline function Min_Int32_Int32(a:Int32, b:Int32) : Int32 return untyped Math.min(a.ToHaxeInt(), b.ToHaxeInt());
	public static inline function Max_Int32_Int32(a:Int32, b:Int32) : Int32 return untyped Math.max(a.ToHaxeInt(), b.ToHaxeInt());
	public static inline function Min_Int64_Int64(a:system.Int64, b:system.Int64) : system.Int64 return a.ToHaxeInt() < b.ToHaxeInt() ? a : b;
	public static inline function Max_Single_Single(a:Single, b:Single) : Single return Math.max(a.ToHaxeFloat(), b.ToHaxeFloat());
	public static inline function Min_Single_Single(a:Single, b:Single) : Single return Math.min(a.ToHaxeFloat(), b.ToHaxeFloat());
	public static inline function Abs_Single(a:Single) : Single return Math.abs(a.ToHaxeFloat());
	public static inline function Abs_Int32(a:Int32) : Int32 return untyped Math.abs(a.ToHaxeInt());
	public static inline function Round_Double(a:Double) : Double return Math.round(a.ToHaxeFloat());
	public static inline function Round_Single(a:Single) : Single return Math.round(a.ToHaxeFloat());
	public static inline function Sin(a:Double) : Double return Math.sin(a.ToHaxeFloat());
	public static inline function Pow(v:Single, exp:Single) : Single return Math.pow(v.ToHaxeFloat(), exp.ToHaxeFloat());
	public static inline function Ceiling_Single(v:Single) : Single return Math.ceil(v.ToHaxeFloat());
	public static inline function Ceiling_Double(v:Double) : Double return Math.ceil(v.ToHaxeFloat());
	public static inline function Sqrt(v:Single) : Single return Math.sqrt(v.ToHaxeFloat());
}