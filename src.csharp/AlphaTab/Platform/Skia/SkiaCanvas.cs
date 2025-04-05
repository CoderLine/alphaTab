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
            type.Assembly.GetManifestResourceStream(type.Namespace + ".Bravura.otf")!;
        var bravuraData = new MemoryStream((int)bravura.Length);
        bravura.CopyTo(bravuraData);
        MusicFont = AlphaSkiaTypeface.Register(new ArrayBuffer(bravuraData.ToArray()))!;
    }

    internal static void Enable(ArrayBuffer bravura, object? unused)
    {
        MusicFont?.Dispose();
        MusicFont = AlphaSkiaTypeface.Register(bravura);
    }
}
