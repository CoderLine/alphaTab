using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.DOMPoint")]
    [NativeConstructors]
    public class DOMPoint : DOMPointReadonly
    {
        public extern DOMPoint(float x, float y, float z = 0, float w = 1);
    }
}
