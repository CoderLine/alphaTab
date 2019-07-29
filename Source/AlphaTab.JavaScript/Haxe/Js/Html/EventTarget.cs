using System;
using AlphaTab.Haxe.Js.Html;
using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.EventTarget")]
    public class EventTarget
    {
        [Name("addEventListener")] public extern void AddEventListener(HaxeString type, EventListener listener);
        [Name("addEventListener")] public extern void AddEventListener(HaxeString type, EventListener listener, HaxeBool capture);
        [Name("addEventListener")] public extern void AddEventListener(HaxeString type, EventListener listener, HaxeBool capture, HaxeBool wantsUntrusted);

        [Name("addEventListener")] public extern void AddEventListener(HaxeString type, Delegate listener);
        [Name("addEventListener")] public extern void AddEventListener(HaxeString type, Delegate listener, HaxeBool capture);
        [Name("addEventListener")] public extern void AddEventListener(HaxeString type, Delegate listener, HaxeBool capture, bool wantsUntrusted);

        [Name("removeEventListener")] public extern void RemoveEventListener(HaxeString type, EventListener listener);
        [Name("removeEventListener")] public extern void RemoveEventListener(HaxeString type, EventListener listener, HaxeBool capture);
        [Name("removeEventListener")] public extern void RemoveEventListener(HaxeString type, Delegate listener);
        [Name("removeEventListener")] public extern void RemoveEventListener(HaxeString type, Delegate listener, HaxeBool capture);

        [Name("dispatchEvent")] public extern void DispatchEvent(Event e);
    }
}