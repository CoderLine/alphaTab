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

using AlphaTab.Audio.Synth.Sf2;
using AlphaTab.Audio.Synth.Synthesis;
using AlphaTab.Platform;

namespace AlphaTab.Audio.Synth.Bank.Patch
{
    class MultiPatch : Patch
    {
        private IntervalType _intervalType;
        private PatchInterval[] _intervalList;

        public MultiPatch(string name)
            : base(name)
        {
            _intervalType = IntervalType.ChannelKeyVelocity;
        }

        public int FindPatches(int channel, int key, int velocity, Patch[] layers)
        {
            int count = 0;
            switch (_intervalType)
            {
                case IntervalType.ChannelKeyVelocity:
                    for (int x = 0; x < _intervalList.Length; x++)
                    {
                        if (_intervalList[x].CheckAllIntervals(channel, key, velocity))
                        {
                            layers[count++] = _intervalList[x].Patch;
                            if (count == layers.Length)
                                break;
                        }
                    }
                    break;
                case IntervalType.ChannelKey:
                    for (int x = 0; x < _intervalList.Length; x++)
                    {
                        if (_intervalList[x].CheckChannelAndKey(channel, key))
                        {
                            layers[count++] = _intervalList[x].Patch;
                            if (count == layers.Length)
                                break;
                        }
                    }
                    break;
                case IntervalType.KeyVelocity:
                    for (int x = 0; x < _intervalList.Length; x++)
                    {
                        if (_intervalList[x].CheckKeyAndVelocity(key, velocity))
                        {
                            layers[count++] = _intervalList[x].Patch;
                            if (count == layers.Length)
                                break;
                        }
                    }
                    break;
                case IntervalType.Key:
                    for (int x = 0; x < _intervalList.Length; x++)
                    {
                        if (_intervalList[x].CheckKey(key))
                        {
                            layers[count++] = _intervalList[x].Patch;
                            if (count == layers.Length)
                                break;
                        }
                    }
                    break;
            }
            return count;
        }

        public override bool Start(VoiceParameters voiceparams)
        {
            return false;
        }

        public override void Process(VoiceParameters voiceparams, int startIndex, int endIndex, bool isMuted, bool isSilentProcess)
        {

        }

        public override void Stop(VoiceParameters voiceparams)
        {
        }

        public void LoadSf2(Sf2Region[] regions, AssetManager assets)
        {
            _intervalList = new PatchInterval[regions.Length];
            for (int x = 0; x < regions.Length; x++)
            {
                byte loKey;
                byte hiKey;
                byte loVel;
                byte hiVel;
                if (Platform.Platform.IsLittleEndian)
                {
                    loKey = Platform.Platform.ToUInt8(regions[x].Generators[(int)GeneratorEnum.KeyRange] & 0xFF);
                    hiKey = Platform.Platform.ToUInt8((regions[x].Generators[(int)GeneratorEnum.KeyRange] >> 8) & 0xFF);
                    loVel = Platform.Platform.ToUInt8(regions[x].Generators[(int)GeneratorEnum.VelocityRange] & 0xFF);
                    hiVel = Platform.Platform.ToUInt8((regions[x].Generators[(int)GeneratorEnum.VelocityRange] >> 8) & 0xFF);
                }
                else
                {
                    hiKey = Platform.Platform.ToUInt8(regions[x].Generators[(int)GeneratorEnum.KeyRange] & 0xFF);
                    loKey = Platform.Platform.ToUInt8((regions[x].Generators[(int)GeneratorEnum.KeyRange] >> 8) & 0xFF);
                    hiVel = Platform.Platform.ToUInt8(regions[x].Generators[(int)GeneratorEnum.VelocityRange] & 0xFF);
                    loVel = Platform.Platform.ToUInt8((regions[x].Generators[(int)GeneratorEnum.VelocityRange] >> 8) & 0xFF);
                }
                var sf2 = new Sf2Patch(Name + "_" + x);
                sf2.Load(regions[x], assets);
                _intervalList[x] = new PatchInterval(sf2, 0, 15, loKey, hiKey, loVel, hiVel);
            }
            DetermineIntervalType();
        }

        private void DetermineIntervalType()
        {
            bool checkChannel = false;
            bool checkVelocity = false;
            for (int x = 0; x < _intervalList.Length; x++)
            {
                if (_intervalList[x].StartChannel != 0 || _intervalList[x].EndChannel != 15)
                {
                    checkChannel = true;
                    if (checkChannel && checkVelocity)
                        break;
                }
                if (_intervalList[x].StartVelocity != 0 || _intervalList[x].EndVelocity != 127)
                {
                    checkVelocity = true;
                    if (checkChannel && checkVelocity)
                        break;
                }
            }
            if (checkChannel & checkVelocity)
                _intervalType = IntervalType.ChannelKeyVelocity;
            else if (checkChannel)
                _intervalType = IntervalType.ChannelKey;
            else if (checkVelocity)
                _intervalType = IntervalType.KeyVelocity;
            else
                _intervalType = IntervalType.Key;
        }
    }

    enum IntervalType
    {
        ChannelKeyVelocity = 0,
        ChannelKey = 1,
        KeyVelocity = 2,
        Key = 3
    }

    class PatchInterval
    {
        public Patch Patch { get; set; }
        public byte StartChannel { get; set; }
        public byte StartKey { get; set; }
        public byte StartVelocity { get; set; }
        public byte EndChannel { get; set; }
        public byte EndKey { get; set; }
        public byte EndVelocity { get; set; }

        public PatchInterval(Patch patch, byte startChannel, byte endChannel, byte startKey, byte endKey, byte startVelocity, byte endVelocity)
        {
            Patch = patch;
            StartChannel = startChannel;
            EndChannel = endChannel;
            StartKey = startKey;
            EndKey = endKey;
            StartVelocity = startVelocity;
            EndVelocity = endVelocity;
        }

        public bool CheckAllIntervals(int channel, int key, int velocity)
        {
            return (channel >= StartChannel && channel <= EndChannel) &&
                (key >= StartKey && key <= EndKey) &&
                (velocity >= StartVelocity && velocity <= EndVelocity);
        }

        public bool CheckChannelAndKey(int channel, int key)
        {
            return (channel >= StartChannel && channel <= EndChannel) &&
                (key >= StartKey && key <= EndKey);
        }

        public bool CheckKeyAndVelocity(int key, int velocity)
        {
            return (key >= StartKey && key <= EndKey) &&
                (velocity >= StartVelocity && velocity <= EndVelocity);
        }

        public bool CheckKey(int key)
        {
            return (key >= StartKey && key <= EndKey);
        }
    }
}
