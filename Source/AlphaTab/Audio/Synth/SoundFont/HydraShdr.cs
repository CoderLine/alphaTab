using System;
using System.IO;
using AlphaTab.IO;
using AlphaTab.Platform;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class HydraShdr
    {
        public const int SizeInFile = 46;

        public string SampleName { get; set; }
        public uint Start { get; set; }
        public uint End { get; set; }
        public uint StartLoop { get; set; }
        public uint EndLoop { get; set; }
        public uint SampleRate { get; set; }
        public byte OriginalPitch { get; set; }
        public sbyte PitchCorrection { get; set; }
        public ushort SampleLink { get; set; }
        public ushort SampleType { get; set; }

        public static HydraShdr Load(IReadable reader)
        {
            var shdr = new HydraShdr();
            shdr.SampleName = reader.Read8BitStringLength(20);
            shdr.Start = reader.ReadUInt32LE();
            shdr.End = reader.ReadUInt32LE();
            shdr.StartLoop = reader.ReadUInt32LE();
            shdr.EndLoop = reader.ReadUInt32LE();
            shdr.SampleRate = reader.ReadUInt32LE();
            shdr.OriginalPitch = (byte)reader.ReadByte();
            shdr.PitchCorrection = reader.ReadSignedByte();
            shdr.SampleLink = reader.ReadUInt16LE();
            shdr.SampleType = reader.ReadUInt16LE();
            return shdr;
        }
    }
}
