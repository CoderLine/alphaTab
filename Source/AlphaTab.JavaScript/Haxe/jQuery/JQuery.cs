using AlphaTab.Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.jQuery
{
    [Name("js.jquery.JQuery")]
    [NativeConstructors]
    [External]
    public class JQuery
    {
        public extern JQuery();
        public extern JQuery(Element element);
        public extern JQuery(JQuery selection);
        public extern JQuery(object obj);
        public extern JQuery(string html, object attributes);
        public extern JQuery(string html, Document ownerDocument);
        public extern JQuery(string selector);

        [Name("context")]
        public extern Element Context { get; }

        [Name("length")]
        public extern int Length { get; }

        [Name("data")]
        public extern object Data(string key);

        [Name("data")]
        public extern object Data(string key, object value);

        [Name("removeData")]
        public extern void RemoveData(string key);

        [Name("empty")]
        public extern JQuery Empty();

        [NativeIndexer]
        public extern Element this[int index]
        {
            get;
            set;
        }
    }
}
