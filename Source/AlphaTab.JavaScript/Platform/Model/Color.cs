using AlphaTab.Util;
using AlphaTab.Utils;
using Phase;

namespace AlphaTab.Platform.Model
{
    public partial class Color
    {
        public static Color FromJson(object json)
        {
            if (json == null)
            {
                return null;
            }

            if (json is Color)
            {
                return (Color)json;
            }

            switch (Platform.TypeOf(json))
            {
                case "number":
                    var c = new Color(0, 0, 0, 0);
                    var raw = json.As<double>();
                    c.Raw = (int)raw;
                    c.UpdateRgba();
                    return c;
                case "string":
                    var s = json.As<string>();
                    if (s.StartsWith("#"))
                    {
                        if (s.Length == 4) // #RGB
                        {
                            return new Color(
                                (byte)(Platform.ParseHex(s.Substring(1, 1)) * 17),
                                (byte)(Platform.ParseHex(s.Substring(2, 1)) * 17),
                                (byte)(Platform.ParseHex(s.Substring(3, 1)) * 17)
                            );
                        }

                        if (s.Length == 5) // #RGBA
                        {
                            return new Color(
                                (byte)(Platform.ParseHex(s.Substring(1, 1)) * 17),
                                (byte)(Platform.ParseHex(s.Substring(2, 1)) * 17),
                                (byte)(Platform.ParseHex(s.Substring(3, 1)) * 17),
                                (byte)(Platform.ParseHex(s.Substring(4, 1)) * 17)
                            );
                        }

                        if (s.Length == 7) // #RRGGBB
                        {
                            return new Color(
                                (byte)Platform.ParseHex(s.Substring(1, 2)),
                                (byte)Platform.ParseHex(s.Substring(3, 2)),
                                (byte)Platform.ParseHex(s.Substring(5, 2))
                            );
                        }

                        if (s.Length == 9) // #RRGGBBAA
                        {
                            return new Color(
                                (byte)Platform.ParseHex(s.Substring(1, 2)),
                                (byte)Platform.ParseHex(s.Substring(3, 2)),
                                (byte)Platform.ParseHex(s.Substring(5, 2)),
                                (byte)Platform.ParseHex(s.Substring(7, 2))
                            );
                        }
                    }
                    else if (s.StartsWith("rgba") || s.StartsWith("rgb"))
                    {
                        var start = s.IndexOf("(");
                        var end = s.LastIndexOf(")");
                        if (start == -1 || end == -1)
                        {
                            throw new SerializationException("No values specified for rgb/rgba function");
                        }

                        var numbers = s.Substring(start + 1, end - start - 1).Split(',');
                        if (numbers.Length == 3)
                        {
                            return new Color(
                                (byte)Platform.ParseInt(numbers[0]),
                                (byte)Platform.ParseInt(numbers[1]),
                                (byte)Platform.ParseInt(numbers[2])
                            );
                        }

                        if (numbers.Length == 4)
                        {
                            return new Color(
                                (byte)Platform.ParseInt(numbers[0]),
                                (byte)Platform.ParseInt(numbers[1]),
                                (byte)Platform.ParseInt(numbers[2]),
                                (byte)(Platform.ParseFloat(numbers[3]) * 255)
                            );
                        }
                    }

                    break;
            }

            throw new SerializationException("Unsupported format for color");
        }

        public static object ToJson(Color obj)
        {
            return obj.Raw;
        }
    }
}
