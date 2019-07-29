using System;
using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.XMLHttpRequestEventTarget")]
    public class XMLHttpRequestEventTarget : EventTarget
    {
        [Name("onloadstart")] public Delegate OnLoadStart;
        [Name("onprogress")] public Delegate OnProgress;
        [Name("onabort")] public Delegate OnAbort;
        [Name("onerror")] public Delegate OnError;
        [Name("onload")] public Delegate OnLoad;
        [Name("ontimeout")] public Delegate OnTimeout;
        [Name("onloadend")] public Delegate OnLoadEnd;
    }
}