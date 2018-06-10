using Haxe.IO;
using Haxe;
using Phase;

namespace AlphaTab.IO
{
    class ReadableInput : HaxeInput
    {
        private readonly IReadable _readable;

        public ReadableInput(IReadable readable)
        {
            _readable = readable;
        }

        public override HaxeInt ReadByte()
        {
            return _readable.ReadByte();
        }

        public override HaxeInt ReadBytes(HaxeBytes s, HaxeInt pos, HaxeInt len)
        {
            byte[] data = Script.Write<byte[]>("s.getData()");
            return _readable.Read(data, pos, len);
        }
    }
}