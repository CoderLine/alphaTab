/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
using Phase;
using Phase.Attributes;

namespace AlphaTab.Collections
{
    [Abstract("String")]
    [NativeConstructors]
    public class StringBuilder
    {
        [Inline]
        public StringBuilder()
        {
            Script.Write("this = \"\";");
        }

        [Inline]
        public void Append(object s)
        {
            Script.Write("this += Std.string(s);");
        }

        [Inline]
        public void AppendChar(int i)
        {
            Script.Write("this += String.fromCharCode(i.ToHaxeInt());");
        }

        [Inline]
        public void AppendLine(string s = "")
        {
            Script.Write("this += s + \"\\r\\n\";");
        }

        [Inline]
        public override string ToString()
        {
            return Script.Write<string>("this");
        }
    }
}
