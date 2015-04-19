using SharpKit.JavaScript;

namespace System.Xml
{
    [JsType(JsMode.Prototype, Export = false, Name = "NodeList", Native = true)]
    public abstract class XmlNodeList
    {
        [JsMethod(Name = "item")]
        public abstract XmlNode Item(int index);
        [JsProperty(Name = "length", NativeField = true)]
        public abstract int Count { get; }
    }
}