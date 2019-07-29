using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.StyleElement")]
    [CastMode(CastMode.UnsafeCast)]
    public class StyleElement : Element
    {
        [Name("type")]
        public extern HaxeString Type { get; set; }
    }
}