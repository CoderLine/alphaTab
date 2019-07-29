using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.NamedNodeMap")]
    public class NamedNodeMap
    {
        [Name("length")]
        public extern HaxeInt Length { get; }
        [Name("getNamedItem")]
        public extern Attr GetNamedItem(HaxeString name);
        [Name("item")]
        public extern Attr Item(HaxeInt index);
    }
}