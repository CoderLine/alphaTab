using System;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js
{
    [NativeConstructors]
    [External]
    [Name("js.Error")]
    public class Error : Exception
    {
        [Name("stack")]
        public extern string Stack { get;}
    }
}
