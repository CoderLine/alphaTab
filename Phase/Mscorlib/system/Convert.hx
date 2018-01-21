package system;

import js.html.ArrayBuffer;
import js.html.Int16Array;
import js.html.Int8Array;
import js.html.Int32Array;
import js.html.Uint16Array;
import js.html.Uint32Array;
import js.html.Uint8Array;

class Convert 
{
	#if js
	
	private static var _conversionBuffer:ArrayBuffer = new ArrayBuffer(8);
	private static var _int8Buffer = new Int8Array(_conversionBuffer);
	private static var _uint8Buffer = new Uint8Array(_conversionBuffer);
	private static var _int16Buffer = new Int16Array(_conversionBuffer);
	private static var _uint16Buffer = new Uint16Array(_conversionBuffer);
	private static var _int32Buffer = new Int32Array(_conversionBuffer);
	private static var _uint32Buffer = new Uint32Array(_conversionBuffer);
	
	public static function ToInt8(v:Int) : Int
	{
		_int32Buffer[0] = v;
		return _int8Buffer[0];
	}
	public static function ToUInt8(v:Int) : Int 
	{
		_int32Buffer[0] = v;
		return _uint8Buffer[0];
	}
	public static function ToInt16(v:Int) : Int
	{
		_int32Buffer[0] = v;
		return _int16Buffer[0];
	}
	public static function ToUInt16(v:Int) : Int 
	{
		_int32Buffer[0] = v;
		return _uint16Buffer[0];
	}
	public static function ToUInt32(v:Int) : Int 
	{
		_int32Buffer[0] = v;
		return _uint32Buffer[0];
	}
	public static function ToInt64(v:Int) : Int 
	{
		return v;
	}
	public static function ToUInt64(v:Int) : Int 
	{
		return ToUInt32(v);
	}
	public static function ToInt32(v:Int) : Int 
	{
		_uint32Buffer[0] = v;
		return _int32Buffer[0];
	}	
	#end
	
	public static inline function ToBoolean_Byte(v:system.Byte) : system.Boolean
	{
		return v != 0;
	}
	public static inline function ToChar_Byte(v:system.Byte) : system.Char
	{
		return v.ToHaxeInt();
	}
	public static inline function ToSByte_Byte(v:system.Byte) : system.SByte 
	{
		return ToInt8(v.ToHaxeInt());
	}
	public static inline function ToByte_Byte(v:system.Byte) : system.Byte 
	{
		return v;
	}
	public static inline function ToInt16_Byte(v:system.Byte) : system.Int16
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt16_Byte(v:system.Byte) : system.UInt16 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToInt32_Byte(v:system.Byte) : system.Int32 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt32_Byte(v:system.Byte) : system.UInt32 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToInt64_Byte(v:system.Byte) : system.Int64 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt64_Byte(v:system.Byte) : system.UInt64
	{
		return v.ToHaxeInt();
	}
	public static inline function ToSingle_Byte(v:system.Byte) : system.Single 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToDouble_Byte(v:system.Byte) : system.Double
	{
		return v.ToHaxeInt();
	}
	
	
	public static inline function ToBoolean_Char(v:system.Char) : system.Boolean
	{
		throw new InvalidCastException("cannot cast system.Char to system.Boolean");
	}
	public static inline function ToChar_Char(v:system.Char) : system.Char 
	{
		return v;
	}
	public static inline function ToByte_Char(v:system.Char) : system.Byte 
	{
		return ToUInt8(v.ToHaxeInt());
	}
	public static inline function ToSByte_Char(v:system.Char) : system.SByte 
	{
		return ToInt8(v.ToHaxeInt());
	}
	public static inline function ToInt16_Char(v:system.Char) : system.Int16
	{
		return ToInt16(v.ToHaxeInt());
	}
	public static inline function ToUInt16_Char(v:system.Char) : system.UInt16 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToInt32_Char(v:system.Char) : system.Int32 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt32_Char(v:system.Char) : system.UInt32 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToInt64_Char(v:system.Char) : system.Int64 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt64_Char(v:system.Char) : system.UInt64
	{
		return v.ToHaxeInt();
	}
	public static function ToSingle_Char(v:system.Byte) : system.Single 
	{
		throw new InvalidCastException("cannot cast system.Char to system.Single");
	}
	public static function ToDouble_Char(v:system.Byte) : system.Double
	{
		throw new InvalidCastException("cannot cast system.Char to system.Double");
	}
	
	
	public static inline function ToBoolean_Double(v:system.Double) : system.Boolean
	{
		return v != 0;
	}
	public static inline function ToChar_Double(v:system.Double) : system.Char 
	{
		throw new InvalidCastException("cannot cast system.Double to system.Char");
	}
	public static inline function ToByte_Double(v:system.Double) : system.Byte 
	{
		return ToUInt8(ToInt32_Double(v).ToHaxeInt());
	}
	public static inline function ToSByte_Double(v:system.Double) : system.SByte 
	{
		return ToInt8(ToInt32_Double(v).ToHaxeInt());
	}
	public static inline function ToInt16_Double(v:system.Double) : system.Int16
	{
		return ToInt16(ToInt32_Double(v).ToHaxeInt());
	}
	public static inline function ToUInt16_Double(v:system.Double) : system.UInt16 
	{
		return ToUInt16(ToInt32_Double(v).ToHaxeInt());
	}
	public static function ToInt32_Double(v:system.Double) : system.Int32 
	{
		if (v >= 0)
		{
			if (v < 2147483647.5)
			{
				var result = Std.int(v.ToHaxeFloat());
				var dif = v - result;
				if (dif > 0.5 || dif == 0.5 && (result & 1) != 0) result++;
				return result;
			}
		}
		else
		{
			if (v >= -2147483648.5)
			{
				var result = Std.int(v.ToHaxeFloat());
				var dif = v - result;
				if (dif < -0.5 || dif == -0.5 && (result & 1) != 0) result--;
				return result;
			}
		}
		throw new OverflowException("Value was either too large or too small for a Int32.");
	}
	public static inline function ToUInt32_Double(v:system.Double) : system.UInt32 
	{
		return ToUInt32(ToInt32_Double(v).ToHaxeInt());
	}
	public static inline function ToInt64_Double(v:system.Double) : system.Int64 
	{
		// TODO: ensure that upper bits are not lost
		return Std.int(v.ToHaxeFloat());
	}
	public static inline function ToUInt64_Double(v:system.Double) : system.UInt64
	{
		return ToInt64(ToInt64_Double(v).ToHaxeInt());
	}
	public static inline function ToSingle_Double(v:system.Double) : system.Single 
	{
		// TODO: double to float truncation
		return v.ToHaxeFloat();
	}
	public static inline function ToDouble_Double(v:system.Double) : system.Double 
	{
		return v;		
	}
	
	
	public static inline function ToBoolean_Int16(v:system.Int16) : system.Boolean
	{
		return v != 0;
	}
	public static inline function ToChar_Int16(v:system.Int16) : system.Char
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToSByte_Int16(v:system.Int16) : system.SByte 
	{
		return ToInt8(v.ToHaxeInt());
	}
	public static inline function ToByte_Int16(v:system.Int16) : system.Byte 
	{
		return ToUInt8(v.ToHaxeInt());
	}
	public static inline function ToInt16_Int16(v:system.Int16) : system.Int16
	{
		return v;
	}
	public static inline function ToUInt16_Int16(v:system.Int16) : system.UInt16 
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToInt32_Int16(v:system.Int16) : system.Int32 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt32_Int16(v:system.Int16) : system.UInt32 
	{
		return ToUInt32(v.ToHaxeInt());
	}
	public static inline function ToInt64_Int16(v:system.Int16) : system.Int64 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt64_Int16(v:system.Int16) : system.UInt64
	{
		return ToUInt32(v.ToHaxeInt());
	}
	public static inline function ToSingle_Int16(v:system.Int16) : system.Single 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToDouble_Int16(v:system.Int16) : system.Double
	{
		return v.ToHaxeInt();
	}
	

	public static inline function ToBoolean_Int32(v:system.Int32) : system.Boolean
	{
		return v != 0;
	}
	public static inline function ToChar_Int32(v:system.Int32) : system.Char
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToSByte_Int32(v:system.Int32) : system.SByte 
	{
		return ToInt8(v.ToHaxeInt());
	}
	public static inline function ToByte_Int32(v:system.Int32) : system.Byte 
	{
		return ToUInt8(v.ToHaxeInt());
	}
	public static inline function ToInt16_Int32(v:system.Int32) : system.Int16
	{
		return ToInt16(v.ToHaxeInt());
	}
	public static inline function ToUInt16_Int32(v:system.Int32) : system.UInt16 
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToInt32_Int32(v:system.Int32) : system.Int32 
	{
		return v;
	}
	public static inline function ToUInt32_Int32(v:system.Int32) : system.UInt32 
	{
		return ToUInt32(v.ToHaxeInt());
	}
	public static inline function ToInt64_Int32(v:system.Int32) : system.Int64 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt64_Int32(v:system.Int32) : system.UInt64
	{
		return ToUInt32(v.ToHaxeInt());
	}
	public static inline function ToSingle_Int32(v:system.Int32) : system.Single 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToDouble_Int32(v:system.Int32) : system.Double
	{
		return v.ToHaxeInt();
	}
	

	public static inline function ToBoolean_Int64(v:system.Int64) : system.Boolean
	{
		return v != 0;
	}
	public static inline function ToChar_Int64(v:system.Int64) : system.Char
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToSByte_Int64(v:system.Int64) : system.SByte 
	{
		return ToInt8(v.ToHaxeInt());
	}
	public static inline function ToByte_Int64(v:system.Int64) : system.Byte 
	{
		return ToUInt8(v.ToHaxeInt());
	}
	public static inline function ToInt16_Int64(v:system.Int64) : system.Int16
	{
		return ToInt16(v.ToHaxeInt());
	}
	public static inline function ToUInt16_Int64(v:system.Int64) : system.UInt16 
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToInt32_Int64(v:system.Int64) : system.Int32 
	{
		return ToInt32(v.ToHaxeInt());
	}
	public static inline function ToUInt32_Int64(v:system.Int64) : system.UInt32 
	{
		return ToUInt32(v.ToHaxeInt());
	}
	public static inline function ToInt64_Int64(v:system.Int64) : system.Int64 
	{
		return v;
	}
	public static inline function ToUInt64_Int64(v:system.Int64) : system.UInt64
	{
		return ToUInt32(v.ToHaxeInt());
	}
	public static inline function ToSingle_Int64(v:system.Int64) : system.Single 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToDouble_Int64(v:system.Int64) : system.Double
	{
		return v.ToHaxeInt();
	}


	public static inline function ToBoolean_SByte(v:system.SByte) : system.Boolean
	{
		return v != 0;
	}
	public static inline function ToChar_SByte(v:system.SByte) : system.Char
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToSByte_SByte(v:system.SByte) : system.SByte 
	{
		return v;
	}
	public static inline function ToByte_SByte(v:system.SByte) : system.Byte 
	{
		return ToUInt8(v.ToHaxeInt());
	}
	public static inline function ToInt16_SByte(v:system.SByte) : system.Int16
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt16_SByte(v:system.SByte) : system.UInt16 
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToInt32_SByte(v:system.SByte) : system.Int32 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt32_SByte(v:system.SByte) : system.UInt32 
	{
		return ToUInt32(v.ToHaxeInt());
	}
	public static inline function ToInt64_SByte(v:system.SByte) : system.Int64 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt64_SByte(v:system.SByte) : system.UInt64
	{
		return ToUInt32(v.ToHaxeInt());
	}
	public static inline function ToSingle_SByte(v:system.SByte) : system.Single 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToDouble_SByte(v:system.SByte) : system.Double
	{
		return v.ToHaxeInt();
	}
	
	public static inline function ToBoolean_Single(v:system.Single) : system.Boolean
	{
		return v != 0;
	}
	public static inline function ToChar_Single(v:system.Single) : system.Char 
	{
		throw new InvalidCastException("cannot cast system.Single to system.Char");
	}
	public static inline function ToByte_Single(v:system.Single) : system.Byte 
	{
		return ToUInt8(ToInt32_Single(v).ToHaxeInt());
	}
	public static inline function ToSByte_Single(v:system.Single) : system.SByte 
	{
		return ToInt8(ToInt32_Single(v).ToHaxeInt());
	}
	public static inline function ToInt16_Single(v:system.Single) : system.Int16
	{
		return ToInt16(ToInt32_Single(v).ToHaxeInt());
	}
	public static inline function ToUInt16_Single(v:system.Single) : system.UInt16 
	{
		return ToUInt16(ToInt32_Single(v).ToHaxeInt());
	}
	public static function ToInt32_Single(v:system.Single) : system.Int32 
	{
		return ToInt32_Double(v);
	}
	public static inline function ToUInt32_Single(v:system.Single) : system.UInt32 
	{
		return ToUInt32(ToInt32_Single(v).ToHaxeInt());
	}
	public static inline function ToInt64_Single(v:system.Single) : system.Int64 
	{
		// TODO: ensure that upper bits are not lost
		return Std.int(v.ToHaxeFloat());
	}
	public static inline function ToUInt64_Single(v:system.Single) : system.UInt64
	{
		return ToInt64(ToInt64_Single(v).ToHaxeInt());
	}
	public static inline function ToSingle_Single(v:system.Single) : system.Single 
	{
		return v;
	}
	public static inline function ToDouble_Single(v:system.Single) : system.Double 
	{
		return v.ToHaxeFloat();
	}
	
		
	public static inline function ToBoolean_UInt16(v:system.UInt16) : system.Boolean
	{
		return v != 0;
	}
	public static inline function ToChar_UInt16(v:system.UInt16) : system.Char
	{
		return v.ToHaxeInt();
	}
	public static inline function ToSByte_UInt16(v:system.UInt16) : system.SByte 
	{
		return ToInt8(v.ToHaxeInt());
	}
	public static inline function ToByte_UInt16(v:system.UInt16) : system.Byte 
	{
		return ToUInt8(v.ToHaxeInt());
	}
	public static inline function ToInt16_UInt16(v:system.UInt16) : system.Int16
	{
		return ToInt16(v.ToHaxeInt());
	}
	public static inline function ToUInt16_UInt16(v:system.UInt16) : system.UInt16 
	{
		return v;
	}
	public static inline function ToInt32_UInt16(v:system.UInt16) : system.Int32 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt32_UInt16(v:system.UInt16) : system.UInt32 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToInt64_UInt16(v:system.UInt16) : system.Int64 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt64_UInt16(v:system.UInt16) : system.UInt64
	{
		return v.ToHaxeInt();
	}
	public static inline function ToSingle_UInt16(v:system.UInt16) : system.Single 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToDouble_UInt16(v:system.UInt16) : system.Double
	{
		return v.ToHaxeInt();
	}

		
	public static inline function ToBoolean_UInt32(v:system.UInt32) : system.Boolean
	{
		return v != 0;
	}
	public static inline function ToChar_UInt32(v:system.UInt32) : system.Char
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToSByte_UInt32(v:system.UInt32) : system.SByte 
	{
		return ToInt8(v.ToHaxeInt());
	}
	public static inline function ToByte_UInt32(v:system.UInt32) : system.Byte 
	{
		return ToUInt8(v.ToHaxeInt());
	}
	public static inline function ToInt16_UInt32(v:system.UInt32) : system.Int16
	{
		return ToInt16(v.ToHaxeInt());
	}
	public static inline function ToUInt16_UInt32(v:system.UInt32) : system.UInt16 
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToInt32_UInt32(v:system.UInt32) : system.Int32 
	{
		return ToInt32(v.ToHaxeInt());
	}
	public static inline function ToUInt32_UInt32(v:system.UInt32) : system.UInt32 
	{
		return v;
	}
	public static inline function ToInt64_UInt32(v:system.UInt32) : system.Int64 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToUInt64_UInt32(v:system.UInt32) : system.UInt64
	{
		return v.ToHaxeInt();
	}
	public static inline function ToSingle_UInt32(v:system.UInt32) : system.Single 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToDouble_UInt32(v:system.UInt32) : system.Double
	{
		return v.ToHaxeInt();
	}
	
		
	public static inline function ToBoolean_UInt64(v:system.UInt64) : system.Boolean
	{
		return v != 0;
	}
	public static inline function ToChar_UInt64(v:system.UInt64) : system.Char
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToSByte_UInt64(v:system.UInt64) : system.SByte 
	{
		return ToInt8(v.ToHaxeInt());
	}
	public static inline function ToByte_UInt64(v:system.UInt64) : system.Byte 
	{
		return ToUInt8(v.ToHaxeInt());
	}
	public static inline function ToInt16_UInt64(v:system.UInt64) : system.Int16
	{
		return ToInt16(v.ToHaxeInt());
	}
	public static inline function ToUInt16_UInt64(v:system.UInt64) : system.UInt16 
	{
		return ToUInt16(v.ToHaxeInt());
	}
	public static inline function ToInt32_UInt64(v:system.UInt64) : system.Int32 
	{
		return ToInt32(v.ToHaxeInt());
	}
	public static inline function ToUInt32_UInt64(v:system.UInt64) : system.UInt32 
	{
		return ToUInt32(v.ToHaxeInt());
	}
	public static inline function ToInt64_UInt64(v:system.UInt64) : system.Int64 
	{
		return ToInt32(v.ToHaxeInt());
	}
	public static inline function ToUInt64_UInt64(v:system.UInt64) : system.UInt64
	{
		return v;
	}
	public static inline function ToSingle_UInt64(v:system.UInt64) : system.Single 
	{
		return v.ToHaxeInt();
	}
	public static inline function ToDouble_UInt64(v:system.UInt64) : system.Double
	{
		return v.ToHaxeInt();
	}
}