using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.NodeList")]
    public class NodeList 
    {
        [Name("length")]
        public extern HaxeInt Length { get; }

        [Name("item")]
        public extern Node Item(HaxeInt index);
    }
}