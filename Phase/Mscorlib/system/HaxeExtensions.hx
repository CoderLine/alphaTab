package system;

class StringExtensions
{
	public static inline function toHaxeString(s:String) return s;
}

class IntExtensions
{
	public static inline function toHaxeInt(i:Int) return i;
	public static inline function toChar_IFormatProvider(i:Int, provider:IFormatProvider) : system.Char return i;
	public static inline function toSByte_IFormatProvider(i:Int, provider:IFormatProvider) : system.SByte return i;
	public static inline function toByte_IFormatProvider(i:Int, provider:IFormatProvider) : system.Byte return i;
	public static inline function toInt16_IFormatProvider(i:Int, provider:IFormatProvider) : system.Int16 return i;
	public static inline function toUInt16_IFormatProvider(i:Int, provider:IFormatProvider) : system.UInt16 return i;
	public static inline function toInt32_IFormatProvider(i:Int, provider:IFormatProvider) : system.Int32 return i;
	public static inline function toUInt32_IFormatProvider(i:Int, provider:IFormatProvider) : system.UInt32 return i;
	public static inline function toInt64_IFormatProvider(i:Int, provider:IFormatProvider) : system.Int64 return i;
	public static inline function toUInt64_IFormatProvider(i:Int, provider:IFormatProvider) : system.UInt64 return i;
	public static inline function toSingle_IFormatProvider(i:Int, provider:IFormatProvider) : system.Single return i;
	public static inline function toDouble_IFormatProvider(i:Int, provider:IFormatProvider) : system.Double return i;
}
class FloatExtensions
{
	public static inline function toHaxeFloat(f:Float) return f;

	public static inline function toChar_IFormatProvider(i:Float, provider:IFormatProvider) : system.Char return Std.int(i);
	public static inline function toSByte_IFormatProvider(i:Float, provider:IFormatProvider) : system.SByte return Std.int(i);
	public static inline function toByte_IFormatProvider(i:Float, provider:IFormatProvider) : system.Byte return Std.int(i);
	public static inline function toInt16_IFormatProvider(i:Float, provider:IFormatProvider) : system.Int16 return Std.int(i);
	public static inline function toUInt16_IFormatProvider(i:Float, provider:IFormatProvider) : system.UInt16 return Std.int(i);
	public static inline function toInt32_IFormatProvider(i:Float, provider:IFormatProvider) : system.Int32 return Std.int(i);
	public static inline function toUInt32_IFormatProvider(i:Float, provider:IFormatProvider) : system.UInt32 return Std.int(i);
	public static inline function toInt64_IFormatProvider(i:Float, provider:IFormatProvider) : system.Int64 return Std.int(i);
	public static inline function toUInt64_IFormatProvider(i:Float, provider:IFormatProvider) : system.UInt64 return Std.int(i);
	public static inline function toSingle_IFormatProvider(i:Float, provider:IFormatProvider) : system.Single return Std.int(i);
	public static inline function toDouble_IFormatProvider(i:Float, provider:IFormatProvider) : system.Double return Std.int(i);
}