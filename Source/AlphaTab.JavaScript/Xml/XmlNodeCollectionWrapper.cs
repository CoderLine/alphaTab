using SharpKit.Html;

namespace AlphaTab.Xml
{
    class XmlNodeCollectionWrapper : IXmlNodeCollection
    {
        private readonly NodeList _xmlNodeList;

        public XmlNodeCollectionWrapper(NodeList xmlNodeList)
        {
            _xmlNodeList = xmlNodeList;
        }

        public int Count
        {
            get { return _xmlNodeList.length; }
        }

        public IXmlNode Get(int index)
        {
            return new XmlNodeWrapper(_xmlNodeList[index]); 
        }
    }
}