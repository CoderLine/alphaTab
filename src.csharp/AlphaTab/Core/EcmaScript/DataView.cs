using System;

namespace AlphaTab.Core.EcmaScript
{
    public class DataView
    {
        private readonly ArrayBuffer _buffer;

        public DataView(ArrayBuffer buffer)
        {
            _buffer = buffer;
        }

        public void SetUint16(double offset, double value, bool littleEndian)
        {
            var bytes = BitConverter.GetBytes((ushort) value);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            Buffer.BlockCopy(bytes, 0, _buffer.Raw.Array, _buffer.Raw.Offset + (int) offset,
                bytes.Length);
        }

        public double GetInt16(double offset, bool littleEndian)
        {
            var bytes = new byte[sizeof(short)];
            Buffer.BlockCopy(_buffer.Raw.Array, _buffer.Raw.Offset + (int) offset, bytes, 0,
                bytes.Length);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            return BitConverter.ToInt16(bytes, 0);
        }

        public void SetInt16(double offset, double value, bool littleEndian)
        {
            var bytes = BitConverter.GetBytes((short) value);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            Buffer.BlockCopy(bytes, 0, _buffer.Raw.Array, _buffer.Raw.Offset + (int) offset,
                bytes.Length);
        }

        public double GetUint32(double offset, bool littleEndian)
        {
            var bytes = new byte[sizeof(uint)];
            Buffer.BlockCopy(_buffer.Raw.Array, _buffer.Raw.Offset + (int) offset, bytes, 0,
                bytes.Length);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            return BitConverter.ToUInt32(bytes, 0);
        }

        public void SetInt32(double offset, double value, bool littleEndian)
        {
            var bytes = BitConverter.GetBytes((int) value);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            Buffer.BlockCopy(bytes, 0, _buffer.Raw.Array, _buffer.Raw.Offset + (int) offset, bytes
                .Length);
        }

        public double GetUint16(double offset, bool littleEndian)
        {
            var bytes = new byte[sizeof(ushort)];
            Buffer.BlockCopy(_buffer.Raw.Array, _buffer.Raw.Offset + (int) offset, bytes, 0,
                bytes.Length);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            return BitConverter.ToUInt16(bytes, 0);
        }

        public void SetUint8(double offset, double value)
        {
            _buffer.Raw.Array[_buffer.Raw.Offset + (int) offset] = (byte) value;
        }

        public double GetInt8(double offset)
        {
            return (sbyte) _buffer.Raw.Array[_buffer.Raw.Offset + (int) offset];
        }
    }
}
