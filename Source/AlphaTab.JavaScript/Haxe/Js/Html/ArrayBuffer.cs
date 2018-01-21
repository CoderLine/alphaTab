using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.ArrayBuffer")]
    public class ArrayBuffer
    {
        [Name("isView")]
        public static extern bool IsView(object value);

        [Name("byteLength")]
        public int ByteLength { get; }

        public extern ArrayBuffer(int length);

        [Name("slice")]
        public extern ArrayBuffer Slice(int begin);

        [Name("slice")]
        public extern ArrayBuffer Slice(int begin, int end);
    }
}