using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [Name("js.html.Blob")]
    [External]
    [NativeConstructors]
    public class Blob
    {
        public extern Blob(object worker);
        public extern Blob(object worker, object properties);
    }
}
