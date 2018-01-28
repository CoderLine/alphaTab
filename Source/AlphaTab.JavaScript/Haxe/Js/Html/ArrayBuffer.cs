using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.ArrayBuffer")]
    public class ArrayBuffer
    {
        [Name("isView")]
        public static extern HaxeBool IsView(object value);

        [Name("byteLength")]
        public HaxeInt ByteLength { get; }

        public extern ArrayBuffer(HaxeInt length);

        [Name("slice")]
        public extern ArrayBuffer Slice(HaxeInt begin);

        [Name("slice")]
        public extern ArrayBuffer Slice(HaxeInt begin, HaxeInt end);
    }
}