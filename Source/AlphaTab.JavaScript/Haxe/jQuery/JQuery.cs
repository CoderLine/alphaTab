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
using AlphaTab.Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.jQuery
{
    [Name("js.jquery.JQuery")]
    [NativeConstructors]
    [External]
    public class JQuery
    {
        public extern JQuery();
        public extern JQuery(Element element);
        public extern JQuery(JQuery selection);
        public extern JQuery(object obj);
        public extern JQuery(string html, object attributes);
        public extern JQuery(string html, Document ownerDocument);
        public extern JQuery(string selector);

        [Name("context")]
        public extern Element Context { get; }

        [Name("length")]
        public extern int Length { get; }

        [Name("data")]
        public extern object Data(string key);

        [Name("data")]
        public extern object Data(string key, object value);

        [Name("removeData")]
        public extern void RemoveData(string key);

        [Name("empty")]
        public extern JQuery Empty();

        [NativeIndexer]
        public extern Element this[int index]
        {
            get;
            set;
        }
    }
}
