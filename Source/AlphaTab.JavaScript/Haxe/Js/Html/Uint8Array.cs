using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("haxe.js.Uint8Array")]
    public class Uint8Array : ArrayBufferView
    {
        public static readonly int BYTES_PER_ELEMENT;

        [Name("length")]
        public extern int Length { get; }

        public extern Uint8Array(int length);
        public extern Uint8Array(Uint8Array array);
        public extern Uint8Array(int[] array);
        public extern Uint8Array(ArrayBuffer buffer);
        public extern Uint8Array(ArrayBuffer buffer, int byteOffset, int length);

        [Name("set")]
        public extern void Set(Uint8Array buffer);
        [Name("set")]
        public extern void Set(Uint8Array buffer, int offset);
        [Name("set")]
        public extern void Set(int[] buffer);
        [Name("set")]
        public extern void Set(int[] buffer, int offset);

        [Name("subarray")]
        public extern Uint8Array SubArray(int start);
        [Name("subarray")]
        public extern Uint8Array SubArray(int start, int end);
    }
}
