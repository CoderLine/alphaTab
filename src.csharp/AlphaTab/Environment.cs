
using AlphaTab.Core.EcmaScript;
using AlphaTab.Platform.CSharp;

namespace AlphaTab
{
    public partial class Environment
    {
        public static void PlatformInit()
        {
        }

        private static void CreatePlatformSpecificRenderEngines(Map<string, RenderEngineFactory> renderEngines)
        {
            renderEngines.Set(
                "skia",
                new RenderEngineFactory(true, () => {
                    return new SkiaCanvas();
                })
            );
        }
    }
}
