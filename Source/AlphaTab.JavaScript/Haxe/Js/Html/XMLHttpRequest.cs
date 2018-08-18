/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using System;
using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.XMLHttpRequest")]
    [NativeConstructors]
    public class XMLHttpRequest : XMLHttpRequestEventTarget
    {
        public static readonly HaxeInt UNSENT;
        public static readonly HaxeInt OPENED;
        public static readonly HaxeInt HEADERS_RECEIVED;
        public static readonly HaxeInt LOADING;
        public static readonly HaxeInt DONE;

        [Name("onreadystatechange")] public Delegate OnReadyStateChange;
        [Name("readyState")] public extern HaxeInt ReadyState { get; }
        [Name("withCredentials")] public extern HaxeBool WithCredentials { get; }
        [Name("upload")] public extern XMLHttpRequestUpload Upload { get; }
        [Name("responseURL")] public extern HaxeString ResponseURL { get; }
        [Name("status")] public extern HaxeInt Status { get; }
        [Name("statusText")] public extern HaxeString StatusText { get; }
        [Name("responseType")] public extern XMLHttpRequestResponseType ResponseType { get; set; }
        [Name("response")] public extern dynamic Response { get; }
        [Name("responseText")] public extern HaxeString ResponseText { get; }
        //[Name("responseXML")] public extern HTMLDocument ResponseXML { get; }

        public extern XMLHttpRequest();
        public extern XMLHttpRequest(object d);
        public extern XMLHttpRequest(HaxeString s);

        [Name("open")]
        public extern void Open(HaxeString method, HaxeString url);
        [Name("open")]
        public extern void Open(HaxeString method, HaxeString url, HaxeBool async, HaxeString user = null, HaxeString password = null);

        [Name("setRequestHeader")]
        public extern void SetRequestHeader(HaxeString header, HaxeString value);

        [Name("send")]
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
        public extern void Send(HaxeString data);

        //[Name("Send")]
        //public extern void Send(FormData data);

        [Name("abort")]
        public extern void Abort();
	   
        [Name("getResponseHeader")]
        public extern HaxeString GetResponseHeader(HaxeString header);
        [Name("getAllResponseHeaders")]
        public extern HaxeString GetAllResponseHeaders();
        [Name("overrideMimeType")]
        public extern void OverrideMimeType(HaxeString mime);
    }
}
