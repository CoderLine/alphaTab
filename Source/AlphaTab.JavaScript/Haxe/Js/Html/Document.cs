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
    [Name("js.html.Document")]
    public class Document 
    {
        [Name("currentScript")]
        public extern Element CurrentScript { get; }

        [Name("fonts")]
        public extern FontFaceSet Fonts { get; }

        [Name("querySelector")]
        public extern Element QuerySelector(HaxeString selectors);
        [Name("querySelectorAll")]
        public extern NodeList QuerySelectorAll(HaxeString selectors);

        [Name("getElementById")]
        public extern Element GetElementById(HaxeString id);

        [Name("createElement")]
        public extern Element CreateElement(HaxeString localName);
        
        [Name("getElementsByTagName")]
        public extern HTMLCollection GetElementsByTagName(HaxeString localName);

        [Name("createEvent")]
        public extern Event CreateEvent(HaxeString interface_);
    }
}