namespace AlphaTab.Xml
{
    public interface IXmlNodeCollection 
    {
        int Count { get; }
        IXmlNode this[int index] { get; }
    }
}