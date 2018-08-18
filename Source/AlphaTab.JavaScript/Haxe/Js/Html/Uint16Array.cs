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

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.Uint16Array")]
    [NativeConstructors]
    public class Uint16Array : ArrayBufferView
    {
        public static readonly HaxeInt BYTES_PER_ELEMENT;

        [Name("length")]
        public extern HaxeInt Length { get; }

        public extern Uint16Array(HaxeInt length);
        public extern Uint16Array(Uint8Array array);
        public extern Uint16Array(HaxeInt[] array);
        public extern Uint16Array(ArrayBuffer buffer);
        public extern Uint16Array(ArrayBuffer buffer, HaxeInt byteOffset, HaxeInt length);

        [NativeIndexer]
        public extern HaxeInt this[HaxeInt index] { get; set; }

        [Name("set")]
        public extern void Set(Uint8Array buffer);
        [Name("set")]
        public extern void Set(Uint8Array buffer, HaxeInt offset);
        [Name("set")]
        public extern void Set(HaxeInt[] buffer);
        [Name("set")]
        public extern void Set(HaxeInt[] buffer, HaxeInt offset);

        [Name("subarray")]
        public extern Uint8Array SubArray(HaxeInt start);
        [Name("subarray")]
        public extern Uint8Array SubArray(HaxeInt start, HaxeInt end);
    }
}