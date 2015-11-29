using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab.Xml
{
    class XmlAttributeCollectionWrapper : IXmlAttributeCollection
    {
        private readonly NamedNodeMap _attributes;

        public XmlAttributeCollectionWrapper(NamedNodeMap attributes)
        {
            _attributes = attributes;
        }

        public IXmlNode Get(string key)
        {
            return new XmlNodeWrapper(_attributes.getNamedItem(key));
        }
    }
}