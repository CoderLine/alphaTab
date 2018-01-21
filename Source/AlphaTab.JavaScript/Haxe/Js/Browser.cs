using AlphaTab.Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js
{
    [Name("js.Browser")]
    [External]
    public class Browser
    {
        [Name("document")]
        public static extern HTMLDocument Document { get; }
        [Name("window")]
        public static extern Window Window { get; }
        [Name("console")]
        public static extern Console Console { get;  }
    }
}
