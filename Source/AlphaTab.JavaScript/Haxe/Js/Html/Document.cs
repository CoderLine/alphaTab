using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.Document")]
    public class Document : Node
    {
        [Name("currentScript")]
        public extern Element CurrentScript { get; }

        [Name("fonts")]
        public extern FontFaceSet Fonts { get; }

        [Name("querySelector")]
        public extern Element QuerySelector(HaxeString selectors);
        [Name("querySelectorAll")]
        public extern NodeList QuerySelectorAll(HaxeString selectors);

        [Name("getElementById")]
        public extern Element GetElementById(HaxeString id);

        [Name("createElement")]
        public extern Element CreateElement(HaxeString localName);
        
        [Name("getElementsByTagName")]
        public extern HTMLCollection GetElementsByTagName(HaxeString localName);

        [Name("createEvent")]
        public extern Event CreateEvent(HaxeString interface_);

        [Name("defaultView")]
        public Window DefaultView { get; set; }
    }
}