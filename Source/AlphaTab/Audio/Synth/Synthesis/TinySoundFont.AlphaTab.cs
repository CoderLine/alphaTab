using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Audio.Synth.Midi.Event;
using AlphaTab.Audio.Synth.Util;
using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Util;

namespace AlphaTab.Audio.Synth.Synthesis
{
    internal partial class TinySoundFont
    {
        public const int MicroBufferCount = 3;
        public const int MicroBufferSize = 448;

        private readonly LinkedList<SynthEvent> _midiEventQueue = new LinkedList<SynthEvent>();
        private readonly int[] _midiEventCounts = new int[MicroBufferCount];
        private FastDictionary<int, bool> _mutedChannels;
        private FastDictionary<int, bool> _soloChannels;
        private bool _isAnySolo;
        private float[] _sampleBuffer = new float[MicroBufferSize * MicroBufferCount * SynthConstants.AudioChannels];

        public float[] SampleBuffer => _sampleBuffer;

        public void Synthesize()
        {
            _sampleBuffer = new float[_sampleBuffer.Length];
            FillWorkingBuffer(false);
        }

        public void SynthesizeSilent()
        {
            _sampleBuffer = new float[_sampleBuffer.Length];
            FillWorkingBuffer(true);
        }

        public float ChannelGetMixVolume(int channel)
        {
            return (_channels != null && channel < _channels.ChannelList.Count
                ? _channels.ChannelList[channel].MixVolume
                : 1.0f);
        }

        public void ChannelSetMixVolume(int channel, float volume)
        {
            var c = ChannelInit(channel);
            foreach (var v in _voices)
            {
                if (v.PlayingChannel == channel && v.PlayingPreset != -1)
                {
                    v.MixVolume = volume;
                }
            }

            c.MixVolume = volume;
        }

        public void ChannelSetMute(int channel, bool mute)
        {
            if (mute)
            {
                _mutedChannels[channel] = true;
            }
            else
            {
                _mutedChannels.Remove(channel);
            }
        }

        public void ChannelSetSolo(int channel, bool solo)
        {
            if (solo)
            {
                _soloChannels[channel] = true;
            }
            else
            {
                _soloChannels.Remove(channel);
            }

            _isAnySolo = _soloChannels.Count > 0;
        }

        public void ResetChannelStates()
        {
            _mutedChannels = new FastDictionary<int, bool>();
            _soloChannels = new FastDictionary<int, bool>();
            _isAnySolo = false;
        }

        public void DispatchEvent(int i, SynthEvent synthEvent)
        {
            _midiEventQueue.AddFirst(synthEvent);
            _midiEventCounts[i]++;
        }

        private void FillWorkingBuffer(bool silent)
        {
            /*Break the process loop into sections representing the smallest timeframe before the midi controls need to be updated
            the bigger the timeframe the more efficent the process is, but playback quality will be reduced.*/
            var sampleIndex = 0;
            var anySolo = _isAnySolo;
            for (var x = 0; x < MicroBufferCount; x++)
            {
                if (_midiEventQueue.Length > 0)
                {
                    for (var i = 0; i < _midiEventCounts[x]; i++)
                    {
                        var m = _midiEventQueue.RemoveLast();
                        if (m.IsMetronome)
                        {
                            NoteOff(SynthConstants.MetronomeChannel, 37);
                            NoteOn(SynthConstants.MetronomeChannel, 37, 95);
                        }
                        else
                        {
                            ProcessMidiMessage(m.Event);
                        }
                    }
                }

                //voice processing loop
                var sampleCount = MicroBufferSize * SynthConstants.AudioChannels;
                foreach (var voice in _voices)
                {
                    if (voice.PlayingPreset != -1)
                    {
                        var channel = voice.PlayingChannel;
                        // channel is muted if it is either explicitley muted, or another channel is set to solo but not this one.
                        var isChannelMuted = _mutedChannels.ContainsKey(channel) ||
                                             anySolo && !_soloChannels.ContainsKey(channel);

                        if (silent)
                        {
                            voice.Kill();
                        }
                        else
                        {
                            voice.Render(this, _sampleBuffer, sampleIndex, sampleCount, isChannelMuted);
                        }
                    }
                }

                sampleIndex += sampleCount;
            }

            Platform.Platform.ClearIntArray(_midiEventCounts);
        }

        private void ProcessMidiMessage(MidiEvent e)
        {
            Logger.Debug("Midi", "Processing midi " + e.Command);
            var command = e.Command;
            var channel = e.Channel;
            var data1 = e.Data1;
            var data2 = e.Data2;
            switch (command)
            {
                case MidiEventType.NoteOff:
                    ChannelNoteOff(channel, data1);
                    break;
                case MidiEventType.NoteOn:
                    if (data2 == 0)
                    {
                        ChannelNoteOff(channel, data1);
                    }
                    else
                    {
                        ChannelNoteOn(channel, data1, data2);
                    }
                    break;
                case MidiEventType.NoteAftertouch:
                    break;
                case MidiEventType.Controller:
                    ChannelMidiControl(channel, data1, data2);
                    break;
                case MidiEventType.ProgramChange:
                    ChannelSetPresetNumber(channel, data1, channel == 9);
                    break;
                case MidiEventType.ChannelAftertouch:
                    break;
                case MidiEventType.PitchBend:
                    ChannelSetPitchWheel(channel, (short)(data1 | (data2 << 8)));
                    break;
            }
        }
    }
}
