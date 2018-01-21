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
        public extern Element QuerySelector(string selectors);
        [Name("querySelectorAll")]
        public extern NodeList QuerySelectorAll(string selectors);

        [Name("getElementById")]
        public extern Element GetElementById(string id);

        [Name("createElement")]
        public extern Element CreateElement(string localName);
        
        [Name("getElementsByTagName")]
        public extern HTMLCollection GetElementsByTagName(string localName);

        [Name("createEvent")]
        public extern Event CreateEvent(string interface_);
    }

    [External]
    [Name("js.html.HTMLCollection")]
    public class HTMLCollection
    {
        [Name("length")]
        public extern int Length { get; }

        [Name("item")]
        public extern Element Item(int index);

    }


    [External]
    [Name("js.html.FontFaceSet")]
    public class FontFaceSet
    {
        [Name("load")]
        public extern Promise<HaxeArray<FontFace>> Load(string font);
        [Name("load")]
        public extern Promise<HaxeArray<FontFace>> Load(string font, string text);
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
        public extern string Opacity { get; set; }
        [Name("position")]
        public extern string Position { get; set; }
        [Name("left")]
        public extern string Left { get; set; }
        [Name("top")]
        public extern string Top { get; set; }
        [Name("fontSize")]
        public extern string FontSize { get; set; }
        [Name("fontFamily")]
        public extern string FontFamily { get; set; }
        [Name("width")]
        public string Width { get; set; }
        [Name("height")]
        public string Height { get; set; }
        [Name("overflow")]
        public string Overflow { get; set; }
        [Name("lineHeight")]
        public string LineHeight { get; set; }
        [Name("display")]
        public string Display { get; set; }
    }

    [External]
    [Name("js.html.DOMTokenList")]
    public class DOMTokenList
    {
        [Name("add")]
        public extern void Add(string token);
        [Name("remove")]
        public extern void Remove(string token);
    }

    [External]
    [Name("js.html.Node")]
    public class Node : EventTarget
    {
        [Name("nodeName")]
        public extern string NodeName { get; }
        [Name("nodeValue")]
        public extern string NodeValue { get; }
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
        public string Id { get; set; }

        [Name("childElementCount")]
        public extern int ChildElementCount { get; }
        [Name("lastChild")]
        public extern Node LastChild { get; }
        [Name("style")]
        public extern CSSStyleDeclaration Style { get; }
        [Name("classList")]
        public extern DOMTokenList ClassList { get; }
        [Name("outerHTML")]
        public extern string OuterHTML { get; set; }
        [Name("innerHTML")]
        public extern string InnerHTML { get; set; }
        [Name("innerText")]
        public extern string InnerText { get; set; }
        [Name("setAttribute")]
        public extern void SetAttribute(string name, string value);
        [Name("offsetWidth")]
        public extern int OffsetWidth { get; }
        [Name("offsetHeight")]
        public extern int OffsetHeight { get; }
        [Name("className")]
        public extern string ClassName { get; set; }
        [Name("dataset")]
        public extern DOMStringMap Dataset { get; set; }
        [Name("attributes")]
        public extern NamedNodeMap Attributes { get; set; }
        [Name("clientWidth")]
        public extern int ClientWidth { get; set; }
        [Name("clientHeight")]
        public extern int ClientHeight { get; set; }


        [Name("querySelector")]
        public extern Element QuerySelector(string selectors);
        [Name("querySelectorAll")]
        public extern NodeList QuerySelectorAll(string selectors);

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
        public extern int Length { get; }
        [Name("getNamedItem")]
        public extern Attr GetNamedItem(string name);
        [Name("item")]
        public extern Attr Item(int index);
    }


    [External]
    [Name("js.html.Attr")]
    public class Attr : Node
    {
        [Name("name")]
        public extern string Name { get; }
        [Name("value")]
        public extern string Value { get; }
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
        public extern int Length { get; }
    }


    [External]
    [Name("js.html.NodeList")]
    public class NodeList 
    {
        [Name("length")]
        public extern int Length { get; }

        [Name("item")]
        public extern Node Item(int index);
    }

    [External]
    [Name("js.html.Element")]
    public class Element : DOMElement
    {
    }


    [External]
    [Name("js.html.ScriptElement")]
    public class ScriptElement : Element
    {
        [Name("src")]
        public extern string Src { get; set; }
    }

    [External]
    [Name("js.html.BodyElement")]
    public class BodyElement : Element
    {
    }

    [External]
    [Name("js.html.StyleElement")]
    public class StyleElement : Element
    {
        [Name("type")]
        public extern string Type { get; set; }
    }

    [External]
    [Name("js.html.HTMLDocument")]
    public class HTMLDocument : Document
    {
        [Name("write")]
        public extern void Write(string s);
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
        public extern int SetTimeout(Delegate handler, int timeout);

        [Name("getComputedStyle")]
        public extern CSSStyleDeclaration GetComputedStyle(Element elt);

        [Name("clearTimeout")]
        public extern void ClearTimeout(int timeoutId);

        [Name("setInterval")]
        public extern int SetInterval(Delegate handler, int interval);

        [Name("clearInterval")]
        public extern void ClearInterval(int intervalId);

        [Name("innerHeight")]
        public extern int InnerHeight { get; }

        [Name("innerWidth")]
        public extern int InnerWidth { get; }

        [Name("open")]
        public extern Window Open(string url, string target, string features);
        [Name("resizeTo")]
        public extern void ResizeTo(int x, int y);

        [Name("moveTo")]
        public extern void MoveTo(int x, int y);
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
        public extern int Top { get; }
        [Name("left")]
        public extern int Left { get; }
        [Name("width")]
        public extern int Width { get; }
        [Name("height")]
        public extern int Height { get; }

    }
    [External]
    [Name("js.html.Console")]
    public class Console
    {
        [Name("debug")]
        public extern void Debug(params object[] data);
        [Name("info")]
        public extern void Info(params object[] data);
        [Name("warn")]
        public extern void Warn(params object[] data);
        [Name("error")]
        public extern void Error(params object[] data);
    }
}
