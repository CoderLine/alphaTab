using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class RiffChunk
    {
        public string Id { get; set; }
        public uint Size { get; set; }

        public static bool Load(RiffChunk parent, RiffChunk chunk, IReadable stream)
        {
            if (parent != null && RiffChunk.HeaderSize > parent.Size)
            {
                return false;
            }

            if (stream.Position + HeaderSize >= stream.Length)
            {
                return false;
            }

            chunk.Id = stream.Read8BitStringLength(4);
            if (chunk.Id[0] <= ' ' || chunk.Id[0] >= 'z')
            {
                return false;
            }
            chunk.Size = stream.ReadUInt32LE();

            if (parent != null && HeaderSize + chunk.Size > parent.Size)
            {
                return false;
            }

            if (parent != null)
            {
                parent.Size -= HeaderSize + chunk.Size;
            }

            var isRiff = chunk.Id == "RIFF";
            var isList = chunk.Id == "LIST";

            if (isRiff && parent != null)
            {
                // not allowed
                return false;
            }

            if (!isRiff && !isList)
            {
                // custom type without sub type
                return true;
            }

            // for lists unwrap the list type
            chunk.Id = stream.Read8BitStringLength(4);
            if (chunk.Id[0] <= ' ' || chunk.Id[0] >= 'z')
            {
                return false;
            }
            chunk.Size -= 4;

            return true;
        }

        public const int HeaderSize = 4 /*FourCC*/ + 4 /*Size*/;
    }
}
