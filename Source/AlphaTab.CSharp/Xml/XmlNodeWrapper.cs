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

        public IXmlNodeCollection ChildNodes
        {
            get
            {
                return new XmlNodeCollectionWrapper(_node.ChildNodes);
            }
        }

        public IXmlNode FirstChild
        {
            get
            {
                return new XmlNodeWrapper(_node.FirstChild);
            }
        }

        public IXmlAttributeCollection Attributes
        {
            get { return new XmlAttributeCollectionWrapper(_node.Attributes); }
        }

        public string GetAttribute(string name)
        {
            return ((XmlElement)_node).GetAttribute(name);
        }

        public IXmlNodeCollection GetElementsByTagName(string nodeName)
        {
            return new XmlNodeCollectionWrapper(((XmlElement)_node).GetElementsByTagName(nodeName));
        }
    }
}