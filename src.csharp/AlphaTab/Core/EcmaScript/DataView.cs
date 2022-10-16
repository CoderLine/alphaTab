using System;

namespace AlphaTab.Core.EcmaScript
{
    public class DataView
    {
        public ArrayBuffer Buffer { get; }

        public DataView(ArrayBuffer buffer)
        {
            Buffer = buffer;
        }

        public double GetUint8(double offset)
        {
            return Buffer.Raw.Array![Buffer.Raw.Offset + (int) offset];
        }

        public void SetUint16(double offset, double value, bool littleEndian)
        {
            var bytes = BitConverter.GetBytes((ushort) value);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            System.Buffer.BlockCopy(bytes, 0, Buffer.Raw.Array!, Buffer.Raw.Offset + (int) offset,
                bytes.Length);
        }

        public double GetInt16(double offset, bool littleEndian)
        {
            var bytes = new byte[sizeof(short)];
            System.Buffer.BlockCopy(Buffer.Raw.Array!, Buffer.Raw.Offset + (int) offset, bytes, 0,
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

            System.Buffer.BlockCopy(bytes, 0, Buffer.Raw.Array!, Buffer.Raw.Offset + (int) offset,
                bytes.Length);
        }

        public double GetUint32(double offset, bool littleEndian)
        {
            var bytes = new byte[sizeof(uint)];
            System.Buffer.BlockCopy(Buffer.Raw.Array!, Buffer.Raw.Offset + (int) offset, bytes, 0,
                bytes.Length);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            return BitConverter.ToUInt32(bytes, 0);
        }

        public double GetInt32(double offset, bool littleEndian)
        {
            var bytes = new byte[sizeof(uint)];
            System.Buffer.BlockCopy(Buffer.Raw.Array!, Buffer.Raw.Offset + (int) offset, bytes, 0,
                bytes.Length);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            return BitConverter.ToInt32(bytes, 0);
        }

        public void SetInt32(double offset, double value, bool littleEndian)
        {
            var bytes = BitConverter.GetBytes((int) value);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            System.Buffer.BlockCopy(bytes, 0, Buffer.Raw.Array!, Buffer.Raw.Offset + (int) offset, bytes
                .Length);
        }

        public double GetUint16(double offset, bool littleEndian)
        {
            var bytes = new byte[sizeof(ushort)];
            System.Buffer.BlockCopy(Buffer.Raw.Array!, Buffer.Raw.Offset + (int) offset, bytes, 0,
                bytes.Length);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            return BitConverter.ToUInt16(bytes, 0);
        }

        public void SetUint8(double offset, double value)
        {
            Buffer.Raw.Array![Buffer.Raw.Offset + (int) offset] = (byte) value;
        }

        public double GetInt8(double offset)
        {
            return (sbyte) Buffer.Raw.Array![Buffer.Raw.Offset + (int) offset];
        }

        public double SetUint32(double offset, double value, bool littleEndian)
        {
            var bytes = BitConverter.GetBytes((uint)value);
            if (littleEndian != BitConverter.IsLittleEndian)
            {
                System.Array.Reverse(bytes);
            }

            System.Buffer.BlockCopy(bytes, 0, Buffer.Raw.Array!, Buffer.Raw.Offset + (int) offset, bytes
                .Length);
            return value;
        }
    }
}
