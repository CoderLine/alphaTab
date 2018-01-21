using Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.WorkerGlobalScope")]
    public class WorkerGlobalScope : EventTarget
    {
    }

    [External]
    [Name("js.html.DedicatedWorkerGlobalScope")]
    public class DedicatedWorkerGlobalScope : WorkerGlobalScope
    {
        [Name("postMessage")]
        public extern void PostMessage(object message);
    }

    [External]
    [Name("js.html.MessageEvent")]
    public class MessageEvent : Event
    {
        [Name("data")]
        public dynamic Data { get; }
        public extern MessageEvent(string type, dynamic eventInitDict);
    }

}
