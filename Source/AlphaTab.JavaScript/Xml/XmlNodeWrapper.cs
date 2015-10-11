using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab.Xml
{
    class XmlNodeWrapper : IXmlNode
    {
        private readonly Node _node;

        public XmlNodeWrapper(Node node)
        {
            _node = node;
        }

        public XmlNodeType NodeType
        {
            get
            {
                return (XmlNodeType) _node.nodeType;
            }
        }

        public string LocalName
        {
            get { return _node.localName; }
        }

        public string Value
        {
            get { return _node.nodeValue; }
        }

        public IXmlNodeCollection ChildNodes
        {
            get
            {
                return new XmlNodeCollectionWrapper(_node.childNodes);
            }
        }

        public IXmlNode FirstChild
        {
            get
            {
                return new XmlNodeWrapper(_node.firstChild);
            }
        }

        public IXmlAttributeCollection Attributes
        {
            get { return new XmlAttributeCollectionWrapper(_node.attributes); }
        }

        public string GetAttribute(string name)
        {
            return _node.As<Element>().getAttribute(name);
        }

        public IXmlNodeCollection GetElementsByTagName(string nodeName)
        {
            return new XmlNodeCollectionWrapper(_node.As<Element>().getElementsByTagName(nodeName));
        }
    }
}