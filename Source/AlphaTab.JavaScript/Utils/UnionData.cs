/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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

namespace AlphaTab.Utils
{
    [Abstract("js.html.DataView")]
    class UnionData
    {
        [Inline]
        public UnionData() => Script.AbstractThis = new DataView(new ArrayBuffer(8));

        //double values
        public double Double1
        {
            [Inline]
            get { return Script.This<DataView>().GetFloat64(0, true); }
        }
        //float values
        public double Float1
        {
            [Inline]
            get { return Script.This<DataView>().GetFloat32(0, true); }
        }
        public double Float2
        {
            [Inline]
            get { return Script.This<DataView>().GetFloat32(4, true); }
        }
        //int values
        public double Int1
        {
            [Inline]
            get { return Script.This<DataView>().GetInt32(0, true); }
        }
        public double Int2
        {
            [Inline]
            get { return Script.This<DataView>().GetInt32(4, true); }
        }
    }
}
