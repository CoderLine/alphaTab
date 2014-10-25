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
using System;
using System.Runtime.CompilerServices;
using SharpKit.JavaScript;

namespace AlphaTab.Collections
{
    /// <summary>
    /// This is an improved list which is also optimized for the JavaScript platform. 
    /// </summary>
    [JsType(Mode = JsMode.Prototype, Name = "Array", Export = false, IgnoreGenericTypeArguments = true)]
    public class FastList<T>
    {
        [JsMethod(InlineCode = "[]")]
        public FastList()
        {
        }

        public int Count
        {
            [JsMethod(InlineCodeExpression = "this.length", Export = false)]
            get
            {
                return 0;
            }
        }

        [JsProperty(NativeIndexer = true)]
        public T this[int index]
        {
            [JsMethod(Export = false)]
            get
            {
                return default(T);
            }
            [JsMethod(Export = false)]
            set
            {
            }
        }

        [JsMethod(InlineCodeExpression = "this.push(item)", Export = false)]
        public void Add(T item)
        {
        }

        [JsMethod(InlineCodeExpression = "this = this.concat(data)", Export = false)]
        public void AddRange(T[] data)
        {
        }

        [JsMethod(InlineCodeExpression = "this.slice(0)", Export = false)]
        public T[] ToArray()
        {
            return null;
        }

        [JsMethod(InlineCodeExpression = "this.splice(index, 1)", Export = false)]
        public void RemoveAt(int index)
        {
        }

        [JsMethod(InlineCodeExpression = "this.sort(func)", Export = false)]
        public void Sort(Comparison<T> func)
        {
        }

        [JsMethod(InlineCodeExpression = "this.splice(index, 0, item)", Export = false)]
        public void Insert(int index, T item)
        {
        }

        [JsMethod(InlineCodeExpression = "this.reverse()", Export = false)]
        public void Reverse()
        {
        }

        [JsMethod(InlineCodeExpression = "this.slice()", Export = false)]
        public FastList<T> Clone()
        {
            return null;
        }
    }
}
