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
using Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.Node")]
    public class Node : EventTarget
    {
        [Name("nodeName")]
        public extern HaxeString NodeName { get; }
        [Name("nodeValue")]
        public extern HaxeString NodeValue { get; }
        [Name("appendChild")]
        public extern void AppendChild(Node node);
        [Name("removeChild")]
        public extern void RemoveChild(Node node);
        [Name("childNodes")]
        public extern NodeList ChildNodes { get; }

        [Name("ownerDocument")]
        public HTMLDocument OwnerDocument { get; set; }

        [Name("replaceChild")]
        public extern void ReplaceChild(Node node, Node child);
    }
}