using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.DedicatedWorkerGlobalScope")]
    public class DedicatedWorkerGlobalScope : WorkerGlobalScope
    {
        [Name("postMessage")]
        public extern void PostMessage(object message);
    }
}