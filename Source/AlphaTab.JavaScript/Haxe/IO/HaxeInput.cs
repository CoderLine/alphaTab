using Phase.Attributes;

namespace Haxe.IO
{
    [External]
    [Name("haxe.io.Input")]
    [NoConstructor]
    public abstract class HaxeInput
    {
        [Name("readByte")]
        public abstract HaxeInt ReadByte();

        [Name("readBytes")]
        public virtual extern HaxeInt ReadBytes(HaxeBytes s, HaxeInt pos, HaxeInt len);

        [Name("close")]
        public virtual extern void Close();
    }
}
