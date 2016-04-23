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

        public float PreNoteSize { get; set; }
        public float PostNoteSize { get; set; }
        public float VoiceSize { get; set; }

        public BarSizeInfo()
        {
            Sizes = new FastDictionary<string, float>();
            FullWidth = 0;
            PreNoteSize = 0;
            PostNoteSize = 0;
            VoiceSize = 0;
        }

        public void UpdatePreNoteSize(float size)
        {
            if (size > PreNoteSize)
            {
                PreNoteSize = size;
            }
        }

        public void UpdatePostNoteSize(float size)
        {
            if (size > PostNoteSize)
            {
                PostNoteSize = size;
            }
        }

        public void UpdateVoiceSize(float size)
        {
            if (size > VoiceSize)
            {
                VoiceSize = size;
            }
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

    }
}
