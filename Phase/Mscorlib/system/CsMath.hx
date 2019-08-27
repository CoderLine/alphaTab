package system;

class CsMath 
{
	public static inline function min_Byte_Byte(a:Byte, b:Byte) : Byte return untyped Math.min(a.toHaxeInt(), b.toHaxeInt());
	public static inline function min_Int32_Int32(a:Int32, b:Int32) : Int32 return untyped Math.min(a.toHaxeInt(), b.toHaxeInt());
	public static inline function min_Double_Double(a:Double, b:Double) : Double return untyped Math.min(a.toHaxeFloat(), b.toHaxeFloat());
	public static inline function max_Int32_Int32(a:Int32, b:Int32) : Int32 return untyped Math.max(a.toHaxeInt(), b.toHaxeInt());
	public static inline function max_Byte_Byte(a:Byte, b:Byte) : Byte return untyped Math.max(a.toHaxeInt(), b.toHaxeInt());
	public static inline function min_Int64_Int64(a:system.Int64, b:system.Int64) : system.Int64 return a.toHaxeInt() < b.toHaxeInt() ? a : b;
	public static inline function max_Single_Single(a:Single, b:Single) : Single return Math.max(a.toHaxeFloat(), b.toHaxeFloat());
	public static inline function max_Double_Double(a:Double, b:Double) : Double return Math.max(a.toHaxeFloat(), b.toHaxeFloat());
	public static inline function min_Single_Single(a:Single, b:Single) : Single return Math.min(a.toHaxeFloat(), b.toHaxeFloat());
	public static inline function abs_Single(a:Single) : Single return Math.abs(a.toHaxeFloat());
	public static inline function abs_Int32(a:Int32) : Int32 return untyped Math.abs(a.toHaxeInt());
	public static inline function round_Double(a:Double) : Double return Math.round(a.toHaxeFloat());
	public static inline function round_Single(a:Single) : Single return Math.round(a.toHaxeFloat());
	public static inline function sin(a:Double) : Double return Math.sin(a.toHaxeFloat());
	public static inline function cos(a:Double) : Double return Math.cos(a.toHaxeFloat());
	public static inline function tan(a:Double) : Double return Math.tan(a.toHaxeFloat());
	public static inline function pow(v:Double, exp:Double) : Double return Math.pow(v.toHaxeFloat(), exp.toHaxeFloat());
	public static inline function ceiling_Single(v:Single) : Single return Math.ceil(v.toHaxeFloat());
	public static inline function ceiling_Double(v:Double) : Double return Math.ceil(v.toHaxeFloat());
	public static inline function floor_Single(v:Single) : Single return Math.floor(v.toHaxeFloat());
	public static inline function floor_Double(v:Double) : Double return Math.floor(v.toHaxeFloat());
	public static inline function sign_Single(v:Single) : Single return Math.floor(v.toHaxeFloat());
	public static inline function sign_Double(v:Double) : system.Int32 return if( v < 0 ) -1 else if (v > 0) 1 else 0;
	public static inline function log_Double(a:Double) : system.Double return Math.log(a.toHaxeFloat());
	public static inline function log_Double_Double(a:Double, newBase:Double) : system.Double return Math.log(a.toHaxeFloat()) / Math.log(newBase.toHaxeFloat());
	public static inline function log10(a:Double) : system.Double return log_Double_Double(a, 10);
	public static inline function abs_Double(v:Double) : Double return Math.abs(v.toHaxeFloat());
	public static inline function sqrt(v:Double) : Double return Math.sqrt(v.toHaxeFloat());
	public static inline function exp(v:Double) : Double return Math.exp(v.toHaxeFloat());
	public static inline function asin(v:Double) : Double return Math.asin(v.toHaxeFloat());

}