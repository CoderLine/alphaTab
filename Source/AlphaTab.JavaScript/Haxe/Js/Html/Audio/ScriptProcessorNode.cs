using System;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html.Audio
{
    [External]
    [Name("js.html.audio.ScriptProcessorNode")]
    [NativeConstructors]
    public class ScriptProcessorNode : AudioNode
    {
        [Name("onaudioprocess")]
        public extern Delegate OnAudioProcess { get; set; }
    }
}
