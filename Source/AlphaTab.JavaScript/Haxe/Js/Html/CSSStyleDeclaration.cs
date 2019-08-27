using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.CSSStyleDeclaration")]
    public class CSSStyleDeclaration
    {
        [Name("opacity")]
        public extern HaxeString Opacity { get; set; }

        [Name("position")]
        public extern HaxeString Position { get; set; }

        [Name("left")]
        public extern HaxeString Left { get; set; }

        [Name("top")]
        public extern HaxeString Top { get; set; }

        [Name("fontSize")]
        public extern HaxeString FontSize { get; set; }

        [Name("fontStyle")]
        public extern HaxeString FontStyle { get; set; }

        [Name("fontWeight")]
        public extern HaxeString FontWeight { get; set; }

        [Name("fontFamily")]
        public extern HaxeString FontFamily { get; set; }

        [Name("width")]
        public HaxeString Width { get; set; }

        [Name("height")]
        public HaxeString Height { get; set; }

        [Name("overflow")]
        public HaxeString Overflow { get; set; }

        [Name("lineHeight")]
        public HaxeString LineHeight { get; set; }

        [Name("display")]
        public HaxeString Display { get; set; }

        [Name("textAlign")]
        public HaxeString TextAlign { get; set; }

        [Name("zIndex")]
        public HaxeString ZIndex { get; set; }

        [Name("transition")]
        public HaxeString Transition { get; set; }

        [Name("transitionDuration")]
        public HaxeString TransitionDuration { get; set; }

    }
}
