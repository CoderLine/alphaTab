using SharpKit.JavaScript;

namespace System.Xml
{
    [JsType(JsMode.Prototype, Export = false, Name = "NamedNodeMap", Native = true)]
    public abstract class XmlAttributeCollection 
    {
        public abstract XmlAttribute this[string name]
        {
            [JsMethod(InlineCodeExpression = "this.getNamedItem(name)")]
            get;
        }
    }
}