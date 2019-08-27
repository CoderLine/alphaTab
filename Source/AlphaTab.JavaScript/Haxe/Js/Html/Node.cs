using Haxe;
using Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.Node")]
    public class Node : EventTarget
    {
        [Name("nodeName")]
        public extern HaxeString NodeName { get; }

        [Name("nodeValue")]
        public extern HaxeString NodeValue { get; }

        [Name("parentNode")]
        public Node ParentNode { get; set; }

        [Name("appendChild")]
        public extern void AppendChild(Node node);

        [Name("removeChild")]
        public extern void RemoveChild(Node node);

        [Name("childNodes")]
        public extern NodeList ChildNodes { get; }

        [Name("firstChild")]
        public extern Node FirstChild { get; set; }


        [Name("ownerDocument")]
        public extern HTMLDocument OwnerDocument { get; set; }

        [Name("replaceChild")]
        public extern void ReplaceChild(Node node, Node child);

        [Name("insertBefore")]
        public extern void InsertBefore(Node node, Node child);
    }
}
