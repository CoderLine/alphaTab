using System;

namespace AlphaTab.Xml
{
    public class XmlException : Exception
    {
        public string Xml { get; private set; }
        public int Pos { get; private set; }

        public XmlException(string message, string xml, int pos) : base(message)
        {
            Xml = xml;
            Pos = pos;
        }
    }
}
