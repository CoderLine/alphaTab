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

namespace AlphaTab.Audio.Synth.Ds
{
    /// <summary>
    /// Represents an array of audiosamples. 
    /// </summary>
    public class SampleArray
    {
        /// <summary>
        /// Gets the audio samples as floats. 
        /// </summary>
        public float[] Samples
        {
            get;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="SampleArray"/> class.
        /// </summary>
        /// <param name="length">The length of the array.</param>
        public SampleArray(int length)
        {
            Samples = new float[length];
        }

        /// <summary>
        /// Gets or sets the sample at the specified index.
        /// </summary>
        /// <param name="index">The index of the sample to get or set.</param>
        /// <returns>The sample at the specified index.</returns>
        public float this[int index]
        {
            get => Samples[index];
            set => Samples[index] = value;
        }

        /// <summary>
        /// Gets the total number of samples contained in this array
        /// </summary>
        public int Length => Samples.Length;

        /// <summary>
        /// Resets all samples in the array to 0. 
        /// </summary>
        public void Clear()
        {
            Array.Clear(Samples, 0, Samples.Length);
        }

        /// <summary>
        /// Copies a range of samples from the given source array into the specified destination. 
        /// </summary>
        /// <param name="src">The array where to copy the samples from.</param>
        /// <param name="srcPos">The start index from which to start copying.</param>
        /// <param name="dest">The array where to copy the samples to.</param>
        /// <param name="destPos">The start index at which the samples should be written in the destination array.</param>
        /// <param name="len">The number of samples to copy.</param>
        public static void Blit(SampleArray src, int srcPos, SampleArray dest, int destPos, int len)
        {
            Array.Copy(src.Samples, srcPos, dest.Samples, destPos, len);
        }
    }
}
