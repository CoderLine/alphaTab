using Haxe;
using Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [Name("js.html.Worker")]
    [External]
    public class Worker : EventTarget
    {
        public extern Worker(HaxeString worker);

        [Name("postMessage")]
        public extern void PostMessage(object message);

        [Name("terminate")]
        public extern void Terminate();
    }
}
