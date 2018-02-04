using System;
using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js
{
    [NativeConstructors]
    [External]
    [Name("js.Error")]
    public class Error : Exception
    {
        [Name("stack")]
        public extern HaxeString Stack { get;}

        public extern Error();
        public extern Error(string message);
    }
}
