using SharpKit.Html;

namespace AlphaTab.Xml
{
    class XmlDocumentWrapper : IXmlDocument
    {
        private readonly Document _document;

        public XmlDocumentWrapper(Document document)
        {
            _document = document;
        }

        public IXmlNode DocumentElement
        {
            get { return new XmlNodeWrapper(_document.documentElement); }
        }
    }
}
