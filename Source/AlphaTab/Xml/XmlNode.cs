/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Collections;

namespace AlphaTab.Xml
{
    public class XmlNode
    {
        public XmlNodeType NodeType { get; set; }
        public string LocalName { get; set; }
        public string Value { get; set; }
        public FastList<XmlNode> ChildNodes { get; private set; }
        public FastDictionary<string, string> Attributes { get; private set; }
        public XmlNode FirstChild { get; set; }
        public XmlNode FirstElement { get; set; }

        public XmlNode()
        {
            Attributes = new FastDictionary<string, string>();
            ChildNodes = new FastList<XmlNode>();
        }

        public void AddChild(XmlNode node)
        {
            ChildNodes.Add(node);
            FirstChild = node;
            if (node.NodeType == XmlNodeType.Element)
            {
                FirstElement = node;
            }
        }

        public string GetAttribute(string name)
        {
            if (Attributes.ContainsKey(name))
            {
                return Attributes[name];
            }
            return "";
        }

        public XmlNode[] GetElementsByTagName(string name)
        {
            var tags = new FastList<XmlNode>();
            foreach (var c in ChildNodes)
            {
                if (c != null && c.NodeType == XmlNodeType.Element && c.LocalName == name)
                {
                    tags.Add(c);
                }
            }
            return tags.ToArray();
        }

        public XmlNode FindChildElement(string name)
        {
            foreach (var c in ChildNodes)
            {
                if (c != null && c.NodeType == XmlNodeType.Element && c.LocalName == name)
                {
                    return c;
                }
            }
            return null;
        }

        public string InnerText
        {
            get
            {
                if (NodeType == XmlNodeType.Element || NodeType == XmlNodeType.Document)
                {
                    var txt = new StringBuilder();
                    foreach (var c in ChildNodes)
                    {
                        txt.Append(c.InnerText);
                    }
                    return txt.ToString().Trim();
                }
                return Value;
            }
        }
    }
}