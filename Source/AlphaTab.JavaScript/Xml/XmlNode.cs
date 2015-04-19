using SharpKit.JavaScript;

namespace System.Xml
{
    [JsType(JsMode.Prototype, Export = false, Name = "Node", Native = true)]
    public abstract class XmlNode
    {
        [JsProperty(Name = "localName", NativeField = true)]
        public abstract string LocalName { get; }
        [JsProperty(Name = "firstChild", NativeField = true)]
        public abstract XmlNode FirstChild { get; }
        [JsProperty(Name = "childNodes", NativeField = true)]
        public abstract XmlNodeList ChildNodes { get;  }
        [JsMethod(Name = "getElementsByTagName")]
        public abstract XmlNodeList GetElementsByTagName(string name);
        [JsProperty(Name = "attributes", NativeField = true)]
        public abstract XmlAttributeCollection Attributes { get; }
        [JsProperty(Name = "nodeValue", NativeField = true)]
        public abstract string Value { get; }
        [JsProperty(Name = "nodeType", NativeField = true)]
        public abstract XmlNodeType NodeType { get; }
    }
}
