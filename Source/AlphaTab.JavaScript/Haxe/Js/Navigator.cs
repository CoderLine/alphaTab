using System;
using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js
{
    [Name("js.html.Navigator")]
    [External]
    public class Navigator
    {
        [Name("userAgent")]
        public extern HaxeString UserAgent { get; }
    }
}
