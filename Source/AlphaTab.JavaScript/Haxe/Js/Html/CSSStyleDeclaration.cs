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
using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.CSSStyleDeclaration")]
    public class CSSStyleDeclaration
    {
        [Name("opacity")]
        public extern HaxeString Opacity { get; set; }
        [Name("position")]
        public extern HaxeString Position { get; set; }
        [Name("left")]
        public extern HaxeString Left { get; set; }
        [Name("top")]
        public extern HaxeString Top { get; set; }
        [Name("fontSize")]
        public extern HaxeString FontSize { get; set; }
        [Name("fontFamily")]
        public extern HaxeString FontFamily { get; set; }
        [Name("width")]
        public HaxeString Width { get; set; }
        [Name("height")]
        public HaxeString Height { get; set; }
        [Name("overflow")]
        public HaxeString Overflow { get; set; }
        [Name("lineHeight")]
        public HaxeString LineHeight { get; set; }
        [Name("display")]
        public HaxeString Display { get; set; }
    }
}