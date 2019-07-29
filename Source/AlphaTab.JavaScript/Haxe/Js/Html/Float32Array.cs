using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.Float32Array")]
    [NativeConstructors]
    public class Float32Array : ArrayBufferView
    {
        public static readonly HaxeInt BYTES_PER_ELEMENT;

        [Name("length")]
        public extern HaxeInt Length { get; }

        public extern Float32Array(HaxeInt length);
        public extern Float32Array(Float32Array array);
        public extern Float32Array(HaxeFloat[] array);
        public extern Float32Array(ArrayBuffer buffer);
        public extern Float32Array(ArrayBuffer buffer, HaxeInt byteOffset, HaxeInt length);

        [NativeIndexer]
        public extern HaxeFloat this[HaxeInt index]
        {
            get;
            set;
        }

        [Name("set")]
        public extern void Set(Float32Array buffer);

        [Name("set")]
        public extern void Set(Float32Array buffer, HaxeInt offset);

        [Name("set")]
        public extern void Set(HaxeFloat[] buffer);

        [Name("set")]
        public extern void Set(HaxeFloat[] buffer, HaxeInt offset);

        [Name("subarray")]
        public extern Float32Array SubArray(HaxeInt start);

        [Name("subarray")]
        public extern Float32Array SubArray(HaxeInt start, HaxeInt end);
    }
}
