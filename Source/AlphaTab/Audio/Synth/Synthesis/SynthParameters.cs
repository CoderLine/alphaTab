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
using AlphaTab.Audio.Synth.Bank.Components;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Synthesis
{
    /// <summary>
    /// Parameters for a single synth channel including its program, bank, and cc list.
    /// </summary>
    public class SynthParameters
    {
        /// <summary>
        /// program number
        /// </summary>
        public byte Program { get; set; }
        /// <summary>
        /// bank number
        /// </summary>
        public byte BankSelect { get; set; }
        /// <summary>
        /// channel pressure event
        /// </summary>
        public byte ChannelAfterTouch { get; set; }
        /// <summary>
        /// (vol) pan positions controlling both right and left output levels
        /// </summary>
        public CCValue Pan { get; set; }
        /// <summary>
        /// (vol) channel volume controller
        /// </summary>
        public CCValue Volume { get; set; }
        /// <summary>
        /// (vol) expression controller
        /// </summary>
        public CCValue Expression { get; set; }
        /// <summary>
        /// (pitch) mod wheel pitch modifier in partial cents ie. 22.3
        /// </summary>
        public CCValue ModRange { get; set; }
        /// <summary>
        /// (pitch) pitch bend including both semitones and cents
        /// </summary>
        public CCValue PitchBend { get; set; }
        /// <summary>
        /// controls max and min pitch bend range semitones
        /// </summary>
        public byte PitchBendRangeCoarse { get; set; }
        /// <summary>
        /// controls max and min pitch bend range cents
        /// </summary>
        public byte PitchBendRangeFine { get; set; }
        /// <summary>
        /// (pitch) transposition in semitones
        /// </summary>
        public short MasterCoarseTune { get; set; }
        /// <summary>
        /// (pitch) transposition in cents
        /// </summary>
        public CCValue MasterFineTune { get; set; }
        /// <summary>
        /// hold pedal status (true) for active
        /// </summary>
        public bool HoldPedal { get; set; }
        /// <summary>
        /// legato pedal status (true) for active
        /// </summary>
        public bool LegatoPedal { get; set; }
        /// <summary>
        /// registered parameter number
        /// </summary>
        public CCValue Rpn { get; set; }
        public Synthesizer Synth { get; set; }


        //These are updated whenever a midi event that affects them is recieved. 

        public float CurrentVolume { get; set; }
        public int CurrentPitch { get; set; }    //in cents
        public int CurrentMod { get; set; }      //in cents
        public PanComponent CurrentPan { get; set; }
        public float MixVolume { get; set; }

        public SynthParameters(Synthesizer synth)
        {
            Synth = synth;

            Pan = new CCValue(0);
            Volume = new CCValue(0);
            Expression = new CCValue(0);
            ModRange = new CCValue(0);
            PitchBend = new CCValue(0);
            MasterFineTune = new CCValue(0);
            Rpn = new CCValue(0);

            MixVolume = 1;

            CurrentPan = new PanComponent();

            ResetControllers();
        }
        /// <summary>
        /// Resets all of the channel's controllers to initial first power on values. Not the same as CC-121.
        /// </summary>
        public void ResetControllers()
        {
            Program = 0;
            BankSelect = 0;
            ChannelAfterTouch = 0; //Reset Channel Pressure to 0
            Pan.Combined = 0x2000;
            Volume.Fine = 0; Volume.Coarse = 100; //Reset Vol Positions back to 90/127 (GM spec)
            Expression.Combined = 0x3FFF; //Reset Expression positions back to 127/127
            ModRange.Combined = 0;
            PitchBend.Combined = 0x2000;
            PitchBendRangeCoarse = 2; //Reset pitch wheel to +-2 semitones (GM spec)
            PitchBendRangeFine = 0;
            MasterCoarseTune = 0;
            MasterFineTune.Combined = 0x2000; //Reset fine tune
            HoldPedal = false;
            LegatoPedal = false;
            Rpn.Combined = 0x3FFF; //Reset rpn
            UpdateCurrentPan();
            UpdateCurrentPitch();
            UpdateCurrentVolumeFromExpression();
        }

        public void UpdateCurrentPitch()
        {
            CurrentPitch = (int)(((PitchBend.Combined - 8192.0) / 8192.0) * ((100 * PitchBendRangeCoarse) + PitchBendRangeFine));
        }

        public void UpdateCurrentMod()
        {
            CurrentMod = (int)(SynthConstants.DefaultModDepth * (ModRange.Combined / 16383.0));
        }

        public void UpdateCurrentPan()
        {
            double value = SynthConstants.HalfPi * (Pan.Combined / 16383.0);
            CurrentPan.Left = (float)Math.Cos(value);
            CurrentPan.Right = (float)Math.Sin(value);
        }

        public void UpdateCurrentVolumeFromVolume()
        {
            CurrentVolume = Volume.Combined / 16383f;
            CurrentVolume *= CurrentVolume;
        }

        public void UpdateCurrentVolumeFromExpression()
        {
            CurrentVolume = Expression.Combined / 16383f;
            CurrentVolume *= CurrentVolume;
        }
    }
}
