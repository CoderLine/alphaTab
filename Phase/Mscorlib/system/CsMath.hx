package system;

class CsMath 
{
	public static inline function Min_Byte_Byte(a:Byte, b:Byte) : Byte return untyped Math.min(a.ToHaxeInt(), b.ToHaxeInt());
	public static inline function Min_Int32_Int32(a:Int32, b:Int32) : Int32 return untyped Math.min(a.ToHaxeInt(), b.ToHaxeInt());
	public static inline function Min_Double_Double(a:Double, b:Double) : Double return untyped Math.min(a.ToHaxeFloat(), b.ToHaxeFloat());
	public static inline function Max_Int32_Int32(a:Int32, b:Int32) : Int32 return untyped Math.max(a.ToHaxeInt(), b.ToHaxeInt());
	public static inline function Max_Byte_Byte(a:Byte, b:Byte) : Byte return untyped Math.max(a.ToHaxeInt(), b.ToHaxeInt());
	public static inline function Min_Int64_Int64(a:system.Int64, b:system.Int64) : system.Int64 return a.ToHaxeInt() < b.ToHaxeInt() ? a : b;
	public static inline function Max_Single_Single(a:Single, b:Single) : Single return Math.max(a.ToHaxeFloat(), b.ToHaxeFloat());
	public static inline function Max_Double_Double(a:Double, b:Double) : Double return Math.max(a.ToHaxeFloat(), b.ToHaxeFloat());
	public static inline function Min_Single_Single(a:Single, b:Single) : Single return Math.min(a.ToHaxeFloat(), b.ToHaxeFloat());
	public static inline function Abs_Single(a:Single) : Single return Math.abs(a.ToHaxeFloat());
	public static inline function Abs_Int32(a:Int32) : Int32 return untyped Math.abs(a.ToHaxeInt());
	public static inline function Round_Double(a:Double) : Double return Math.round(a.ToHaxeFloat());
	public static inline function Round_Single(a:Single) : Single return Math.round(a.ToHaxeFloat());
	public static inline function Sin(a:Double) : Double return Math.sin(a.ToHaxeFloat());
	public static inline function Cos(a:Double) : Double return Math.cos(a.ToHaxeFloat());
	public static inline function Tan(a:Double) : Double return Math.tan(a.ToHaxeFloat());
	public static inline function Pow(v:Double, exp:Double) : Double return Math.pow(v.ToHaxeFloat(), exp.ToHaxeFloat());
	public static inline function Ceiling_Single(v:Single) : Single return Math.ceil(v.ToHaxeFloat());
	public static inline function Ceiling_Double(v:Double) : Double return Math.ceil(v.ToHaxeFloat());
	public static inline function Floor_Single(v:Single) : Single return Math.floor(v.ToHaxeFloat());
	public static inline function Floor_Double(v:Double) : Double return Math.floor(v.ToHaxeFloat());
	public static inline function Sign_Single(v:Single) : Single return Math.floor(v.ToHaxeFloat());
	public static inline function Sign_Double(v:Double) : system.Int32 return if( v < 0 ) -1 else if (v > 0) 1 else 0;
	public static inline function Log_Double(a:Double) : system.Double return Math.log(a.ToHaxeFloat());
	public static inline function Log_Double_Double(a:Double, newBase:Double) : system.Double return Math.log(a.ToHaxeFloat()) / Math.log(newBase.ToHaxeFloat());
	public static inline function Log10(a:Double) : system.Double return Log_Double_Double(a, 10);
	public static inline function Abs_Double(v:Double) : Double return Math.abs(v.ToHaxeFloat());
	public static inline function Sqrt(v:Double) : Double return Math.sqrt(v.ToHaxeFloat());
	public static inline function Exp(v:Double) : Double return Math.exp(v.ToHaxeFloat());
	public static inline function Asin(v:Double) : Double return Math.asin(v.ToHaxeFloat());

}