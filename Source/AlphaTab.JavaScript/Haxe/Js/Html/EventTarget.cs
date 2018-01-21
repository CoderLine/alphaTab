using System;
using AlphaTab.Haxe.Js.Html;
using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.EventTarget")]
    public class EventTarget
    {
        [Name("addEventListener")] public extern void AddEventListener(string type, EventListener listener, bool capture = false);
        [Name("addEventListener")] public extern void AddEventListener(string type, EventListener listener, bool capture, bool wantsUntrusted);

        [Name("addEventListener")] public extern void AddEventListener(string type, Delegate listener, bool capture = false);
        [Name("addEventListener")] public extern void AddEventListener(string type, Delegate listener, bool capture, bool wantsUntrusted);

        [Name("removeEventListener")] public extern void RemoveEventListener(string type, EventListener listener, bool capture = false);
        [Name("removeEventListener")] public extern void RemoveEventListener(string type, Delegate listener, bool capture = false);

        [Name("dispatchEvent")] public extern void DispatchEvent(Event e);
    }
}