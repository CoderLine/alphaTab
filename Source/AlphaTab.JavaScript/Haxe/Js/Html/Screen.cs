using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.Screen")]
    public class Screen
    {
        [Name("top")]
        public extern HaxeInt Top { get; }

        [Name("left")]
        public extern HaxeInt Left { get; }

        [Name("width")]
        public extern HaxeInt Width { get; }

        [Name("height")]
        public extern HaxeInt Height { get; }
    }
}
