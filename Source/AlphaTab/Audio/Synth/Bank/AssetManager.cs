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

using AlphaTab.Collections;

namespace AlphaTab.Audio.Synth.Bank
{
    class AssetManager
    {
        public FastList<PatchAsset> PatchAssets { get; }
        public FastList<SampleDataAsset> SampleAssets { get; }

        public AssetManager()
        {
            PatchAssets = new FastList<PatchAsset>();
            SampleAssets = new FastList<SampleDataAsset>();
        }

        public PatchAsset FindPatch(string name)
        {
            foreach (var patchAsset in PatchAssets)
            {
                if (patchAsset.Name == name)
                {
                    return patchAsset;
                }
            }
            return null;
        }

        public SampleDataAsset FindSample(string name)
        {
            foreach (var sampleDataAsset in SampleAssets)
            {
                if (sampleDataAsset.Name == name)
                {
                    return sampleDataAsset;
                }
            }
            return null;
        }
    }
}
