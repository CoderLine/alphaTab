using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.FontFaceSet")]
    public class FontFaceSet
    {
        [Name("load")]
        public extern Promise<HaxeArray<FontFace>> Load(HaxeString font);
        [Name("load")]
        public extern Promise<HaxeArray<FontFace>> Load(HaxeString font, HaxeString text);
        [Name("check")]
        public extern bool Check(HaxeString font);
    }
}