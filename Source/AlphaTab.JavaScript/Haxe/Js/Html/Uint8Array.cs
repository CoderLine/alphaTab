using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("haxe.js.Uint8Array")]
    public class Uint8Array : ArrayBufferView
    {
        public static readonly HaxeInt BYTES_PER_ELEMENT;

        [Name("length")]
        public extern HaxeInt Length { get; }

        public extern Uint8Array(HaxeInt length);
        public extern Uint8Array(Uint8Array array);
        public extern Uint8Array(HaxeInt[] array);
        public extern Uint8Array(ArrayBuffer buffer);
        public extern Uint8Array(ArrayBuffer buffer, HaxeInt byteOffset, HaxeInt length);

        [Name("set")]
        public extern void Set(Uint8Array buffer);
        [Name("set")]
        public extern void Set(Uint8Array buffer, HaxeInt offset);
        [Name("set")]
        public extern void Set(HaxeInt[] buffer);
        [Name("set")]
        public extern void Set(HaxeInt[] buffer, HaxeInt offset);

        [Name("subarray")]
        public extern Uint8Array SubArray(HaxeInt start);
        [Name("subarray")]
        public extern Uint8Array SubArray(HaxeInt start, HaxeInt end);
    }
}
