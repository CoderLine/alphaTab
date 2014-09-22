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
using System.Runtime.CompilerServices;

namespace AlphaTab.Collections
{
    [IgnoreNamespace]
    [Imported(ObeysTypeSystem = true)]
    [ScriptName("Array")]
    public class StringBuilder
    {
        [InlineCode("[]")]
        public StringBuilder()
        {
        }

        [ScriptName("push")]
        public void Append(object s)
        {
        }

        [InlineCode("{this}.push(String.fromCharCode({i}))")]
        public void AppendChar(int i)
        {
        }

        [InlineCode("{this}.push('\\r\\n')")]
        public void AppendLine()
        {
        }

        [InlineCode("{this}.join('')")]
        public new string ToString()
        {
            return "";
        }
    }
}
