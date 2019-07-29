using Phase.Attributes;

namespace AlphaTab.Haxe.Js
{
    [External]
    [Name("js.PromiseCallback")]
    public delegate TOut PromiseCallback<T, TOut>(T param);

    [External]
    [Name("js.Promise")]
    public class Promise<T>
    {
        [Name("then")]
        public extern void Then<TOut>(PromiseCallback<T, TOut> fulfillCallback);
    }
}
