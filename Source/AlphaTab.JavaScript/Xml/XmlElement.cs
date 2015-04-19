using SharpKit.JavaScript;

namespace System.Xml
{
    [JsType(JsMode.Prototype, Export = false, Name = "Element", Native = true)]
    public abstract class XmlElement : XmlNode
    {
        [JsMethod(Name = "getAttribute")]
        public abstract string GetAttribute(string name);
    }
}