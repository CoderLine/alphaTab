using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.UIEvent")]
    public class UIEvent : Event
    {
        [Name("pageX")]
        public extern int PageX { get; }
        [Name("pageY")]
        public extern int PageY { get; }

        public extern UIEvent(HaxeString type, dynamic eventInitDict);
    }
}