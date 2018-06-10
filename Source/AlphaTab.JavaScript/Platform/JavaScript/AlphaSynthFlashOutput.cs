using System;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Collections;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using Haxe.Js.Html;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Platform.JavaScript
{
    // NOTE: we prefix all ISynthOutput methods with "AlphaSynth" to ensure
    // the ExternalInterface callbacks are called (play, stop etc. might control. the main movie)
    interface IFlashSynthOutput
    {
        void AlphaSynthSequencerFinished();
        void AlphaSynthPlay();
        void AlphaSynthPause();
        void AlphaSynthResetSamples();
        void AlphaSynthAddSamples(string base64Samples);
    }

    class AlphaSynthFlashOutput : ISynthOutput
    {
        public const int PreferredSampleRate = 44100;

        private readonly string _alphaSynthRoot;
        private const string Id = "alphaSynthFlashPlayer";
        private static readonly FastDictionary<string, AlphaSynthFlashOutput> Lookup;

        static AlphaSynthFlashOutput()
        {
            Lookup = new FastDictionary<string, AlphaSynthFlashOutput>();
        }

        private static int NextId;

        private string _id;
        private string _swfId;
        private Element _swfContainer;

        public int SampleRate
        {
            get { return PreferredSampleRate; }
        }

        public AlphaSynthFlashOutput(string alphaSynthRoot)
        {
            _alphaSynthRoot = alphaSynthRoot;

            var lastSlash = _alphaSynthRoot.LastIndexOf("/");
            if (lastSlash != -1)
            {
                _alphaSynthRoot = _alphaSynthRoot.Substring(0, lastSlash + 1);
            }
        }

        public void Open()
        {
            _id = Id + NextId;
            _swfId = _id + "swf";
            Lookup[_id] = this;
            NextId++;

            var document = Browser.Document;
            _swfContainer = document.CreateElement("div");
            _swfContainer.ClassName = Id;
            _swfContainer.SetAttribute("id", _id);
            document.Body.AppendChild(_swfContainer);

            var swf = Lib.Global.swfobject;
            Action<string, string, string, string, string, string, object, object, object> embedSwf = swf.embedSWF;
            embedSwf(
                _alphaSynthRoot + "AlphaSynth.FlashOutput.swf",
                _id, "1px", "1px", "9.0.0",
                null,
                new { id = _id, sampleRate = PreferredSampleRate }, new { allowScriptAccess = "always" }, new { id = _swfId }
            );
        }

        private IFlashSynthOutput FlashOutput
        {
            [Inline]
            get
            {
                var element = Browser.Document.GetElementById(_swfId);
                return Script.Write<IFlashSynthOutput>("untyped __js__(\"{0}\", element)");
            }
        }

        public void Play()
        {
            FlashOutput.AlphaSynthPlay();
        }

        public void Pause()
        {
            FlashOutput.AlphaSynthPause();
        }

        public void SequencerFinished()
        {
            FlashOutput.AlphaSynthSequencerFinished();
        }

        public void AddSamples(SampleArray samples)
        {
            var uint8 = new Uint8Array(samples.ToFloat32Array().Buffer);
            var b64 = Script.Write<string>("untyped __js__(\"window.btoa(String.fromCharCode.apply(null, {0}))\", uint8)");
            FlashOutput.AlphaSynthAddSamples(b64);
        }


        public void ResetSamples()
        {
            FlashOutput.AlphaSynthResetSamples();
        }

        public event Action Ready;
        public static void OnReady(string id)
        {
            if (Lookup.ContainsKey(id))
            {
                Lookup[id].Ready();
            }
        }

        public event Action SampleRequest;
        public static void OnSampleRequest(string id)
        {
            if (Lookup.ContainsKey(id))
            {
                Lookup[id].SampleRequest();
            }
        }

        public event Action Finished;
        public static void OnFinished(string id)
        {
            if (Lookup.ContainsKey(id) && Lookup[id].Finished != null)
            {
                Lookup[id].Finished();
            }
        }

        public event Action<int> SamplesPlayed;
        public static void OnSamplesPlayed(string id, int samples)
        {
            if (Lookup.ContainsKey(id))
            {
                Lookup[id].SamplesPlayed(samples);
            }
        }
    }
}
