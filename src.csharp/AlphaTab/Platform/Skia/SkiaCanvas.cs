using System.IO;
using System.Reflection;

namespace AlphaTab.Platform.Skia;

partial class SkiaCanvas
{
    static SkiaCanvas()
    {
        // attempt to load correct skia native lib
        var type = typeof(SkiaCanvas).GetTypeInfo();
        using var bravura =
            type.Assembly.GetManifestResourceStream(type.Namespace + ".Bravura.ttf")!;
        var bravuraData = new MemoryStream((int)bravura.Length);
        bravura.CopyTo(bravuraData);
        MusicFont = AlphaSkiaTypeface.Register(new ArrayBuffer(bravuraData.ToArray()))!;
        MusicFontSize = Environment.MusicFontSize;
    }
}
