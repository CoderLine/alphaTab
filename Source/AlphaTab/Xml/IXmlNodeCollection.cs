namespace AlphaTab.Xml
{
    public interface IXmlNodeCollection 
    {
        int Count { get; }
        IXmlNode Get(int index);
    }
}