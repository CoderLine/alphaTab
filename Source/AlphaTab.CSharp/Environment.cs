namespace AlphaTab
{
    public partial class Environment
    {
        static void PlatformInit()
        {
            RenderEngines["default"] = d => new AlphaTab.Platform.CSharp.GdiCanvas();
            RenderEngines["gdi"] = d => new AlphaTab.Platform.CSharp.GdiCanvas();
            FileLoaders["default"] = () => new AlphaTab.Platform.CSharp.CsFileLoader();
        }
    }
}
