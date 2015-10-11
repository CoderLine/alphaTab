using SharpKit.Html;

namespace AlphaTab.Xml
{
    class XmlAttributeCollectionWrapper : IXmlAttributeCollection
    {
        private readonly NamedNodeMap _attributes;

        public XmlAttributeCollectionWrapper(NamedNodeMap attributes)
        {
            _attributes = attributes;
        }

        public IXmlNode this[string key]
        {
            get { return new XmlNodeWrapper(_attributes.getNamedItem(key)); }
        }
    }
}