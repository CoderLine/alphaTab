using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.Location")]
    public class Location
    {
        [Name("hash")]
        public extern HaxeString Hash { get; set; }
        [Name("host")]
        public extern HaxeString Host { get; set; }
        [Name("hostname")]
        public extern HaxeString Hostname { get; set; }
        [Name("href")]
        public extern HaxeString HRef { get; set; }
        [Name("origin")]
        public extern HaxeString Origin { get; }
        [Name("pathname")]
        public extern HaxeString PathName { get; set; }
        [Name("port")]
        public extern HaxeString Port { get; set; }
        [Name("protocol")]
        public extern HaxeString Protocol { get; set; }
        [Name("search")]
        public extern HaxeString Search { get; set; }
    }
}