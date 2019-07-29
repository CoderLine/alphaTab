using AlphaTab.Collections;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;

namespace AlphaTab.Platform.Svg
{
    /// <summary>
    /// This public class stores text widths for several fonts and allows width calculation 
    /// </summary>
    internal partial class FontSizes
    {
        public static byte[] GenerateFontLookup(string family)
        {
            if (FontSizeLookupTables == null)
            {
                FontSizeLookupTables = new FastDictionary<string, byte[]>();
            }

            if (FontSizeLookupTables.ContainsKey(family))
            {
                return FontSizeLookupTables[family];
            }

            var canvas = (CanvasElement)Browser.Document.CreateElement("canvas");
            var measureContext = (CanvasRenderingContext2D)canvas.GetContext("2d");
            measureContext.Font = "11px " + family;

            var sizes = new FastList<byte>();
            for (var i = 0x20; i < 255; i++)
            {
                var s = Platform.StringFromCharCode(i);
                sizes.Add((byte)measureContext.MeasureText(s).Width);
            }

            var data = sizes.ToArray();
            FontSizeLookupTables[family] = data;
            return data;
        }
    }
}
