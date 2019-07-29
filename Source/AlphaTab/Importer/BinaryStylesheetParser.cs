using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Importer
{
    /// <summary>
    /// A parser for the BinaryStylesheet file of Guitar Pro 6 and 7. 
    /// </summary>
    /// <remarks>
    /// The BinaryStylesheet is a simple binary key-value store.
    ///
    /// File: 
    ///     int32 (big endian) | Number of KeyValuePairs
    ///     KeyValuePair[]     | The raw records 
    ///
    /// KeyValuePair:
    ///     1 Byte  | length of the key
    ///     n Bytes | key as utf8 encoded string
    ///     1 Byte  | Data Type
    ///     n Bytes | Value
    ///
    /// Values based on Data Type:
    ///     0 = bool
    ///         0 == false
    ///     1 = int32 (big endian)
    ///     2 = float (big endian, IEEE)
    ///     3 = string
    ///       int16 (big endian) | length of string
    ///       n bytes            | utf-8 encoded string
    ///     4 = point
    ///       int32 (big endian) | X-coordinate
    ///       int32 (big endian) | Y-coordinate
    ///     5 = size
    ///       int32 (big endian) | Width
    ///       int32 (big endian) | Height
    ///     6 = rectangle
    ///       int32 (big endian) | X-coordinate
    ///       int32 (big endian) | Y-coordinate
    ///       int32 (big endian) | Width
    ///       int32 (big endian) | Height
    ///     7 = color
    ///       1 byte | Red
    ///       1 byte | Green
    ///       1 byte | Blue
    ///       1 byte | Alpha
    /// </remarks>
    internal class BinaryStylesheetParser
    {
        private enum DataType
        {
            Boolean,
            Integer,
            Float,
            String,
            Point,
            Size,
            Rectangle,
            Color
        }

        public BinaryStylesheet Stylesheet { get; private set; }

        public void Parse(byte[] data)
        {
            // BinaryStylesheet apears to be big-endien
            Stylesheet = new BinaryStylesheet();

            var readable = ByteBuffer.FromBuffer(data);
            var entryCount = readable.ReadInt32BE();
            for (var i = 0; i < entryCount; i++)
            {
                var key = readable.GpReadString(readable.ReadByte(), "utf-8");
                var type = (DataType)readable.ReadByte();

                switch (type)
                {
                    case DataType.Boolean:
                        var flag = readable.ReadByte() == 1;
                        Stylesheet.AddValue(key, flag);
                        break;
                    case DataType.Integer:
                        var ivalue = readable.ReadInt32BE();
                        Stylesheet.AddValue(key, ivalue);
                        break;
                    case DataType.Float:
                        var fvalue = readable.GpReadFloat();
                        Stylesheet.AddValue(key, fvalue);
                        break;
                    case DataType.String:
                        var s = readable.GpReadString(readable.ReadInt16BE(), "utf-8");
                        Stylesheet.AddValue(key, s);
                        break;
                    case DataType.Point:
                        var x = readable.ReadInt32BE();
                        var y = readable.ReadInt32BE();
                        Stylesheet.AddValue(key, new BendPoint(x, y));
                        break;
                    case DataType.Size:
                        var width = readable.ReadInt32BE();
                        var height = readable.ReadInt32BE();
                        Stylesheet.AddValue(key, new BendPoint(width, height));
                        break;
                    case DataType.Rectangle:
                        var rectX = readable.ReadInt32BE();
                        var rectY = readable.ReadInt32BE();
                        var rectW = readable.ReadInt32BE();
                        var rectH = readable.ReadInt32BE();
                        Stylesheet.AddValue(key,
                            new Bounds
                            {
                                X = rectX,
                                Y = rectY,
                                W = rectW,
                                H = rectH
                            });
                        break;
                    case DataType.Color:
                        var color = readable.GpReadColor(true);
                        Stylesheet.AddValue(key, color);
                        break;
                }
            }
        }
    }
}
