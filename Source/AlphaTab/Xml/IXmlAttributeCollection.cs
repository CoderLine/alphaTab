namespace AlphaTab.Xml
{
    public interface IXmlAttributeCollection
    {
        IXmlNode this[string key] { get; }
    }
}