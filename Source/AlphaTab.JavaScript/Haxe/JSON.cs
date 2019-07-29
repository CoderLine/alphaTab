using System;
using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe
{
    [Name("haxe.Json")]
    [External]
    public class Json
    {
        [Name("parse")]
        public static extern dynamic Parse(HaxeString text);

        [Name("stringify")]
        public static extern HaxeString Stringify(object value);

        [Name("stringify")]
        public static extern HaxeString Stringify(object value, Func<dynamic, dynamic, dynamic> replacer);
    }
}
