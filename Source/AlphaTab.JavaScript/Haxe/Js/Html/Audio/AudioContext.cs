using Haxe;
using Haxe.Js.Html;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html.Audio
{
    [External]
    [Name("js.html.audio.AudioContext")]
    [NativeConstructors]
    public class AudioContext : EventTarget
    {
        [Name("sampleRate")]
        public extern HaxeFloat SampleRate { get; set; }

        [Name("destination")]
        public AudioNode Destination { get; }

        [Name("createBuffer")]
        public extern AudioBuffer CreateBuffer(HaxeInt numberOfChannels, HaxeInt length, HaxeFloat sampleRate);

        [Name("createScriptProcessor")]
        public extern ScriptProcessorNode CreateScriptProcessor(HaxeInt bufferSize, HaxeInt numberOfInputChannels,
            HaxeInt numberOfOutputChannels);

        [Name("createBufferSource")]
        public extern AudioBufferSourceNode CreateBufferSource();
    }
}