using Haxe;
using Phase.Attributes;

namespace Haxe.IO
{
    [External]
    [Name("haxe.io.BytesBuffer")]
    [NativeConstructors]
    public class HaxeBytesBuffer
    {
        [Name("addBytes")]
        public extern void AddBytes(HaxeBytes src, HaxeInt pos, HaxeInt len);

        [Name("getBytes")]
        public extern HaxeBytes GetBytes();
    }
}
