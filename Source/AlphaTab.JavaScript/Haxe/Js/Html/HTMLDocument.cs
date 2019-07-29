using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.HTMLDocument")]
    public class HTMLDocument : Document
    {
        [Name("write")]
        public extern void Write(HaxeString s);
        [Name("body")]
        public extern BodyElement Body { get; set; }
        [Name("documentElement")]
        public extern Element DocumentElement { get; set; }
        [Name("createTextNode")]
        public extern Node CreateTextNode(HaxeString text);
    }
}
