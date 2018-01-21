using Phase.Attributes;

namespace Haxe.Js.Html
{
    [External]
    [Name("js.html.XMLHttpRequestResponseType")]
    public class XMLHttpRequestResponseType
    {
        public static readonly XMLHttpRequestResponseType NON;
        public static readonly XMLHttpRequestResponseType ARRAYBUFFER;
        public static readonly XMLHttpRequestResponseType BLOB;
        public static readonly XMLHttpRequestResponseType DOCUMENT;
        public static readonly XMLHttpRequestResponseType JSON;
        public static readonly XMLHttpRequestResponseType TEXT;

        private extern XMLHttpRequestResponseType();
    }
}