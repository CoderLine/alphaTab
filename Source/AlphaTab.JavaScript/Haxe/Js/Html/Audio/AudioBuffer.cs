using Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html.Audio
{
    [External]
    [Name("js.html.audio.AudioBuffer")]
    [NativeConstructors]
    public class AudioBuffer
    {
        [Name("getChannelData")]
        public extern Float32Array GetChannelData(int channel);
    }
}
