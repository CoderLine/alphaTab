/*
 * This file is part of alphaSynth.
 * Copyright (c) 2014, T3866, PerryCodes, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using System;
using AlphaTab.Platform;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Bank
{
    public abstract class PcmData
    {
        protected byte[] Data;

        public int Length { get; protected set; }
        public int BytesPerSample { get; protected set; }
        public int BitsPerSample { get { return BytesPerSample * 8; } }

        protected PcmData(int bits, byte[] pcmData, bool isDataInLittleEndianFormat)
        {
            BytesPerSample = (byte)(bits / 8);
            //if (pcmData.Length % BytesPerSample != 0)
            //    throw new Exception("Invalid PCM format. The PCM data was an invalid size.");
            Data = pcmData;
            Length = Data.Length / BytesPerSample;
            if (Platform.Platform.IsLittleEndian != isDataInLittleEndianFormat)
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

    public class PcmData8Bit : PcmData
    {
        public PcmData8Bit(int bits, byte[] pcmData, bool isDataInLittleEndianFormat) : base(bits, pcmData, isDataInLittleEndianFormat) { }
        public override float this[int index]
        {
            get { return ((Data[index] / 255f) * 2f) - 1f; }
        }
    }

    public class PcmData16Bit : PcmData
    {
        public PcmData16Bit(int bits, byte[] pcmData, bool isDataInLittleEndianFormat) : base(bits, pcmData, isDataInLittleEndianFormat) { }
        public override float this[int index]
        {
            get { index *= 2; return (((Data[index] | (Data[index + 1] << 8)) << 16) >> 16) / 32768f; }
        }
    }

    public class PcmData24Bit : PcmData
    {
        public PcmData24Bit(int bits, byte[] pcmData, bool isDataInLittleEndianFormat) : base(bits, pcmData, isDataInLittleEndianFormat) { }
        public override float this[int index]
        {
            get { index *= 3; return (((Data[index] | (Data[index + 1] << 8) | (Data[index + 2] << 16)) << 12) >> 12) / 8388608f; }
        }
    }

    public class PcmData32Bit : PcmData
    {
        public PcmData32Bit(int bits, byte[] pcmData, bool isDataInLittleEndianFormat) : base(bits, pcmData, isDataInLittleEndianFormat) { }
        public override float this[int index]
        {
            get { index *= 4; return (Data[index] | (Data[index + 1] << 8) | (Data[index + 2] << 16) | (Data[index + 3] << 24)) / 2147483648f; }
        }
    }
}
