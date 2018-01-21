using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [Name("js.html.CanvasElement")]
    [External]
    public class CanvasElement : Element
    {
        [Name("width")]
        public extern int Width { get; set; }
        [Name("height")]
        public extern int Height { get; set; }
        [Name("getContext")]
        public extern object GetContext(string contextId);
    }
}
