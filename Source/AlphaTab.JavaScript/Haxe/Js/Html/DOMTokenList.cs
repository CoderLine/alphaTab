using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.DOMTokenList")]
    public class DOMTokenList
    {
        [Name("add")]
        public extern void Add(HaxeString token);

        [Name("remove")]
        public extern void Remove(HaxeString token);
    }
}
