using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.DOMPointReadonly")]
    public class DOMPointReadonly
    {
        [Name("w")]
        public extern HaxeFloat W { get; }
        [Name("x")]
        public extern HaxeFloat X { get; }
        [Name("y")]
        public extern HaxeFloat Y { get; }
        [Name("z")]
        public extern HaxeFloat Z { get; }
    }
}