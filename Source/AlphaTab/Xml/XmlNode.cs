// This XML parser is based on the XML Parser of the Haxe Standard Library (MIT)
/*
 * Copyright (C)2005-2017 Haxe Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

using AlphaTab.Collections;

namespace AlphaTab.Xml
{
    internal class XmlNode
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

        public XmlNode[] GetElementsByTagName(string name, bool recursive = false)
        {
            var tags = new FastList<XmlNode>();
            SearchElementsByTagName(ChildNodes, tags, name, recursive);
            return tags.ToArray();
        }

        private void SearchElementsByTagName(
            FastList<XmlNode> all,
            FastList<XmlNode> result,
            string name,
            bool recursive = false)
        {
            foreach (var c in all)
            {
                if (c != null && c.NodeType == XmlNodeType.Element && c.LocalName == name)
                {
                    result.Add(c);
                }

                if (recursive)
                {
                    SearchElementsByTagName(c.ChildNodes, result, name, true);
                }
            }
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

                    var s = txt.ToString();
                    return s.Trim();
                }

                return Value;
            }
        }
    }
}
