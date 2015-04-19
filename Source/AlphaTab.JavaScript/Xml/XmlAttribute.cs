using SharpKit.JavaScript;

namespace System.Xml
{
    [JsType(JsMode.Prototype, Export = false, Name = "Attr", Native = true)]
    public abstract class XmlAttribute : XmlNode
    {
    }
}