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

namespace AlphaTab.Collections
{
    public class StringBuilder
    {
        private readonly java.lang.StringBuilder _builder;

        public StringBuilder()
        {
            _builder = new java.lang.StringBuilder();
        }

        public void Append(object s)
        {
            _builder.append(s);
        }

        public void AppendChar(int i)
        {
            _builder.append((char)i);
        }

        public void AppendLine()
        {
            _builder.append("\r\n");
        }

        public new string ToString()
        {
            return _builder.toString();
        }
    }
}
