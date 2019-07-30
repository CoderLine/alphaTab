using System;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Audio.Synth.Midi.Event;
using AlphaTab.Collections;
using AlphaTab.Util;
using AlphaTab.Audio.Synth.Synthesis;

namespace AlphaTab.Audio.Synth
{
    /// <summary>
    /// This sequencer dispatches midi events to the synthesizer based on the current
    /// synthesize position. The sequencer does not consider the playback speed.
    /// </summary>
    internal class MidiFileSequencer
    {
        private readonly TinySoundFont _synthesizer;

        private FastList<MidiFileSequencerTempoChange> _tempoChanges;
        private readonly FastDictionary<int, SynthEvent> _firstProgramEventPerChannel;
        private FastList<SynthEvent> _synthData;
        private int _division;
        private int _eventIndex;

        /// <remarks>
        /// Note that this is not the actual playback position. It's the position where we are currently synthesizing at.
        /// Depending on the buffer size of the output, this position is after the actual playback.
        /// </remarks>
        private double _currentTime;


        private PlaybackRange _playbackRange;
        private double _playbackRangeStartTime;
        private double _playbackRangeEndTime;
        private double _endTime;

        public PlaybackRange PlaybackRange
        {
            get => _playbackRange;
            set
            {
                _playbackRange = value;
                if (value != null)
                {
                    _playbackRangeStartTime = TickPositionToTimePositionWithSpeed(value.StartTick, 1);
                    _playbackRangeEndTime = TickPositionToTimePositionWithSpeed(value.EndTick, 1);
                }
            }
        }

        public bool IsLooping { get; set; }

        /// <summary>
        /// Gets the duration of the song in ticks.
        /// </summary>
        public int EndTick { get; private set; }

        /// <summary>
        /// Gets the duration of the song in milliseconds.
        /// </summary>
        public double EndTime => _endTime / PlaybackSpeed;

        /// <summary>
        /// Gets or sets the playback speed.
        /// </summary>
        public double PlaybackSpeed
        {
            get;
            set;
        }

        public MidiFileSequencer(TinySoundFont synthesizer)
        {
            _synthesizer = synthesizer;
            _firstProgramEventPerChannel = new FastDictionary<int, SynthEvent>();
            _tempoChanges = new FastList<MidiFileSequencerTempoChange>();
            PlaybackSpeed = 1;
        }

        public void Seek(double timePosition)
        {
            // map to speed=1
            timePosition *= PlaybackSpeed;

            // ensure playback range
            if (PlaybackRange != null)
            {
                if (timePosition < _playbackRangeStartTime)
                {
                    timePosition = _playbackRangeStartTime;
                }
                else if (timePosition > _playbackRangeEndTime)
                {
                    timePosition = _playbackRangeEndTime;
                }
            }

            // move back some ticks to ensure the on-time events are played
            timePosition -= 25;
            if (timePosition < 0)
            {
                timePosition = 0;
            }

            if (timePosition > _currentTime)
            {
                SilentProcess(timePosition - _currentTime);
            }
            else if (timePosition < _currentTime)
            {
                //we have to restart the midi to make sure we get the right state: instruments, volume, pan, etc
                _currentTime = 0;
                _eventIndex = 0;
                _synthesizer.NoteOffAll(true);
                _synthesizer.Reset();

                SilentProcess(timePosition);
            }
        }

        private void SilentProcess(double milliseconds)
        {
            if (milliseconds <= 0)
            {
                return;
            }

            var start = Platform.Platform.GetCurrentMilliseconds();

            var finalTime = _currentTime + milliseconds;

            while (_currentTime < finalTime)
            {
                if (FillMidiEventQueueLimited(finalTime - _currentTime))
                {
                    _synthesizer.SynthesizeSilent();
                }
            }

            var duration = Platform.Platform.GetCurrentMilliseconds() - start;
            Logger.Debug("Sequencer", "Silent seek finished in " + duration + "ms");
        }


        public void LoadMidi(MidiFile midiFile)
        {
            _tempoChanges = new FastList<MidiFileSequencerTempoChange>();

            _division = midiFile.Division;
            _eventIndex = 0;
            _currentTime = 0;

            // build synth events.
            _synthData = new FastList<SynthEvent>();

            // Converts midi to milliseconds for easy sequencing
            double bpm = 120;
            var absTick = 0;
            var absTime = 0.0;

            var metronomeLength = 0;
            var metronomeTick = 0;
            var metronomeTime = 0.0;

            var previousTick = 0;

            foreach (var mEvent in midiFile.Events)
            {
                var synthData = new SynthEvent(_synthData.Count, mEvent);
                _synthData.Add(synthData);

                var deltaTick = mEvent.Tick - previousTick;
                absTick += deltaTick;
                absTime += deltaTick * (60000.0 / (bpm * midiFile.Division));
                synthData.Time = absTime;
                previousTick = mEvent.Tick;

                if (mEvent.Command == MidiEventType.Meta && mEvent.Data1 == (int)MetaEventTypeEnum.Tempo)
                {
                    var meta = (MetaNumberEvent)mEvent;
                    bpm = MidiHelper.MicroSecondsPerMinute / (double)meta.Value;
                    _tempoChanges.Add(new MidiFileSequencerTempoChange(bpm, absTick, (int)absTime));
                }
                else if (mEvent.Command == MidiEventType.Meta && mEvent.Data1 == (int)MetaEventTypeEnum.TimeSignature)
                {
                    var meta = (MetaDataEvent)mEvent;
                    var timeSignatureDenominator = (int)Math.Pow(2, meta.Data[1]);
                    metronomeLength = (int)(_division * (4.0 / timeSignatureDenominator));
                }
                else if (mEvent.Command == MidiEventType.ProgramChange)
                {
                    var channel = mEvent.Channel;
                    if (!_firstProgramEventPerChannel.ContainsKey(channel))
                    {
                        _firstProgramEventPerChannel[channel] = synthData;
                    }
                }

                if (metronomeLength > 0)
                {
                    while (metronomeTick < absTick)
                    {
                        var metronome = SynthEvent.NewMetronomeEvent(_synthData.Count, metronomeLength);
                        _synthData.Add(metronome);
                        metronome.Time = metronomeTime;

                        metronomeTick += metronomeLength;
                        metronomeTime += metronomeLength * (60000.0 / (bpm * midiFile.Division));
                    }
                }
            }

            _synthData.Sort((a, b) =>
            {
                if (a.Time > b.Time)
                {
                    return 1;
                }

                if (a.Time < b.Time)
                {
                    return -1;
                }

                return a.EventIndex - b.EventIndex;
            });
            _endTime = absTime;
            EndTick = absTick;
        }


        public bool FillMidiEventQueue()
        {
            return FillMidiEventQueueLimited(-1);
        }

        private bool FillMidiEventQueueLimited(double maxMilliseconds)
        {
            var millisecondsPerBuffer = TinySoundFont.MicroBufferSize / (double)_synthesizer.OutSampleRate * 1000 * PlaybackSpeed;
            if (maxMilliseconds > 0 && maxMilliseconds < millisecondsPerBuffer)
            {
                millisecondsPerBuffer = maxMilliseconds;
            }

            var anyEventsDispatched = false;
            for (var i = 0; i < TinySoundFont.MicroBufferCount; i++)
            {
                _currentTime += millisecondsPerBuffer;
                while (_eventIndex < _synthData.Count && _synthData[_eventIndex].Time < _currentTime)
                {
                    _synthesizer.DispatchEvent(i, _synthData[_eventIndex]);
                    _eventIndex++;
                    anyEventsDispatched = true;
                }
            }

            return anyEventsDispatched;
        }

        public double TickPositionToTimePosition(int tickPosition)
        {
            return TickPositionToTimePositionWithSpeed(tickPosition, PlaybackSpeed);
        }

        public int TimePositionToTickPosition(double timePosition)
        {
            return TimePositionToTickPositionWithSpeed(timePosition, PlaybackSpeed);
        }

        private double TickPositionToTimePositionWithSpeed(int tickPosition, double playbackSpeed)
        {
            var timePosition = 0.0;
            var bpm = 120.0;
            var lastChange = 0;

            // find start and bpm of last tempo change before time
            for (var i = 0; i < _tempoChanges.Count; i++)
            {
                var c = _tempoChanges[i];
                if (tickPosition < c.Ticks)
                {
                    break;
                }

                timePosition = c.Time;
                bpm = c.Bpm;
                lastChange = c.Ticks;
            }

            // add the missing millis
            tickPosition -= lastChange;
            timePosition += tickPosition * (60000.0 / (bpm * _division));

            return timePosition / playbackSpeed;
        }

        private int TimePositionToTickPositionWithSpeed(double timePosition, double playbackSpeed)
        {
            timePosition *= playbackSpeed;

            var ticks = 0;
            var bpm = 120.0;
            var lastChange = 0;

            // find start and bpm of last tempo change before time
            for (var i = 0; i < _tempoChanges.Count; i++)
            {
                var c = _tempoChanges[i];
                if (timePosition < c.Time)
                {
                    break;
                }

                ticks = c.Ticks;
                bpm = c.Bpm;
                lastChange = c.Time;
            }

            // add the missing ticks
            timePosition -= lastChange;
            ticks += (int)(timePosition / (60000.0 / (bpm * _division)));
            // we add 1 for possible rounding errors.(floating point issuses)
            return ticks + 1;
        }

        public event Action Finished;

        protected virtual void OnFinished()
        {
            var finished = Finished;
            if (finished != null)
            {
                finished();
            }
        }


        public void CheckForStop()
        {
            if (PlaybackRange == null && _currentTime >= _endTime)
            {
                _currentTime = 0;
                _eventIndex = 0;
                _synthesizer.NoteOffAll(true);
                _synthesizer.Reset();
                OnFinished();
            }
            else if (PlaybackRange != null && _currentTime >= _playbackRangeEndTime)
            {
                _currentTime = PlaybackRange.StartTick;
                _eventIndex = 0;
                _synthesizer.NoteOffAll(true);
                _synthesizer.Reset();
                OnFinished();
            }
        }

        public void SetChannelProgram(int channel, byte program)
        {
            if (_firstProgramEventPerChannel.ContainsKey(channel))
            {
                _firstProgramEventPerChannel[channel].Event.Data1 = program;
            }
        }
    }

    internal class MidiFileSequencerTempoChange
    {
        public double Bpm { get; set; }
        public int Ticks { get; set; }
        public int Time { get; set; }

        public MidiFileSequencerTempoChange(double bpm, int ticks, int time)
        {
            Bpm = bpm;
            Ticks = ticks;
            Time = time;
        }
    }
}
