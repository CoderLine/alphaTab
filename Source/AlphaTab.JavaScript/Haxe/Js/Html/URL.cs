using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.URL")]
    public class URL
    {
        [Name("createObjectURL")]
        public static extern HaxeString CreateObjectURL(Blob blob);
    }
}
