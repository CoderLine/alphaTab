using System.IO;
using System.Reflection;

namespace AlphaTab.Platform.Skia;

internal partial class SkiaCanvas
{
    static SkiaCanvas()
    {
        var type = typeof(SkiaCanvas).GetTypeInfo();
        using var bravura =
            type.Assembly.GetManifestResourceStream(type.Namespace + ".Bravura.otf")!;
        using var bravuraData = new MemoryStream((int)bravura.Length);
        bravura.CopyTo(bravuraData);

        Enable(new ArrayBuffer(bravuraData.ToArray()), null);
    }

    // ReSharper disable once UnusedParameter.Global
    internal static void Enable(ArrayBuffer bravura, object? unused)
    {
        InitializeMusicFont(AlphaSkiaTypeface.Register(bravura)!);
    }
}
