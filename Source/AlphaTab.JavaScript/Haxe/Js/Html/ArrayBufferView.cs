using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("haxe.js.ArrayBufferView")]
    public class ArrayBufferView
    {
        [Name("buffer")]
        public extern ArrayBuffer Buffer { get; }

        [Name("byteOffset")]
        public extern HaxeInt ByteOffset { get; }

        [Name("byteLength")]
        public extern HaxeInt ByteLength { get; }
    }
}