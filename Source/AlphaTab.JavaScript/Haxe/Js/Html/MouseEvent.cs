using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.MouseEvent")]
    public class MouseEvent: UIEvent
    {
        [Name("button")]
        public extern int Button { get; set; }

        public extern MouseEvent(HaxeString type, dynamic eventInitDict);
    }
}