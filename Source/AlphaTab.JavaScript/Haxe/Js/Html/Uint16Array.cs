using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.Uint16Array")]
    [NativeConstructors]
    public class Uint16Array : ArrayBufferView
    {
        public static readonly HaxeInt BYTES_PER_ELEMENT;

        [Name("length")]
        public extern HaxeInt Length { get; }

        public extern Uint16Array(HaxeInt length);
        public extern Uint16Array(Uint8Array array);
        public extern Uint16Array(HaxeInt[] array);
        public extern Uint16Array(ArrayBuffer buffer);
        public extern Uint16Array(ArrayBuffer buffer, HaxeInt byteOffset, HaxeInt length);

        [NativeIndexer]
        public extern HaxeInt this[HaxeInt index] { get; set; }

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