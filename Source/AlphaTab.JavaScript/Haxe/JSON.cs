using Phase.Attributes;

namespace AlphaTab.Haxe
{
    [Name("haxe.Json")]
    [External]
    public class Json
    {
        [Name("parse")]
        public static extern dynamic Parse(string text);
        [Name("stringify")]
        public static extern string Stringify(object value);
    }
}
