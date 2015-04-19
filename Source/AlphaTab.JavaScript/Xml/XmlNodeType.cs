using SharpKit.JavaScript;

namespace System.Xml
{
    [JsType(JsMode.Prototype, Export = false, Name = "Node", Native = true)]
    public abstract class XmlNodeType
    {
        [JsField(Name="DOCUMENT_NODE")]
        public static readonly XmlNodeType Document;
        [JsField(Name = "ELEMENT_NODE")]
        public static readonly XmlNodeType Element;
    }
}