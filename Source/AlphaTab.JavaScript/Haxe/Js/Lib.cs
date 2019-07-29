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
