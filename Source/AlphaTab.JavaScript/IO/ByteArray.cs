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
using System.Collections.TypedArrays;
using System.Runtime.CompilerServices;

namespace AlphaTab.IO
{
    [IncludeGenericArguments(false)]
    [IgnoreNamespace]
    [Imported(ObeysTypeSystem = true)]
    [ScriptName("Uint8Array")]
    public partial class ByteArray
    {
        // ReSharper disable UnusedParameter.Local

        [InlineCode("new Uint8Array({size})")]
        public ByteArray(int size)
        {
        }

        [InlineCode("new Uint8Array({data})")]
        public ByteArray(params byte[] data)
        {
        }

        [InlineCode("new Uint8Array({data})")]
        public ByteArray(ArrayBuffer data)
        {
        }



        public int Length
        {
            [InlineCode("{this}.length")]
            get
            {
                return 0;
            }
        }

        [IntrinsicProperty]
        public byte this[int index]
        {
            get
            {
                return 0;
            }
            set
            {
            }
        }

        // ReSharper restore UnusedParameter.Local
    }
}
