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