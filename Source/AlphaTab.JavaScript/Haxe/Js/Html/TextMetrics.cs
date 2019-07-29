using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.TextMetrics")]
    public class TextMetrics
    {
        [Name("width")]
        public extern HaxeFloat Width { get; }
    }
}
