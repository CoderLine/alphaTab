using Haxe.Js.Html;
using Phase.Attributes;

namespace Haxe.IO
{
    [External]
    [Name("haxe.io.Bytes")]
    [NativeConstructors]
    public class HaxeBytes
    {
        [Name("getData")]
        public extern ArrayBuffer GetData();

        [Name("alloc")]
        public static extern HaxeBytes Alloc(HaxeInt size);
    }
}
