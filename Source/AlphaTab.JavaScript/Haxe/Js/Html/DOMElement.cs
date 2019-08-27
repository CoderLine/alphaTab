using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.DOMElement")]
    public class DOMElement : Node
    {
        [Name("id")]
        public HaxeString Id { get; set; }

        [Name("childElementCount")]
        public extern HaxeInt ChildElementCount { get; }

        [Name("lastChild")]
        public extern Node LastChild { get; }

        [Name("style")]
        public extern CSSStyleDeclaration Style { get; }

        [Name("classList")]
        public extern DOMTokenList ClassList { get; }

        [Name("outerHTML")]
        public extern HaxeString OuterHTML { get; set; }

        [Name("innerHTML")]
        public extern HaxeString InnerHTML { get; set; }

        [Name("innerText")]
        public extern HaxeString InnerText { get; set; }

        [Name("setAttribute")]
        public extern void SetAttribute(HaxeString name, HaxeString value);

        [Name("offsetWidth")]
        public extern HaxeInt OffsetWidth { get; }

        [Name("offsetHeight")]
        public extern HaxeInt OffsetHeight { get; }

        [Name("className")]
        public extern HaxeString ClassName { get; set; }

        [Name("dataset")]
        public extern DOMStringMap Dataset { get; set; }

        [Name("attributes")]
        public extern NamedNodeMap Attributes { get; set; }

        [Name("clientWidth")]
        public extern HaxeInt ClientWidth { get; set; }

        [Name("clientHeight")]
        public extern HaxeInt ClientHeight { get; set; }

        [Name("clientTop")]
        public extern HaxeInt ClientTop { get; set; }

        [Name("clientLeft")]
        public extern HaxeInt ClientLeft { get; set; }

        [Name("scrollTop")]
        public HaxeInt ScrollTop { get; set; }

        [Name("scrollLeft")]
        public HaxeInt ScrollLeft { get; set; }

        [Name("querySelector")]
        public extern Element QuerySelector(HaxeString selectors);

        [Name("querySelectorAll")]
        public extern NodeList QuerySelectorAll(HaxeString selectors);

        [Name("getElementsByClassName")]
        public extern HTMLCollection GetElementsByClassName(HaxeString className);

        [Name("getClientRects")]
        public extern DOMRectList GetClientRects();

        [Name("getBoundingClientRect")]
        public extern DOMRect GetBoundingClientRect();

        [Name("click")]
        public extern void Click();
    }
}
