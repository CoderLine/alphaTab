package system;

import js.html.ArrayBuffer;
import js.html.Int16Array;
import js.html.Int8Array;
import js.html.Int32Array;
import js.html.Uint16Array;
import js.html.Uint32Array;
import js.html.Uint8Array;
import js.html.Float32Array;
import js.html.Float64Array;

class Convert 
{
	private static var _conversionBuffer:ArrayBuffer = new ArrayBuffer(8);
	private static var _int8Buffer = new Int8Array(_conversionBuffer);
	private static var _uint8Buffer = new Uint8Array(_conversionBuffer);
	private static var _int16Buffer = new Int16Array(_conversionBuffer);
	private static var _uint16Buffer = new Uint16Array(_conversionBuffer);
	private static var _int32Buffer = new Int32Array(_conversionBuffer);
	private static var _uint32Buffer = new Uint32Array(_conversionBuffer);
	private static var _float32Buffer = new Float32Array(_conversionBuffer);
	private static var _float64Buffer = new Float64Array(_conversionBuffer);
	
	public static function toInt8(v:Int) : Int
	{
		_int32Buffer[0] = v;
		return _int8Buffer[0];
	}
	public static function toUInt8(v:Int) : Int 
	{
		_int32Buffer[0] = v;
		return _uint8Buffer[0];
	}
	public static function toInt16(v:Int) : Int
	{
		_int32Buffer[0] = v;
		return _int16Buffer[0];
	}
	public static function toUInt16(v:Int) : Int 
	{
		_int32Buffer[0] = v;
		return _uint16Buffer[0];
	}
	public static function toUInt32(v:Int) : Int 
	{
		_int32Buffer[0] = v;
		return _uint32Buffer[0];
	}
	public static function toInt64(v:Int) : Int 
	{
		return v;
	}
	public static function toUInt64(v:Int) : Int 
	{
		return toUInt32(v);
	}
	public static function toInt32(v:Int) : Int 
	{
		_uint32Buffer[0] = v;
		return _int32Buffer[0];
	}		

	public static function toHashCode_Single(v:system.Single) : system.Int32
	{
		_float32Buffer[0] = v.toHaxeFloat();
		return _int32Buffer[0];
	}

	public static function toHashCode_Double(v:system.Double) : system.Int32
	{
		_float64Buffer[0] = v.toHaxeFloat();
		return _int32Buffer[0] ^ _int32Buffer[1];
	}
		
	public static inline function toBoolean_Byte(v:system.Byte) : system.Boolean
	{
		return v != 0;
	}
	public static inline function toChar_Byte(v:system.Byte) : system.Char
	{
		return v.toHaxeInt();
	}
	public static inline function toSByte_Byte(v:system.Byte) : system.SByte 
	{
		return toInt8(v.toHaxeInt());
	}
	public static inline function toByte_Byte(v:system.Byte) : system.Byte 
	{
		return v;
	}
	public static inline function toInt16_Byte(v:system.Byte) : system.Int16
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt16_Byte(v:system.Byte) : system.UInt16 
	{
		return v.toHaxeInt();
	}
	public static inline function toInt32_Byte(v:system.Byte) : system.Int32 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt32_Byte(v:system.Byte) : system.UInt32 
	{
		return v.toHaxeInt();
	}
	public static inline function toInt64_Byte(v:system.Byte) : system.Int64 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt64_Byte(v:system.Byte) : system.UInt64
	{
		return v.toHaxeInt();
	}
	public static inline function toSingle_Byte(v:system.Byte) : system.Single 
	{
		return v.toHaxeInt();
	}
	public static inline function toDouble_Byte(v:system.Byte) : system.Double
	{
		return v.toHaxeInt();
	}
	
	
	public static inline function toBoolean_Char(v:system.Char) : system.Boolean
	{
		throw new InvalidCastException("cannot cast system.Char to system.Boolean");
	}
	public static inline function toChar_Char(v:system.Char) : system.Char 
	{
		return v;
	}
	public static inline function toByte_Char(v:system.Char) : system.Byte 
	{
		return toUInt8(v.toHaxeInt());
	}
	public static inline function toSByte_Char(v:system.Char) : system.SByte 
	{
		return toInt8(v.toHaxeInt());
	}
	public static inline function toInt16_Char(v:system.Char) : system.Int16
	{
		return toInt16(v.toHaxeInt());
	}
	public static inline function toUInt16_Char(v:system.Char) : system.UInt16 
	{
		return v.toHaxeInt();
	}
	public static inline function toInt32_Char(v:system.Char) : system.Int32 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt32_Char(v:system.Char) : system.UInt32 
	{
		return v.toHaxeInt();
	}
	public static inline function toInt64_Char(v:system.Char) : system.Int64 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt64_Char(v:system.Char) : system.UInt64
	{
		return v.toHaxeInt();
	}
	public static function toSingle_Char(v:system.Byte) : system.Single 
	{
		throw new InvalidCastException("cannot cast system.Char to system.Single");
	}
	public static function toDouble_Char(v:system.Byte) : system.Double
	{
		throw new InvalidCastException("cannot cast system.Char to system.Double");
	}
	
	
	public static inline function toBoolean_Double(v:system.Double) : system.Boolean
	{
		return v != 0;
	}
	public static inline function toChar_Double(v:system.Double) : system.Char 
	{
		throw new InvalidCastException("cannot cast system.Double to system.Char");
	}
	public static inline function toByte_Double(v:system.Double) : system.Byte 
	{
		return toUInt8(toInt32_Double(v).toHaxeInt());
	}
	public static inline function toSByte_Double(v:system.Double) : system.SByte 
	{
		return toInt8(toInt32_Double(v).toHaxeInt());
	}
	public static inline function toInt16_Double(v:system.Double) : system.Int16
	{
		return toInt16(toInt32_Double(v).toHaxeInt());
	}
	public static inline function toUInt16_Double(v:system.Double) : system.UInt16 
	{
		return toUInt16(toInt32_Double(v).toHaxeInt());
	}
	public static function toInt32_Double(v:system.Double) : system.Int32 
	{
		if (v >= 0)
		{
			if (v < 2147483647.5)
			{
				return Std.int(v.toHaxeFloat());
				//var result = Std.int(v.toHaxeFloat());
				//var dif = v - result;
				//if (dif > 0.5 || dif == 0.5 && (result & 1) != 0) result++;
				//return result;
			}
		}
		else
		{
			if (v >= -2147483648.5)
			{
				return Std.int(v.toHaxeFloat());
				// var result = Std.int(v.toHaxeFloat());
				// var dif = v - result;
				// if (dif < -0.5 || dif == -0.5 && (result & 1) != 0) result--;
				// return result;
			}
		}
		return Std.int(v.toHaxeFloat());
		// throw new OverflowException("Value was either too large or too small for a Int32.");
	}
	public static inline function toUInt32_Double(v:system.Double) : system.UInt32 
	{
		return toUInt32(toInt32_Double(v).toHaxeInt());
	}
	public static inline function toInt64_Double(v:system.Double) : system.Int64 
	{
		// TODO: ensure that upper bits are not lost
		return Std.int(v.toHaxeFloat());
	}
	public static inline function toUInt64_Double(v:system.Double) : system.UInt64
	{
		return toInt64(toInt64_Double(v).toHaxeInt());
	}
	public static inline function toSingle_Double(v:system.Double) : system.Single 
	{
		// TODO: double to float truncation
		return v.toHaxeFloat();
	}
	public static inline function toDouble_Double(v:system.Double) : system.Double 
	{
		return v;		
	}
	
	
	public static inline function toBoolean_Int16(v:system.Int16) : system.Boolean
	{
		return v != 0;
	}
	public static inline function toChar_Int16(v:system.Int16) : system.Char
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toSByte_Int16(v:system.Int16) : system.SByte 
	{
		return toInt8(v.toHaxeInt());
	}
	public static inline function toByte_Int16(v:system.Int16) : system.Byte 
	{
		return toUInt8(v.toHaxeInt());
	}
	public static inline function toInt16_Int16(v:system.Int16) : system.Int16
	{
		return v;
	}
	public static inline function toUInt16_Int16(v:system.Int16) : system.UInt16 
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toInt32_Int16(v:system.Int16) : system.Int32 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt32_Int16(v:system.Int16) : system.UInt32 
	{
		return toUInt32(v.toHaxeInt());
	}
	public static inline function toInt64_Int16(v:system.Int16) : system.Int64 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt64_Int16(v:system.Int16) : system.UInt64
	{
		return toUInt32(v.toHaxeInt());
	}
	public static inline function toSingle_Int16(v:system.Int16) : system.Single 
	{
		return v.toHaxeInt();
	}
	public static inline function toDouble_Int16(v:system.Int16) : system.Double
	{
		return v.toHaxeInt();
	}
	

	public static inline function toBoolean_Int32(v:system.Int32) : system.Boolean
	{
		return v != 0;
	}
	public static inline function toChar_Int32(v:system.Int32) : system.Char
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toSByte_Int32(v:system.Int32) : system.SByte 
	{
		return toInt8(v.toHaxeInt());
	}
	public static inline function toByte_Int32(v:system.Int32) : system.Byte 
	{
		return toUInt8(v.toHaxeInt());
	}
	public static inline function toInt16_Int32(v:system.Int32) : system.Int16
	{
		return toInt16(v.toHaxeInt());
	}
	public static inline function toUInt16_Int32(v:system.Int32) : system.UInt16 
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toInt32_Int32(v:system.Int32) : system.Int32 
	{
		return v;
	}
	public static inline function toUInt32_Int32(v:system.Int32) : system.UInt32 
	{
		return toUInt32(v.toHaxeInt());
	}
	public static inline function toInt64_Int32(v:system.Int32) : system.Int64 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt64_Int32(v:system.Int32) : system.UInt64
	{
		return toUInt32(v.toHaxeInt());
	}
	public static inline function toSingle_Int32(v:system.Int32) : system.Single 
	{
		return v.toHaxeInt();
	}
	public static inline function toDouble_Int32(v:system.Int32) : system.Double
	{
		return v.toHaxeInt();
	}
	

	public static inline function toBoolean_Int64(v:system.Int64) : system.Boolean
	{
		return v != 0;
	}
	public static inline function toChar_Int64(v:system.Int64) : system.Char
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toSByte_Int64(v:system.Int64) : system.SByte 
	{
		return toInt8(v.toHaxeInt());
	}
	public static inline function toByte_Int64(v:system.Int64) : system.Byte 
	{
		return toUInt8(v.toHaxeInt());
	}
	public static inline function toInt16_Int64(v:system.Int64) : system.Int16
	{
		return toInt16(v.toHaxeInt());
	}
	public static inline function toUInt16_Int64(v:system.Int64) : system.UInt16 
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toInt32_Int64(v:system.Int64) : system.Int32 
	{
		return toInt32(v.toHaxeInt());
	}
	public static inline function toUInt32_Int64(v:system.Int64) : system.UInt32 
	{
		return toUInt32(v.toHaxeInt());
	}
	public static inline function toInt64_Int64(v:system.Int64) : system.Int64 
	{
		return v;
	}
	public static inline function toUInt64_Int64(v:system.Int64) : system.UInt64
	{
		return toUInt32(v.toHaxeInt());
	}
	public static inline function toSingle_Int64(v:system.Int64) : system.Single 
	{
		return v.toHaxeInt();
	}
	public static inline function toDouble_Int64(v:system.Int64) : system.Double
	{
		return v.toHaxeInt();
	}


	public static inline function toBoolean_SByte(v:system.SByte) : system.Boolean
	{
		return v != 0;
	}
	public static inline function toChar_SByte(v:system.SByte) : system.Char
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toSByte_SByte(v:system.SByte) : system.SByte 
	{
		return v;
	}
	public static inline function toByte_SByte(v:system.SByte) : system.Byte 
	{
		return toUInt8(v.toHaxeInt());
	}
	public static inline function toInt16_SByte(v:system.SByte) : system.Int16
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt16_SByte(v:system.SByte) : system.UInt16 
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toInt32_SByte(v:system.SByte) : system.Int32 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt32_SByte(v:system.SByte) : system.UInt32 
	{
		return toUInt32(v.toHaxeInt());
	}
	public static inline function toInt64_SByte(v:system.SByte) : system.Int64 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt64_SByte(v:system.SByte) : system.UInt64
	{
		return toUInt32(v.toHaxeInt());
	}
	public static inline function toSingle_SByte(v:system.SByte) : system.Single 
	{
		return v.toHaxeInt();
	}
	public static inline function toDouble_SByte(v:system.SByte) : system.Double
	{
		return v.toHaxeInt();
	}
	
	public static inline function toBoolean_Single(v:system.Single) : system.Boolean
	{
		return v != 0;
	}
	public static inline function toChar_Single(v:system.Single) : system.Char 
	{
		throw new InvalidCastException("cannot cast system.Single to system.Char");
	}
	public static inline function toByte_Single(v:system.Single) : system.Byte 
	{
		return toUInt8(toInt32_Single(v).toHaxeInt());
	}
	public static inline function toSByte_Single(v:system.Single) : system.SByte 
	{
		return toInt8(toInt32_Single(v).toHaxeInt());
	}
	public static inline function toInt16_Single(v:system.Single) : system.Int16
	{
		return toInt16(toInt32_Single(v).toHaxeInt());
	}
	public static inline function toUInt16_Single(v:system.Single) : system.UInt16 
	{
		return toUInt16(toInt32_Single(v).toHaxeInt());
	}
	public static function toInt32_Single(v:system.Single) : system.Int32 
	{
		return toInt32_Double(v);
	}
	public static inline function toUInt32_Single(v:system.Single) : system.UInt32 
	{
		return toUInt32(toInt32_Single(v).toHaxeInt());
	}
	public static inline function toInt64_Single(v:system.Single) : system.Int64 
	{
		// TODO: ensure that upper bits are not lost
		return Std.int(v.toHaxeFloat());
	}
	public static inline function toUInt64_Single(v:system.Single) : system.UInt64
	{
		return toInt64(toInt64_Single(v).toHaxeInt());
	}
	public static inline function toSingle_Single(v:system.Single) : system.Single 
	{
		return v;
	}
	public static inline function toDouble_Single(v:system.Single) : system.Double 
	{
		return v.toHaxeFloat();
	}
	
		
	public static inline function toBoolean_UInt16(v:system.UInt16) : system.Boolean
	{
		return v != 0;
	}
	public static inline function toChar_UInt16(v:system.UInt16) : system.Char
	{
		return v.toHaxeInt();
	}
	public static inline function toSByte_UInt16(v:system.UInt16) : system.SByte 
	{
		return toInt8(v.toHaxeInt());
	}
	public static inline function toByte_UInt16(v:system.UInt16) : system.Byte 
	{
		return toUInt8(v.toHaxeInt());
	}
	public static inline function toInt16_UInt16(v:system.UInt16) : system.Int16
	{
		return toInt16(v.toHaxeInt());
	}
	public static inline function toUInt16_UInt16(v:system.UInt16) : system.UInt16 
	{
		return v;
	}
	public static inline function toInt32_UInt16(v:system.UInt16) : system.Int32 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt32_UInt16(v:system.UInt16) : system.UInt32 
	{
		return v.toHaxeInt();
	}
	public static inline function toInt64_UInt16(v:system.UInt16) : system.Int64 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt64_UInt16(v:system.UInt16) : system.UInt64
	{
		return v.toHaxeInt();
	}
	public static inline function toSingle_UInt16(v:system.UInt16) : system.Single 
	{
		return v.toHaxeInt();
	}
	public static inline function toDouble_UInt16(v:system.UInt16) : system.Double
	{
		return v.toHaxeInt();
	}

		
	public static inline function toBoolean_UInt32(v:system.UInt32) : system.Boolean
	{
		return v != 0;
	}
	public static inline function toChar_UInt32(v:system.UInt32) : system.Char
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toSByte_UInt32(v:system.UInt32) : system.SByte 
	{
		return toInt8(v.toHaxeInt());
	}
	public static inline function toByte_UInt32(v:system.UInt32) : system.Byte 
	{
		return toUInt8(v.toHaxeInt());
	}
	public static inline function toInt16_UInt32(v:system.UInt32) : system.Int16
	{
		return toInt16(v.toHaxeInt());
	}
	public static inline function toUInt16_UInt32(v:system.UInt32) : system.UInt16 
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toInt32_UInt32(v:system.UInt32) : system.Int32 
	{
		return toInt32(v.toHaxeInt());
	}
	public static inline function toUInt32_UInt32(v:system.UInt32) : system.UInt32 
	{
		return v;
	}
	public static inline function toInt64_UInt32(v:system.UInt32) : system.Int64 
	{
		return v.toHaxeInt();
	}
	public static inline function toUInt64_UInt32(v:system.UInt32) : system.UInt64
	{
		return v.toHaxeInt();
	}
	public static inline function toSingle_UInt32(v:system.UInt32) : system.Single 
	{
		return v.toHaxeInt();
	}
	public static inline function toDouble_UInt32(v:system.UInt32) : system.Double
	{
		return v.toHaxeInt();
	}
	
		
	public static inline function toBoolean_UInt64(v:system.UInt64) : system.Boolean
	{
		return v != 0;
	}
	public static inline function toChar_UInt64(v:system.UInt64) : system.Char
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toSByte_UInt64(v:system.UInt64) : system.SByte 
	{
		return toInt8(v.toHaxeInt());
	}
	public static inline function toByte_UInt64(v:system.UInt64) : system.Byte 
	{
		return toUInt8(v.toHaxeInt());
	}
	public static inline function toInt16_UInt64(v:system.UInt64) : system.Int16
	{
		return toInt16(v.toHaxeInt());
	}
	public static inline function toUInt16_UInt64(v:system.UInt64) : system.UInt16 
	{
		return toUInt16(v.toHaxeInt());
	}
	public static inline function toInt32_UInt64(v:system.UInt64) : system.Int32 
	{
		return toInt32(v.toHaxeInt());
	}
	public static inline function toUInt32_UInt64(v:system.UInt64) : system.UInt32 
	{
		return toUInt32(v.toHaxeInt());
	}
	public static inline function toInt64_UInt64(v:system.UInt64) : system.Int64 
	{
		return toInt32(v.toHaxeInt());
	}
	public static inline function toUInt64_UInt64(v:system.UInt64) : system.UInt64
	{
		return v;
	}
	public static inline function toSingle_UInt64(v:system.UInt64) : system.Single 
	{
		return v.toHaxeInt();
	}
	public static inline function toDouble_UInt64(v:system.UInt64) : system.Double
	{
		return v.toHaxeInt();
	}
}