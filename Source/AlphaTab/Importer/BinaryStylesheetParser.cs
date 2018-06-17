using AlphaTab.Collections;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Importer
{
    class BinaryStylesheet
    {
        public FastDictionary<string, object> Raw { get; }

        public BinaryStylesheet()
        {
            Raw = new FastDictionary<string, object>();
        }

        public void Apply(Score score)
        {
            foreach (var key in Raw)
            {
                switch (key)
                {
                    case "StandardNotation/hideDynamics":
                        score.Stylesheet.HideDynamics = (bool) Raw[key];
                        break;
                }
            }
        }

        public void AddValue(string key, object value)
        {
            Raw[key] = value;
        }
    }

    class BinaryStylesheetParser
    {
        enum DataType
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
            for (int i = 0; i < entryCount; i++)
            {
                var key = readable.GpReadString(readable.ReadByte());
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
                        var s = readable.GpReadString(readable.ReadInt16BE());
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
                        Stylesheet.AddValue(key, new Bounds
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
