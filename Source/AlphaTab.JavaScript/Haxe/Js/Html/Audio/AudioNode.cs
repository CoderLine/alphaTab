using Haxe;
using Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html.Audio
{
    [External]
    [Name("js.html.audio.AudioNode")]
    [NativeConstructors]
    public class AudioNode : EventTarget
    {
        [Name("connect")]
        public extern void Connect(AudioNode destination);
        [Name("connect")]
        public extern void Connect(AudioNode destination, HaxeInt output, HaxeInt input);
        [Name("disconnect")]
        public extern void Disconnect(HaxeInt output);
    }
}