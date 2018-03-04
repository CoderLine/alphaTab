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
namespace AlphaTab.Audio.Synth.Sf2
{
    public class PresetHeader
    {
        public string Name { get; set; }
        public int PatchNumber { get; set; }
        public int BankNumber { get; set; }
        public int Library { get; set; }
        public int Genre { get; set; }
        public int Morphology { get; set; }
        public Zone[] Zones { get; set; }
    }
}
