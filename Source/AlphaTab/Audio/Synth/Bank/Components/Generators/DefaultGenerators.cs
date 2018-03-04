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

using AlphaTab.Audio.Synth.Bank.Descriptors;

namespace AlphaTab.Audio.Synth.Bank.Components.Generators
{
    public class DefaultGenerators
    {
        public static readonly Generator DefaultSine = new SineGenerator(new GeneratorDescriptor());
        public static readonly Generator DefaultSaw = new SawGenerator(new GeneratorDescriptor());
        public static readonly Generator DefaultSquare = new SquareGenerator(new GeneratorDescriptor());
        public static readonly Generator DefaultTriangle = new TriangleGenerator(new GeneratorDescriptor());
    }
}
