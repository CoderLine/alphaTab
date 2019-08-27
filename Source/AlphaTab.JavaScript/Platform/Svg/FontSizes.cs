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
        public static void GenerateFontLookup(string family)
        {
            if (FontSizeLookupTables == null)
            {
                Init();
            }
            if (FontSizeLookupTables.ContainsKey(family))
            {
                return;
            }

            if (Lib.Global.document)
            {
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
            }
            else
            {
                FontSizeLookupTables[family] = new byte[]
                {
                    8
                };
            }
        }
    }
}
