using System.Xml;

namespace AlphaTab.Xml
{
    class XmlAttributeCollectionWrapper : IXmlAttributeCollection
    {
        private readonly XmlAttributeCollection _attributes;

        public XmlAttributeCollectionWrapper(XmlAttributeCollection attributes)
        {
            _attributes = attributes;
        }

        public IXmlNode Get(string key)
        {
            return new XmlNodeWrapper(_attributes[key]);
        }
    }
}