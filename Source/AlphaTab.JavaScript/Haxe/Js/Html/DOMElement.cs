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
    [Name("js.html.DOMElement")]
    public class DOMElement : Node
    {
        [Name("id")]
        public HaxeString Id { get; set; }

        [Name("childElementCount")]
        public extern HaxeInt ChildElementCount { get; }
        [Name("lastChild")]
        public extern Node LastChild { get; }
        [Name("style")]
        public extern CSSStyleDeclaration Style { get; }
        [Name("classList")]
        public extern DOMTokenList ClassList { get; }
        [Name("outerHTML")]
        public extern HaxeString OuterHTML { get; set; }
        [Name("innerHTML")]
        public extern HaxeString InnerHTML { get; set; }
        [Name("innerText")]
        public extern HaxeString InnerText { get; set; }
        [Name("setAttribute")]
        public extern void SetAttribute(HaxeString name, HaxeString value);
        [Name("offsetWidth")]
        public extern HaxeInt OffsetWidth { get; }
        [Name("offsetHeight")]
        public extern HaxeInt OffsetHeight { get; }
        [Name("className")]
        public extern HaxeString ClassName { get; set; }
        [Name("dataset")]
        public extern DOMStringMap Dataset { get; set; }
        [Name("attributes")]
        public extern NamedNodeMap Attributes { get; set; }
        [Name("clientWidth")]
        public extern HaxeInt ClientWidth { get; set; }
        [Name("clientHeight")]
        public extern HaxeInt ClientHeight { get; set; }


        [Name("querySelector")]
        public extern Element QuerySelector(HaxeString selectors);
        [Name("querySelectorAll")]
        public extern NodeList QuerySelectorAll(HaxeString selectors);

        [Name("getClientRects")]
        public extern DOMRectList GetClientRects();
        [Name("getBoundingClientRect")]
        public extern DOMRect GetBoundingClientRect();


    }
}