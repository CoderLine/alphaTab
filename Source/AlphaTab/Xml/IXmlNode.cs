namespace AlphaTab.Xml
{
    public interface IXmlNode
    {
        XmlNodeType NodeType { get; }
        string LocalName { get; }
        string Value { get; }
        IXmlNode[] ChildNodes { get; }
        IXmlNode FirstChild { get; }
        string GetAttribute(string name);
        IXmlNode[] GetElementsByTagName(string nodeName);
    }
}