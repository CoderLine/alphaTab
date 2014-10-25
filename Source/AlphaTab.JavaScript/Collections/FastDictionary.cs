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
using System.Collections.Generic;
using SharpKit.JavaScript;

namespace AlphaTab.Collections
{
    /// <summary>
    /// This is an improved dictionary which is also optimized for the JavaScript platform. 
    /// </summary>
    /// <typeparam name="TKey"></typeparam>
    /// <typeparam name="TValue"></typeparam>
    [JsType(Mode = JsMode.Prototype, Name = "Object", Export = false, IgnoreGenericTypeArguments = true)]
    public class FastDictionary<TKey, TValue>
    {
        [JsMethod(InlineCode = "{}")]
        public FastDictionary()
        {
        }

        [JsProperty(NativeIndexer = true)]
        public TValue this[TKey key]
        {
            [JsMethod(Export = false)]
            get
            {
                return default(TValue);
            }
            [JsMethod(Export = false)]
            set
            {
            }
        }

        public string[] Keys
        {
            [JsMethod(InlineCodeExpression = "Object.keys(this)", Export = false)]
            get { return null; }
        }

        public IEnumerable<TValue> Values
        {
            [JsMethod(InlineCodeExpression = "this", Export = false)]
            get
            {
                return null;
            }
        }

        public int Count
        {
            [JsMethod(InlineCodeExpression = "Object.keys(this).length", Export = false)]
            get
            {
                return 0;
            }
        }

        [JsMethod(InlineCodeExpression = "delete this[key]", Export = false)]
        public void Remove(TKey key)
        {
        }

        [JsMethod(InlineCodeExpression = "this.hasOwnProperty(key)", Export = false)]
        public bool ContainsKey(TKey key)
        {
            return false;
        }
    }
}
