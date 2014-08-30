using System;
using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Effects;
using AlphaTab.Rendering.Layout;
namespace AlphaTab
{
    /// <summary>
    /// This public class represents the global alphaTab environment where
    /// alphaTab looks for information like available layout engines
    /// staves etc.
    /// </summary>
    public partial class Environment
    {
        static void PlatformInit()
        {
            RenderEngines["default"] = d => new SvgCanvas();
            RenderEngines["html5"] = d => new AlphaTab.Platform.JavaScript.Html5Canvas(d);
            FileLoaders["default"] = () => new AlphaTab.Platform.JavaScript.JsFileLoader();
        }
    }
}
