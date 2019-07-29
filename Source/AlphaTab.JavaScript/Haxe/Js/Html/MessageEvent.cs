using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.MessageEvent")]
    public class MessageEvent : Event
    {
        [Name("data")]
        public dynamic Data { get; }

        public extern MessageEvent(HaxeString type, dynamic eventInitDict);
    }
}
