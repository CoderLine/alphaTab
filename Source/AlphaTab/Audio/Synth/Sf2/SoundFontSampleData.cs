using System;
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Sf2
{
    internal class SoundFontSampleData
    {
        public int BitsPerSample { get; set; }
        public byte[] SampleData { get; set; }

        public SoundFontSampleData(IReadable input)
        {
            var id = input.Read8BitChars(4);
            var size = input.ReadInt32LE();
            if (id.ToLower() != "list")
            {
                throw new Exception("Invalid soundfont. Could not find sdta LIST chunk.");
            }

            var readTo = input.Position + size;
            id = input.Read8BitChars(4);
            if (id.ToLower() != "sdta")
            {
                throw new Exception("Invalid soundfont. The LIST chunk is not of type sdta.");
            }

            BitsPerSample = 0;
            byte[] rawSampleData = null;
            while (input.Position < readTo)
            {
                var subId = input.Read8BitChars(4);
                size = input.ReadInt32LE();
                switch (subId.ToLower())
                {
                    case "smpl":
                        BitsPerSample = 16;
                        rawSampleData = input.ReadByteArray(size);
                        break;
                    case "sm24":
                        if (rawSampleData == null || size != Math.Ceiling(SampleData.Length / 2.0))
                        {
                            //ignore this chunk if wrong size or if it comes first
                            input.Skip(size);
                        }
                        else
                        {
                            BitsPerSample = 24;
                            for (var x = 0; x < SampleData.Length; x++)
                            {
                                var b = new byte[3];
                                b[0] = (byte)input.ReadByte();
                                b[1] = rawSampleData[2 * x];
                                b[2] = rawSampleData[2 * x + 1];
                            }
                        }

                        if (size % 2 == 1)
                        {
                            if (input.ReadByte() != 0)
                            {
                                input.Position--;
                            }
                        }

                        break;
                    default:
                        throw new Exception("Invalid soundfont. Unknown chunk id: " + subId + ".");
                }
            }

            if (BitsPerSample == 16)
            {
                SampleData = rawSampleData;
            }
            else if (BitsPerSample != 24)
            {
                throw new Exception("Only 16 and 24 bit samples are supported.");
            }
        }
    }
}
