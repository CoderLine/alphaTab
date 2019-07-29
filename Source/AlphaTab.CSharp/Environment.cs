using AlphaTab.Platform.CSharp;
using AlphaTab.Platform.Svg;

namespace AlphaTab
{
    internal partial class Environment
    {
        private static void PlatformInit()
        {
            RenderEngines["svg"] = new RenderEngineFactory(true, () => new CssFontSvgCanvas());
#if NET472
            RenderEngines["gdi"] = new RenderEngineFactory(true, () => new GdiCanvas());
#endif
            RenderEngines["skia"] = new RenderEngineFactory(true, () => new SkiaCanvas());
            RenderEngines["default"] = RenderEngines["skia"];
        }
    }
}
