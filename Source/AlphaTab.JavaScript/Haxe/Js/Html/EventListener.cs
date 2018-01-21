using AlphaTab.Haxe.Js.Html;
using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.EventTarget")]
    public abstract class EventListener
    {
        public abstract void HandleEvent(Event e);
    }
}