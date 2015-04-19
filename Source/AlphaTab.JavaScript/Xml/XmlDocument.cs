using SharpKit.JavaScript;

namespace System.Xml
{
    [JsType(JsMode.Prototype, Export = false, Name = "Document", Native = true)]
    public class XmlDocument
    {
        [JsProperty(Name = "documentElement", NativeField = true)]
        public XmlElement DocumentElement { get; set; }
    }
}