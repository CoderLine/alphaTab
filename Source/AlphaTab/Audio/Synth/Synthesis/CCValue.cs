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

namespace AlphaTab.Audio.Synth.Synthesis
{

    class CCValue
    {
        private byte _coarseValue;
        private byte _fineValue;
        private short _combined;

        public byte Coarse
        {
            get { return _coarseValue; }
            set { _coarseValue = value; UpdateCombined(); }
        }
        public byte Fine
        {
            get { return _fineValue; }
            set { _fineValue = value; UpdateCombined(); }
        }
        public short Combined
        {
            get { return _combined; }
            set { _combined = value; UpdateCoarseFinePair(); }
        }

        public CCValue(byte coarse, byte fine)
        {
            _coarseValue = coarse;
            _fineValue = fine;
            _combined = 0;
            UpdateCombined();
        }

        public CCValue(short combined)
        {
            _coarseValue = 0;
            _fineValue = 0;
            _combined = combined;
            UpdateCoarseFinePair();
        }

        private void UpdateCombined()
        {
            _combined = (short)((_coarseValue << 7) | _fineValue);
        }
        private void UpdateCoarseFinePair()
        {
            _coarseValue = (byte)(_combined >> 7);
            _fineValue = (byte)(_combined & 0x7F);
        }
    }
}