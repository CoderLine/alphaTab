using Haxe.Js.Html;

namespace AlphaTab.Importer
{
    public class FileLoadException : AlphaTabException
    {
        public XMLHttpRequest Xhr { get; set; }

        public FileLoadException(string message, XMLHttpRequest xhr)
            : base(message)
        {
            Xhr = xhr;
        }
    }
}
