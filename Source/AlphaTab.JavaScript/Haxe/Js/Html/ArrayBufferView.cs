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
        public extern int ByteOffset { get; }

        [Name("byteLength")]
        public extern int ByteLength { get; }
    }
}