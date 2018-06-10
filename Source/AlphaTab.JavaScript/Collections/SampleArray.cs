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
using Haxe.Js.Html;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Audio.Synth.Ds
{
    [Abstract("js.html.Float32Array")]
    [NativeConstructors]
    class SampleArray
    {
        [Inline]
        public SampleArray(int length) =>  Script.AbstractThis = new Float32Array(length);

        public Float32Array ToFloat32Array() => Script.AbstractThis.As<Float32Array>();

        public float this[int index]
        {
            [Inline]
            get { return Script.This<Float32Array>()[index]; }
            [Inline]
            set
            {
                Script.This<Float32Array>()[index] = value;
            }
        }

        public int Length
        {
            [Inline]
            get
            {
                return Script.This<Float32Array>().Length;
            }
        }

        [Inline]
        public void Clear()
        {
            Script.AbstractThis = new Float32Array(Length);
        }

        [Inline]
        public static void Blit(SampleArray src, int srcPos, SampleArray dest, int destPos, int len)
        {
            dest.ToFloat32Array().Set(src.ToFloat32Array().SubArray(srcPos, srcPos + len), destPos);
        }
    }
}
