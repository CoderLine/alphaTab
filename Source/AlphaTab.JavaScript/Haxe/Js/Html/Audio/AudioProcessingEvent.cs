using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html.Audio
{
    [External]
    [Name("js.html.audio.AudioProcessingEvent")]
    [NativeConstructors]
    public class AudioProcessingEvent : Event
    {
        private extern AudioProcessingEvent(HaxeString type, dynamic eventInitDict);

        [Name("inputBuffer")]
        public AudioBuffer InputBuffer { get; }

        [Name("outputBuffer")]
        public AudioBuffer OutputBuffer { get; }

        [Name("playbackTime")]
        public float PlaybackTime { get; }
    }
}