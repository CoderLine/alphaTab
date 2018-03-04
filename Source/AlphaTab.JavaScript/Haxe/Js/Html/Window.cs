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
using System;
using Haxe;
using Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.Window")]
    public class Window : EventTarget
    {
        [Name("document")]
        public extern HTMLDocument Document { get; }
        [Name("screen")]
        public extern Screen Screen { get; }
        [Name("location")]
        public extern Location Location { get; }

        [Name("setTimeout")]
        public extern HaxeInt SetTimeout(Delegate handler, HaxeInt timeout);

        [Name("getComputedStyle")]
        public extern CSSStyleDeclaration GetComputedStyle(Element elt);

        [Name("clearTimeout")]
        public extern void ClearTimeout(HaxeInt timeoutId);

        [Name("setInterval")]
        public extern HaxeInt SetInterval(Delegate handler, HaxeInt interval);

        [Name("clearInterval")]
        public extern void ClearInterval(HaxeInt intervalId);

        [Name("innerHeight")]
        public extern HaxeInt InnerHeight { get; }

        [Name("innerWidth")]
        public extern HaxeInt InnerWidth { get; }

        [Name("pageYOffset")]
        public HaxeInt PageYOffset { get; }

        [Name("pageXOffset")]
        public HaxeInt PageXOffset { get; }

        [Name("open")]
        public extern Window Open(HaxeString url, HaxeString target, HaxeString features);
        [Name("resizeTo")]
        public extern void ResizeTo(HaxeInt x, HaxeInt y);

        [Name("moveTo")]
        public extern void MoveTo(HaxeInt x, HaxeInt y);
        [Name("focus")]
        public extern void Focus();

        [Name("print")]
        public extern void Print();

        [Name("requestAnimationFrame")]
        public extern void RequestAnimationFrame(Action<HaxeFloat> function);
    }
}