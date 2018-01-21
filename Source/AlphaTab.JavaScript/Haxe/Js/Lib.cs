using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js
{
    [Name("js.Lib")]
    [External]
    public class Lib
    {
        [Name("global")]
        public static extern dynamic Global { get; }
    }
}
