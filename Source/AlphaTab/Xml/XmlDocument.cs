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

namespace AlphaTab.Xml
{
    public class XmlDocument : XmlNode
    {
        public XmlNode DocumentElement { get; private set; }

        public XmlDocument(string xml)
        {
            NodeType = XmlNodeType.Document;
            XmlParser.Parse(xml, 0, this);
            foreach (var child in ChildNodes)
            {
                if (child.NodeType == XmlNodeType.Element)
                {
                    DocumentElement = child;
                    break;
                }
            }
        }


    }
}
