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
using SharpKit.JavaScript;

namespace AlphaTab.Collections
{
    [JsType(Mode = JsMode.Prototype, Name = "Array", Export = false)]
    public class StringBuilder
    {
        [JsMethod(Code = "[]")]
        public StringBuilder()
        {
        }

        [JsMethod(InlineCodeExpression = "this.push(s)", Export = false)]
        public void Append(object s)
        {
        }

        [JsMethod(InlineCodeExpression = "this.push(String.fromCharCode(i))", Export = false)]
        public void AppendChar(int i)
        {
        }

        [JsMethod(InlineCodeExpression = "this.push('\\r\\n')", Export = false)]
        public void AppendLine()
        {
        }

        [JsMethod(InlineCodeExpression = "this.join('')", Export = false)]
        public new string ToString()
        {
            return "";
        }
    }
}
