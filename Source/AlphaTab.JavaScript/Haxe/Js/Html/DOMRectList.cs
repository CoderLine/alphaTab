using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.DOMRectList")]
    public class DOMRectList 
    {
        [Name("length")]
        public extern HaxeInt Length { get; }
    }
}