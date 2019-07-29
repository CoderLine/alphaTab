using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [Name("js.html.CanvasElement")]
    [External]
    public class CanvasElement : Element
    {
        [Name("width")]
        public extern HaxeInt Width { get; set; }
        [Name("height")]
        public extern HaxeInt Height { get; set; }
        [Name("getContext")]
        public extern object GetContext(HaxeString contextId);
    }
}
