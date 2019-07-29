using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.DataView")]
    [NativeConstructors]
    public class DataView : ArrayBufferView
    {
        public extern DataView(ArrayBuffer buffer);
        public extern DataView(ArrayBuffer buffer, HaxeInt byteOffset, HaxeInt length);

        [Name("getInt8")]
        public extern HaxeInt GetInt8(HaxeInt byteOffset);

        [Name("getUint8")]
        public extern HaxeInt GetUint8(HaxeInt byteOffset);

        [Name("getInt16")]
        public extern HaxeInt GetInt16(HaxeInt byteOffset);

        [Name("getInt16")]
        public extern HaxeInt GetInt16(HaxeInt byteOffset, HaxeBool littleEndian);

        [Name("getUint16")]
        public extern HaxeInt GetUint16(HaxeInt byteOffset);

        [Name("getUint16")]
        public extern HaxeInt GetUint16(HaxeInt byteOffset, HaxeBool littleEndian);

        [Name("getInt32")]
        public extern HaxeInt GetInt32(HaxeInt byteOffset);

        [Name("getInt32")]
        public extern HaxeInt GetInt32(HaxeInt byteOffset, HaxeBool littleEndian);

        [Name("getUint32")]
        public extern HaxeInt GetUint32(HaxeInt byteOffset);

        [Name("getUint32")]
        public extern HaxeInt GetUint32(HaxeInt byteOffset, HaxeBool littleEndian);

        [Name("getFloat32")]
        public extern HaxeFloat GetFloat32(HaxeInt byteOffset);

        [Name("getFloat32")]
        public extern HaxeFloat GetFloat32(HaxeInt byteOffset, HaxeBool littleEndian);

        [Name("getFloat64")]
        public extern HaxeFloat GetFloat64(HaxeInt byteOffset);

        [Name("getFloat64")]
        public extern HaxeFloat GetFloat64(HaxeInt byteOffset, HaxeBool littleEndian);

        [Name("setInt8")]
        public extern void SetInt8(HaxeInt byteOffset, HaxeInt value);

        [Name("setUint8")]
        public extern void SetUint8(HaxeInt byteOffset, HaxeInt value);

        [Name("setInt16")]
        public extern void SetInt16(HaxeInt byteOffset, HaxeInt value);

        [Name("setInt16")]
        public extern void SetInt16(HaxeInt byteOffset, HaxeInt value, HaxeBool littleEndian);

        [Name("setUint16")]
        public extern void SetUint16(HaxeInt byteOffset, HaxeInt value);

        [Name("setUint16")]
        public extern void SetUint16(HaxeInt byteOffset, HaxeInt value, HaxeBool littleEndian);

        [Name("setInt32")]
        public extern void SetInt32(HaxeInt byteOffset, HaxeInt value);

        [Name("setInt32")]
        public extern void SetInt32(HaxeInt byteOffset, HaxeInt value, HaxeBool littleEndian);

        [Name("setUint32")]
        public extern void SetUint32(HaxeInt byteOffset, HaxeInt value);

        [Name("setUint32")]
        public extern void SetUint32(HaxeInt byteOffset, HaxeInt value, HaxeBool littleEndian);

        [Name("setFloat32")]
        public extern void SetFloat32(HaxeInt byteOffset, HaxeFloat value);

        [Name("setFloat32")]
        public extern void SetFloat32(HaxeInt byteOffset, HaxeFloat value, HaxeBool littleEndian);

        [Name("setFloat64")]
        public extern void SetFloat64(HaxeInt byteOffset, HaxeFloat value);

        [Name("setFloat64")]
        public extern void SetFloat64(HaxeInt byteOffset, HaxeFloat value, HaxeBool littleEndian);
    }
}
