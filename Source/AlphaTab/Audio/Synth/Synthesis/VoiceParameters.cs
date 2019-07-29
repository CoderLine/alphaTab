using AlphaTab.Audio.Synth.Bank.Components;
using AlphaTab.Audio.Synth.Bank.Components.Generators;
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Audio.Synth.Util;
using AlphaTab.Utils;

namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class VoiceParameters
    {
        private float _mix1;
        private float _mix2;

        public int Channel { get; set; }
        public int Note { get; set; }
        public int Velocity { get; set; }
        public bool NoteOffPending { get; set; }
        public VoiceStateEnum State { get; set; }
        public int PitchOffset { get; set; }
        public float VolOffset { get; set; }
        public SampleArray BlockBuffer { get; set; }

        public UnionData[] PData { get; set; }
        public SynthParameters SynthParams { get; set; }
        public GeneratorParameters[] GeneratorParams { get; set; }
        public Envelope[] Envelopes { get; set; }
        public Filter[] Filters { get; set; }
        public Lfo[] Lfos { get; set; }

        public float CombinedVolume => _mix1 + _mix2;

        public VoiceParameters()
        {
            BlockBuffer = new SampleArray(SynthConstants.DefaultBlockSize);
            //create default number of each component
            PData = new UnionData[SynthConstants.MaxVoiceComponents];
            GeneratorParams = new GeneratorParameters[SynthConstants.MaxVoiceComponents];
            Envelopes = new Envelope[SynthConstants.MaxVoiceComponents];
            Filters = new Filter[SynthConstants.MaxVoiceComponents];
            Lfos = new Lfo[SynthConstants.MaxVoiceComponents];
            //initialize each component
            for (var x = 0; x < SynthConstants.MaxVoiceComponents; x++)
            {
                GeneratorParams[x] = new GeneratorParameters();
                Envelopes[x] = new Envelope();
                Filters[x] = new Filter();
                Lfos[x] = new Lfo();
            }
        }

        public void Reset()
        {
            NoteOffPending = false;
            PitchOffset = 0;
            VolOffset = 0;
            for (var i = 0; i < PData.Length; i++)
            {
                PData[i] = new UnionData();
            }

            _mix1 = 0;
            _mix2 = 0;
        }

        public void MixMonoToMonoInterp(int startIndex, float volume)
        {
            var inc = (volume - _mix1) / SynthConstants.DefaultBlockSize;
            for (var i = 0; i < BlockBuffer.Length; i++)
            {
                _mix1 += inc;
                SynthParams.Synth.SampleBuffer[startIndex + i] += BlockBuffer[i] * _mix1;
            }

            _mix1 = volume;
        }

        public void MixMonoToStereoInterp(int startIndex, float leftVol, float rightVol)
        {
            var incL = (leftVol - _mix1) / SynthConstants.DefaultBlockSize;
            var incR = (rightVol - _mix2) / SynthConstants.DefaultBlockSize;
            for (var i = 0; i < BlockBuffer.Length; i++)
            {
                _mix1 += incL;
                _mix2 += incR;
                SynthParams.Synth.SampleBuffer[startIndex] += BlockBuffer[i] * _mix1;
                SynthParams.Synth.SampleBuffer[startIndex + 1] += BlockBuffer[i] * _mix2;
                startIndex += 2;
            }

            _mix1 = leftVol;
            _mix2 = rightVol;
        }

        public void MixStereoToStereoInterp(int startIndex, float leftVol, float rightVol)
        {
            var incL = (leftVol - _mix1) / SynthConstants.DefaultBlockSize;
            var incR = (rightVol - _mix2) / SynthConstants.DefaultBlockSize;
            for (var i = 0; i < BlockBuffer.Length; i++)
            {
                _mix1 += incL;
                _mix2 += incR;
                SynthParams.Synth.SampleBuffer[startIndex + i] += BlockBuffer[i] * _mix1;
                i++;
                SynthParams.Synth.SampleBuffer[startIndex + i] += BlockBuffer[i] * _mix2;
            }

            _mix1 = leftVol;
            _mix2 = rightVol;
        }
    }
}
