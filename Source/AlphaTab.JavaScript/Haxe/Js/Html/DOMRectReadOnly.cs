using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.DOMRectReadOnly")]
    public class DOMRectReadOnly
    {
        [Name("top")]
        public extern HaxeFloat Top { get; }

        [Name("left")]
        public extern HaxeFloat Left { get; }

        [Name("right")]
        public extern HaxeFloat Right { get; }

        [Name("bottom")]
        public extern HaxeFloat Bottom { get; }

        [Name("x")]
        public extern HaxeFloat X { get; }

        [Name("y")]
        public extern HaxeFloat Y { get; }

        [Name("width")]
        public extern HaxeFloat Width { get; }

        [Name("height")]
        public extern HaxeFloat Height { get; }
    }
}
