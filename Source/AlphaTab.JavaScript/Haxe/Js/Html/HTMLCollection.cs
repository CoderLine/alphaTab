using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.HTMLCollection")]
    public class HTMLCollection
    {
        [Name("length")]
        public extern HaxeInt Length { get; }

        [Name("item")]
        public extern Element Item(HaxeInt index);

    }
}