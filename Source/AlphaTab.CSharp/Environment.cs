using AlphaTab.Platform.CSharp;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering;

namespace AlphaTab
{
    partial class Environment
    {
        static void PlatformInit()
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
