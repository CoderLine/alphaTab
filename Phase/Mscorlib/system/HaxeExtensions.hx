package system;

class StringExtensions
{
	public static inline function ToHaxeString(s:String) return s;
}

class IntExtensions
{
	public static inline function ToHaxeInt(i:Int) return i;
	public static inline function ToChar_IFormatProvider(i:Int, provider:IFormatProvider) : system.Char return i;
	public static inline function ToSByte_IFormatProvider(i:Int, provider:IFormatProvider) : system.SByte return i;
	public static inline function ToByte_IFormatProvider(i:Int, provider:IFormatProvider) : system.Byte return i;
	public static inline function ToInt16_IFormatProvider(i:Int, provider:IFormatProvider) : system.Int16 return i;
	public static inline function ToUInt16_IFormatProvider(i:Int, provider:IFormatProvider) : system.UInt16 return i;
	public static inline function ToInt32_IFormatProvider(i:Int, provider:IFormatProvider) : system.Int32 return i;
	public static inline function ToUInt32_IFormatProvider(i:Int, provider:IFormatProvider) : system.UInt32 return i;
	public static inline function ToInt64_IFormatProvider(i:Int, provider:IFormatProvider) : system.Int64 return i;
	public static inline function ToUInt64_IFormatProvider(i:Int, provider:IFormatProvider) : system.UInt64 return i;
	public static inline function ToSingle_IFormatProvider(i:Int, provider:IFormatProvider) : system.Single return i;
	public static inline function ToDouble_IFormatProvider(i:Int, provider:IFormatProvider) : system.Double return i;
}
class FloatExtensions
{
	public static inline function ToHaxeFloat(f:Float) return f;

	public static inline function ToChar_IFormatProvider(i:Float, provider:IFormatProvider) : system.Char return Std.int(i);
	public static inline function ToSByte_IFormatProvider(i:Float, provider:IFormatProvider) : system.SByte return Std.int(i);
	public static inline function ToByte_IFormatProvider(i:Float, provider:IFormatProvider) : system.Byte return Std.int(i);
	public static inline function ToInt16_IFormatProvider(i:Float, provider:IFormatProvider) : system.Int16 return Std.int(i);
	public static inline function ToUInt16_IFormatProvider(i:Float, provider:IFormatProvider) : system.UInt16 return Std.int(i);
	public static inline function ToInt32_IFormatProvider(i:Float, provider:IFormatProvider) : system.Int32 return Std.int(i);
	public static inline function ToUInt32_IFormatProvider(i:Float, provider:IFormatProvider) : system.UInt32 return Std.int(i);
	public static inline function ToInt64_IFormatProvider(i:Float, provider:IFormatProvider) : system.Int64 return Std.int(i);
	public static inline function ToUInt64_IFormatProvider(i:Float, provider:IFormatProvider) : system.UInt64 return Std.int(i);
	public static inline function ToSingle_IFormatProvider(i:Float, provider:IFormatProvider) : system.Single return Std.int(i);
	public static inline function ToDouble_IFormatProvider(i:Float, provider:IFormatProvider) : system.Double return Std.int(i);
}