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
using System.Linq;
using System.Xml;

namespace AlphaTab.Xml
{
    class XmlNodeWrapper : IXmlNode
    {
        private readonly XmlNode _node;

        public XmlNodeWrapper(XmlNode node)
        {
            _node = node;
        }

        public XmlNodeType NodeType
        {
            get { return (XmlNodeType)_node.NodeType; }
        }

        public string LocalName
        {
            get { return _node.LocalName; }
        }

        public string Value
        {
            get { return _node.Value; }
        }

        public string TextContent
        {
            get { return _node.InnerText; }
        }

        public IXmlNode[] ChildNodes
        {
            get
            {
                return _node.ChildNodes.OfType<XmlNode>().Select(n=>new XmlNodeWrapper(n)).Cast<IXmlNode>().ToArray();
            }
        }

        public IXmlNode FirstChild
        {
            get
            {
                return _node.FirstChild == null ? null : new XmlNodeWrapper(_node.FirstChild);
            }
        }

        public string GetAttribute(string name)
        {
            return ((XmlElement)_node).GetAttribute(name);
        }

        public IXmlNode[] GetElementsByTagName(string nodeName)
        {
            return ((XmlElement) _node).GetElementsByTagName(nodeName)
                    .OfType<XmlElement>()
                    .Select(n => new XmlNodeWrapper(n))
                    .Cast<IXmlNode>()
                    .ToArray();
        }
    }
}