using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.Console")]
    public class Console
    {
        [Name("debug")]
        [RawParams]
        public extern void Debug(params object[] data);
        [Name("info")]
        [RawParams]
        public extern void Info(params object[] data);
        [Name("warn")]
        [RawParams]
        public extern void Warn(params object[] data);
        [Name("error")]
        [RawParams]
        public extern void Error(params object[] data);
    }
}