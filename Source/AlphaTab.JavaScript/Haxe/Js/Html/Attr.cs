using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.Attr")]
    public class Attr : Node
    {
        [Name("name")]
        public extern HaxeString Name { get; }

        [Name("value")]
        public extern HaxeString Value { get; }
    }
}
