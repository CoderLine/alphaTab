/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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

namespace AlphaTab.Rendering.Staves
{
    /// <summary>
    /// This public class stores size information about a stave. 
    /// It is used by the layout engine to collect the sizes of score parts
    /// to align the parts across multiple staves.
    /// </summary>
    public class BarSizeInfo
    {
        public float FullWidth { get; set; }
        public FastDictionary<string, float> Sizes { get; set; }

        public FastDictionary<int, float> PreNoteSizes { get; set; }
        public FastDictionary<int, float> OnNoteSizes { get; set; }
        public FastDictionary<int, float> PostNoteSizes { get; set; }

        public BarSizeInfo()
        {
            Sizes = new FastDictionary<string, float>();
            PreNoteSizes = new FastDictionary<int, float>();
            OnNoteSizes = new FastDictionary<int, float>();
            PostNoteSizes = new FastDictionary<int, float>();
            FullWidth = 0;
        }

        public void SetSize(string key, float size)
        {
            Sizes[key] = size;
        }

        public float GetSize(string key)
        {
            if (Sizes.ContainsKey(key))
            {
                return Sizes[key];
            }
            return 0;
        }

        public float GetPreNoteSize(int beat)
        {
            if (PreNoteSizes.ContainsKey(beat))
            {
                return PreNoteSizes[beat];
            }
            return 0;
        }

        public float GetOnNoteSize(int beat)
        {
            if (OnNoteSizes.ContainsKey(beat))
            {
                return OnNoteSizes[beat];
            }
            return 0;
        }

        public float GetPostNoteSize(int beat)
        {
            if (PostNoteSizes.ContainsKey(beat))
            {
                return PostNoteSizes[beat];
            }
            return 0;
        }

        public void SetPreNoteSize(int beat, float size)
        {
            PreNoteSizes[beat] = size;
        }

        public void SetOnNoteSize(int beat, float size)
        {
            OnNoteSizes[beat] = size;
        }

        public void SetPostNoteSize(int beat, float size)
        {
            PostNoteSizes[beat] = size;
        }
    }
}
