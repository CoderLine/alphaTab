using System;
using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.XMLHttpRequest")]
    [NativeConstructors]
    public class XMLHttpRequest
    {
        public static readonly int UNSENT = 0;
        public static readonly int OPENED = 1;
        public static readonly int HEADERS_RECEIVED = 2;
        public static readonly int LOADING = 3;
        public static readonly int DONE = 4;

        [Name("onreadystatechange")] public Delegate OnReadyStateChange;
        [Name("readyState")] public extern int ReadyState { get; }
        [Name("withCredentials")] public extern bool WithCredentials { get; }
        [Name("upload")] public extern XMLHttpRequestUpload Upload { get; }
        [Name("responseURL")] public extern string ResponseURL { get; }
        [Name("status")] public extern int Status { get; }
        [Name("statusText")] public extern string StatusText { get; }
        [Name("responseType")] public extern XMLHttpRequestResponseType ResponseType { get; set; }
        [Name("response")] public extern dynamic Response { get; }
        [Name("responseText")] public extern string ResponseText { get; }
        //[Name("responseXML")] public extern HTMLDocument ResponseXML { get; }

        public extern XMLHttpRequest();
        public extern XMLHttpRequest(object d);
        public extern XMLHttpRequest(string s);

        [Name("open")]
        public extern void Open(string method, string url);
        [Name("open")]
        public extern void Open(string method, string url, bool async, string user = null, string password = null);

        [Name("setRequestHeader")]
        public extern void SetRequestHeader(string header, string value);

        [Name("Send")]
        public extern void Send();

        //[Name("Send")]
        //public extern void Send(ArrayBuffer data);

        //[Name("Send")]
        //public extern void Send(ArrayBufferView data);

        //[Name("Send")]
        //public extern void Send(Blob data);

        //[Name("Send")]
        //public extern void Send(HTMLDocument data);

        [Name("Send")]
        public extern void Send(string data);

        //[Name("Send")]
        //public extern void Send(FormData data);

        [Name("abort")]
        public extern void Abort();
	   
        [Name("getResponseHeader")]
        public extern string GetResponseHeader(string header);
        [Name("getAllResponseHeaders")]
        public extern string GetAllResponseHeaders();
        [Name("overrideMimeType")]
        public extern void OverrideMimeType(string mime);
    }
}
