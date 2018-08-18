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
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.Console")]
    public class Console
    {
        [Name("debug")]
        [RawParams]
        public extern void Debug(params object[] data);
        [Name("info")]
        [RawParams]
        public extern void Info(params object[] data);
        [Name("warn")]
        [RawParams]
        public extern void Warn(params object[] data);
        [Name("error")]
        [RawParams]
        public extern void Error(params object[] data);
    }
}