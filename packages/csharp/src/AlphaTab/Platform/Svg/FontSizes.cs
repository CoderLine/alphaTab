using System.Text;
using AlphaTab.Collections;

namespace AlphaTab.Platform.Svg;

partial class FontSizes
{
    public static void GenerateFontLookup(string family)
    {
        if (FontSizeLookupTables.Has(family))
        {
            return;
        }

        using var canvas = new AlphaSkiaCanvas();
        canvas.BeginRender(10, 10);
        using var style = new AlphaSkiaTextStyle(
            new [] {family},
            400,
            false
        );
        const int measureSize = 11;

        var widths = new List<int>();
        var heights = new List<int>();
        for (var i = ControlChars; i < 255; i++)
        {
            var s = $"{(char)i}";
            using var metrics = canvas.MeasureText(s, style, measureSize, AlphaSkiaTextAlign.Left, AlphaSkiaTextBaseline.Alphabetic);
            widths.Add((int)metrics.Width);

            var height = metrics.ActualBoundingBoxDescent + metrics.ActualBoundingBoxAscent;
            heights.Add((int)height);
        }

        canvas.EndRender().Dispose();

        var data = new FontSizeDefinition(new Uint8Array(widths), new Uint8Array(heights));
        FontSizeLookupTables.Set(family, data);
    }
}
