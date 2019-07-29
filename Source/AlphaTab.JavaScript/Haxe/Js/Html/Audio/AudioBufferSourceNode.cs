using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html.Audio
{
    [External]
    [Name("js.html.audio.AudioBufferSourceNode")]
    [NativeConstructors]
    public class AudioBufferSourceNode : AudioNode
    {
        [Name("buffer")]
        public AudioBuffer Buffer { get; set; }

        [Name("loop")]
        public HaxeBool Loop { get; set; }

        [Name("start")]
        public extern void Start(HaxeFloat when);

        [Name("stop")]
        public extern void Stop(HaxeFloat when);
    }
}
