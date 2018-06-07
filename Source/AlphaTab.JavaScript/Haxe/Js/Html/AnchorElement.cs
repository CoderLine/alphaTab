using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [Name("js.html.AnchorElement")]
    [External]
    public class AnchorElement : Element
    {
        [Name("href")]
        public extern HaxeString Href { get; set; }
        [Name("download")]
        public extern HaxeString Download { get; set; }
    }
}