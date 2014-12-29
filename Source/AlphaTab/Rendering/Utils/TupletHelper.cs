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
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    public class TupletHelper
    {
        private bool _isFinished;

        public FastList<Beat> Beats { get; set; }
        public int VoiceIndex { get; set; }
        public int Tuplet { get; set; }

        public TupletHelper(int voice)
        {
            VoiceIndex = voice;
            Beats = new FastList<Beat>();
        }

        public bool IsFull
        {
            get
            {
                return Beats.Count == Tuplet;
            }
        }

        public void Finish()
        {
            _isFinished = true;
        }

        public bool Check(Beat beat)
        {
            if (Beats.Count == 0)
            {
                Tuplet = beat.TupletNumerator;
            }
            else if (beat.Voice.Index != VoiceIndex || beat.TupletNumerator != Tuplet || IsFull || _isFinished)
            {
                return false;
            }
            Beats.Add(beat);
            return true;
        }
    }
}
