using System.Xml;

namespace AlphaTab.Xml
{
    class XmlDocumentWrapper : IXmlDocument
    {
        private readonly XmlDocument _document;

        public XmlDocumentWrapper(XmlDocument document)
        {
            _document = document;
        }

        public IXmlNode DocumentElement
        {
            get { return new XmlNodeWrapper(_document.DocumentElement); }
        }
    }
}
