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
using System.IO;
using AlphaTab.Collections;
using AlphaTab.Xml;

namespace AlphaTab.Platform
{
    public static partial class Std
    {
        public static bool IsStringNumber(string s, bool allowSign = true)
        {
            if (s.Length == 0) return false;
            var c = s[0];
            return IsCharNumber(c, allowSign);
        }

        public static bool IsCharNumber(int c, bool allowSign = true)
        {
            return (allowSign && c == 0x2D) || (c >= 0x30 && c <= 0x39);
        }

        public static bool IsWhiteSpace(int c)
        {
            return c == 0x20 || c == 0x0B || c == 0x0D || c == 0x0A;
        }

        public static string ToHexString(int n)
        {
            var s = "";
            const string hexChars = "0123456789ABCDEF";
            do
            {
                s = StringFromCharCode((int)hexChars[(n & 15)]) + s;
                n >>= 4;
            } while (n > 0);
            return s;
        }

        public static string GetNodeValue(IXmlNode n)
        {
            if (n.NodeType == XmlNodeType.Element || n.NodeType == XmlNodeType.Document)
            {
                var txt = new StringBuilder();
                n.IterateChildren(c =>
                {
                    txt.Append(GetNodeValue(c));
                });
                return txt.ToString().Trim();
            }
            return n.Value;
        }

        public static void IterateChildren(this IXmlNode n, Action<IXmlNode> action)
        {
            for (int i = 0; i < n.ChildNodes.Count; i++)
            {
                action(n.ChildNodes.Get(i));
            }
        }

    }
}
