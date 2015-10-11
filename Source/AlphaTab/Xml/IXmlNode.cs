namespace AlphaTab.Xml
{
    public interface IXmlNode
    {
        XmlNodeType NodeType { get; }
        string LocalName { get; }
        string Value { get; }
        IXmlNodeCollection ChildNodes { get; }
        IXmlNode FirstChild { get; }
        IXmlAttributeCollection Attributes { get; }
        string GetAttribute(string name);
        IXmlNodeCollection GetElementsByTagName(string nodeName);
    }
}