using System;
using System.Collections;
using Haxe;
using Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.Document")]
    public class Document 
    {
        [Name("currentScript")]
        public extern Element CurrentScript { get; }

        [Name("fonts")]
        public extern FontFaceSet Fonts { get; }

        [Name("querySelector")]
        public extern Element QuerySelector(HaxeString selectors);
        [Name("querySelectorAll")]
        public extern NodeList QuerySelectorAll(HaxeString selectors);

        [Name("getElementById")]
        public extern Element GetElementById(HaxeString id);

        [Name("createElement")]
        public extern Element CreateElement(HaxeString localName);
        
        [Name("getElementsByTagName")]
        public extern HTMLCollection GetElementsByTagName(HaxeString localName);

        [Name("createEvent")]
        public extern Event CreateEvent(HaxeString interface_);
    }

    [External]
    [Name("js.html.HTMLCollection")]
    public class HTMLCollection
    {
        [Name("length")]
        public extern HaxeInt Length { get; }

        [Name("item")]
        public extern Element Item(HaxeInt index);

    }


    [External]
    [Name("js.html.FontFaceSet")]
    public class FontFaceSet
    {
        [Name("load")]
        public extern Promise<HaxeArray<FontFace>> Load(HaxeString font);
        [Name("load")]
        public extern Promise<HaxeArray<FontFace>> Load(HaxeString font, HaxeString text);
    }


    [External]
    [Name("js.html.FontFace")]
    public class FontFace
    {
    }

    [External]
    [Name("js.html.CSSStyleDeclaration")]
    public class CSSStyleDeclaration
    {
        [Name("opacity")]
        public extern HaxeString Opacity { get; set; }
        [Name("position")]
        public extern HaxeString Position { get; set; }
        [Name("left")]
        public extern HaxeString Left { get; set; }
        [Name("top")]
        public extern HaxeString Top { get; set; }
        [Name("fontSize")]
        public extern HaxeString FontSize { get; set; }
        [Name("fontFamily")]
        public extern HaxeString FontFamily { get; set; }
        [Name("width")]
        public HaxeString Width { get; set; }
        [Name("height")]
        public HaxeString Height { get; set; }
        [Name("overflow")]
        public HaxeString Overflow { get; set; }
        [Name("lineHeight")]
        public HaxeString LineHeight { get; set; }
        [Name("display")]
        public HaxeString Display { get; set; }
    }

    [External]
    [Name("js.html.DOMTokenList")]
    public class DOMTokenList
    {
        [Name("add")]
        public extern void Add(HaxeString token);
        [Name("remove")]
        public extern void Remove(HaxeString token);
    }

    [External]
    [Name("js.html.Node")]
    public class Node : EventTarget
    {
        [Name("nodeName")]
        public extern HaxeString NodeName { get; }
        [Name("nodeValue")]
        public extern HaxeString NodeValue { get; }
        [Name("appendChild")]
        public extern void AppendChild(Node node);
        [Name("removeChild")]
        public extern void RemoveChild(Node node);
        [Name("childNodes")]
        public extern NodeList ChildNodes { get; }

        [Name("ownerDocument")]
        public HTMLDocument OwnerDocument { get; set; }

        [Name("replaceChild")]
        public extern void ReplaceChild(Node node, Node child);
    }


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


        [Name("querySelector")]
        public extern Element QuerySelector(HaxeString selectors);
        [Name("querySelectorAll")]
        public extern NodeList QuerySelectorAll(HaxeString selectors);

        [Name("getClientRects")]
        public extern DOMRectList GetClientRects();
        [Name("getBoundingClientRect")]
        public extern DOMRect GetBoundingClientRect();


    }


    [External]
    [Name("js.html.NamedNodeMap")]
    public class NamedNodeMap
    {
        [Name("length")]
        public extern HaxeInt Length { get; }
        [Name("getNamedItem")]
        public extern Attr GetNamedItem(HaxeString name);
        [Name("item")]
        public extern Attr Item(HaxeInt index);
    }


    [External]
    [Name("js.html.Attr")]
    public class Attr : Node
    {
        [Name("name")]
        public extern HaxeString Name { get; }
        [Name("value")]
        public extern HaxeString Value { get; }
    }


    [External]
    [Name("js.html.DOMStringMap")]
    public class DOMStringMap
    {
    }


    [External]
    [Name("js.html.DOMRectReadOnly")]
    public class DOMRectReadOnly
    {
        [Name("top")]
        public extern HaxeFloat Top { get; }
        [Name("left")]
        public extern HaxeFloat Left { get; }
        [Name("right")]
        public extern HaxeFloat Right { get; }
        [Name("bottom")]
        public extern HaxeFloat Bottom { get; }
        [Name("x")]
        public extern HaxeFloat X { get; }
        [Name("y")]
        public extern HaxeFloat Y { get; }
        [Name("width")]
        public extern HaxeFloat Width { get; }
        [Name("height")]
        public extern HaxeFloat Height { get; }
    }

    [External]
    [Name("js.html.DOMRect")]
    public class DOMRect : DOMRectReadOnly
    {
    }


    [External]
    [Name("js.html.DOMRectList")]
    public class DOMRectList 
    {
        [Name("length")]
        public extern HaxeInt Length { get; }
    }


    [External]
    [Name("js.html.NodeList")]
    public class NodeList 
    {
        [Name("length")]
        public extern HaxeInt Length { get; }

        [Name("item")]
        public extern Node Item(HaxeInt index);
    }

    [External]
    [Name("js.html.Element")]
    [CastMode(CastMode.UnsafeCast)]
    public class Element : DOMElement
    {
    }


    [External]
    [Name("js.html.ScriptElement")]
    [CastMode(CastMode.UnsafeCast)]
    public class ScriptElement : Element
    {
        [Name("src")]
        public extern HaxeString Src { get; set; }
    }

    [External]
    [Name("js.html.BodyElement")]
    [CastMode(CastMode.UnsafeCast)]
    public class BodyElement : Element
    {
    }

    [External]
    [Name("js.html.StyleElement")]
    [CastMode(CastMode.UnsafeCast)]
    public class StyleElement : Element
    {
        [Name("type")]
        public extern HaxeString Type { get; set; }
    }

    [External]
    [Name("js.html.HTMLDocument")]
    public class HTMLDocument : Document
    {
        [Name("write")]
        public extern void Write(HaxeString s);
        [Name("body")]
        public extern BodyElement Body { get; set; }
        [Name("documentElement")]
        public extern Element DocumentElement { get; set; }
    }

    [External]
    [Name("js.html.Window")]
    public class Window : EventTarget
    {
        [Name("document")]
        public extern HTMLDocument Document { get; }
        [Name("screen")]
        public extern Screen Screen { get; }

        [Name("setTimeout")]
        public extern HaxeInt SetTimeout(Delegate handler, HaxeInt timeout);

        [Name("getComputedStyle")]
        public extern CSSStyleDeclaration GetComputedStyle(Element elt);

        [Name("clearTimeout")]
        public extern void ClearTimeout(HaxeInt timeoutId);

        [Name("setInterval")]
        public extern HaxeInt SetInterval(Delegate handler, HaxeInt interval);

        [Name("clearInterval")]
        public extern void ClearInterval(HaxeInt intervalId);

        [Name("innerHeight")]
        public extern HaxeInt InnerHeight { get; }

        [Name("innerWidth")]
        public extern HaxeInt InnerWidth { get; }

        [Name("open")]
        public extern Window Open(HaxeString url, HaxeString target, HaxeString features);
        [Name("resizeTo")]
        public extern void ResizeTo(HaxeInt x, HaxeInt y);

        [Name("moveTo")]
        public extern void MoveTo(HaxeInt x, HaxeInt y);
        [Name("focus")]
        public extern void Focus();

        [Name("print")]
        public extern void Print();
    }

    [External]
    [Name("js.html.Screen")]
    public class Screen
    {
        [Name("top")]
        public extern HaxeInt Top { get; }
        [Name("left")]
        public extern HaxeInt Left { get; }
        [Name("width")]
        public extern HaxeInt Width { get; }
        [Name("height")]
        public extern HaxeInt Height { get; }

    }
    [External]
    [Name("js.html.Console")]
    public class Console
    {
        [Name("debug")]
        [RawParams]
        public extern void Debug(params object[] data);
        [Name("info")]
        [RawParams]
        public extern void Info(params object[] data);
        [Name("warn")]
        [RawParams]
        public extern void Warn(params object[] data);
        [Name("error")]
        [RawParams]
        public extern void Error(params object[] data);
    }
}
