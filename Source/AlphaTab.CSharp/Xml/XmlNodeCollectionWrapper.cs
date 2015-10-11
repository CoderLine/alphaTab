using System.Xml;

namespace AlphaTab.Xml
{
    class XmlNodeCollectionWrapper : IXmlNodeCollection
    {
        private readonly XmlNodeList _xmlNodeList;

        public XmlNodeCollectionWrapper(XmlNodeList xmlNodeList)
        {
            _xmlNodeList = xmlNodeList;
        }

        public int Count
        {
            get { return _xmlNodeList.Count; }
        }

        public IXmlNode this[int index]
        {
            get { return new XmlNodeWrapper(_xmlNodeList[index]); }
        }
    }
}