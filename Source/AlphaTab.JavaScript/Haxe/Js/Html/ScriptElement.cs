using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.ScriptElement")]
    [CastMode(CastMode.UnsafeCast)]
    public class ScriptElement : Element
    {
        [Name("src")]
        public extern HaxeString Src { get; set; }
    }
}