using AlphaTab.IO;
using AlphaTab.Platform.Model;

namespace AlphaTab.Importer
{
    internal static class GpBinaryHelpers
    {
        public static double GpReadDouble(this IReadable data)
        {
            var bytes = new byte[8];
            data.Read(bytes, 0, bytes.Length);
            return Platform.Platform.ToDouble(bytes);
        }

        public static float GpReadFloat(this IReadable data)
        {
            var bytes = new byte[4];
            bytes[3] = (byte)data.ReadByte();
            bytes[2] = (byte)data.ReadByte();
            bytes[2] = (byte)data.ReadByte();
            bytes[1] = (byte)data.ReadByte();
            return Platform.Platform.ToFloat(bytes);
        }

        public static Color GpReadColor(this IReadable data, bool readAlpha = false)
        {
            var r = (byte)data.ReadByte();
            var g = (byte)data.ReadByte();
            var b = (byte)data.ReadByte();
            byte a = 255;
            if (readAlpha)
            {
                a = (byte)data.ReadByte();
            }
            else
            {
                data.Skip(1);
            }

            return new Color(r, g, b, a);
        }


        public static bool GpReadBool(this IReadable data)
        {
            return data.ReadByte() != 0;
        }

        /// <summary>
        ///  Skips an integer (4byte) and reads a string using 
        ///  a bytesize
        /// </summary>
        /// <returns></returns>
        public static string GpReadStringIntUnused(this IReadable data, string encoding)
        {
            data.Skip(4);
            return data.GpReadString(data.ReadByte(), encoding);
        }

        /// <summary>
        /// Reads an integer as size, and then the string itself
        /// </summary>
        /// <returns></returns>
        public static string GpReadStringInt(this IReadable data, string encoding)
        {
            return data.GpReadString(data.ReadInt32LE(), encoding);
        }

        /// <summary>
        /// Reads an integer as size, skips a byte and reads the string itself
        /// </summary>
        /// <returns></returns>
        public static string GpReadStringIntByte(this IReadable data, string encoding)
        {
            var length = data.ReadInt32LE() - 1;
            data.ReadByte();
            return data.GpReadString(length, encoding);
        }

        public static string GpReadString(this IReadable data, int length, string encoding)
        {
            var b = new byte[length];
            data.Read(b, 0, b.Length);
            return Platform.Platform.ToString(b, encoding);
        }

        /// <summary>
        /// Reads a byte as size and the string itself.
        /// Additionally it is ensured the specified amount of bytes is read. 
        /// </summary>
        /// <param name="data">the data to read from.</param>
        /// <param name="length">the amount of bytes to read</param>
        /// <param name="encoding">The encoding to use to decode the byte into a string</param>
        /// <returns></returns>
        public static string GpReadStringByteLength(this IReadable data, int length, string encoding)
        {
            var stringLength = data.ReadByte();
            var s = data.GpReadString(stringLength, encoding);
            if (stringLength < length)
            {
                data.Skip(length - stringLength);
            }

            return s;
        }
    }
}
