using System;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Bank
{
    internal abstract class PcmData
    {
        protected byte[] Data;

        public int Length { get; protected set; }
        public int BytesPerSample { get; protected set; }
        public int BitsPerSample => BytesPerSample * 8;

        protected PcmData(int bits, byte[] pcmData, bool isDataInLittleEndianFormat)
        {
            BytesPerSample = (byte)(bits / 8);
            //if (pcmData.Length % BytesPerSample != 0)
            //    throw new Exception("Invalid PCM format. The PCM data was an invalid size.");
            Data = pcmData;
            Length = Data.Length / BytesPerSample;
            if (!isDataInLittleEndianFormat)
            {
                SynthHelper.SwapEndianess(Data, bits);
            }
        }

        public abstract float this[int index] { get; }

        public static PcmData Create(int bits, byte[] pcmData, bool isDataInLittleEndianFormat)
        {
            switch (bits)
            {
                case 8:
                    return new PcmData8Bit(bits, pcmData, isDataInLittleEndianFormat);
                case 16:
                    return new PcmData16Bit(bits, pcmData, isDataInLittleEndianFormat);
                case 24:
                    return new PcmData24Bit(bits, pcmData, isDataInLittleEndianFormat);
                case 32:
                    return new PcmData32Bit(bits, pcmData, isDataInLittleEndianFormat);
                default:
                    throw new Exception("Invalid PCM format. " + bits + "bit pcm data is not supported.");
            }
        }
    }

    internal class PcmData8Bit : PcmData
    {
        public PcmData8Bit(int bits, byte[] pcmData, bool isDataInLittleEndianFormat) : base(bits,
            pcmData,
            isDataInLittleEndianFormat)
        {
        }

        public override float this[int index] => Data[index] / 255f * 2f - 1f;
    }

    internal class PcmData16Bit : PcmData
    {
        public PcmData16Bit(int bits, byte[] pcmData, bool isDataInLittleEndianFormat) : base(bits,
            pcmData,
            isDataInLittleEndianFormat)
        {
        }

        public override float this[int index]
        {
            get
            {
                index *= 2;
                return (((Data[index] | (Data[index + 1] << 8)) << 16) >> 16) / 32768f;
            }
        }
    }

    internal class PcmData24Bit : PcmData
    {
        public PcmData24Bit(int bits, byte[] pcmData, bool isDataInLittleEndianFormat) : base(bits,
            pcmData,
            isDataInLittleEndianFormat)
        {
        }

        public override float this[int index]
        {
            get
            {
                index *= 3;
                return (((Data[index] | (Data[index + 1] << 8) | (Data[index + 2] << 16)) << 12) >> 12) / 8388608f;
            }
        }
    }

    internal class PcmData32Bit : PcmData
    {
        public PcmData32Bit(int bits, byte[] pcmData, bool isDataInLittleEndianFormat) : base(bits,
            pcmData,
            isDataInLittleEndianFormat)
        {
        }

        public override float this[int index]
        {
            get
            {
                index *= 4;
                return (Data[index] | (Data[index + 1] << 8) | (Data[index + 2] << 16) | (Data[index + 3] << 24)) /
                       2147483648f;
            }
        }
    }
}
