using System.Collections.Generic;
using AlphaTab.Audio.Generator;
using AlphaTab.Model;

namespace AlphaTab.Test.Audio
{
    public class FlatMidiEventGenerator : IMidiFileHandler
    {
        public abstract class MidiEvent
        {
            public int Tick { get; set; }

            public override string ToString()
            {
                return "Tick[" + Tick + "]";
            }

            protected bool Equals(MidiEvent other)
            {
                return Tick == other.Tick;
            }

            public override bool Equals(object obj)
            {
                if (ReferenceEquals(null, obj)) return false;
                if (ReferenceEquals(this, obj)) return true;
                if (obj.GetType() != this.GetType()) return false;
                return Equals((MidiEvent) obj);
            }

            public override int GetHashCode()
            {
                return Tick;
            }
        }

        public abstract class TrackMidiEvent : MidiEvent
        {
            public int Track { get; set; }

            public override string ToString()
            {
                return base.ToString() + " Track[" + Track + "]";
            }

            protected bool Equals(TrackMidiEvent other)
            {
                return base.Equals(other) && Track == other.Track;
            }

            public override bool Equals(object obj)
            {
                if (ReferenceEquals(null, obj)) return false;
                if (ReferenceEquals(this, obj)) return true;
                if (obj.GetType() != this.GetType()) return false;
                return Equals((TrackMidiEvent) obj);
            }

            public override int GetHashCode()
            {
                unchecked
                {
                    return (base.GetHashCode()*397) ^ Track;
                }
            }
        }

        public abstract class ChannelMidiEvent : TrackMidiEvent
        {
            public int Channel { get; set; }

            public override string ToString()
            {
                return base.ToString() + " Channel[" + Channel + "]";
            }

            protected bool Equals(ChannelMidiEvent other)
            {
                return base.Equals(other) && Channel == other.Channel;
            }

            public override bool Equals(object obj)
            {
                if (ReferenceEquals(null, obj)) return false;
                if (ReferenceEquals(this, obj)) return true;
                if (obj.GetType() != this.GetType()) return false;
                return Equals((ChannelMidiEvent) obj);
            }

            public override int GetHashCode()
            {
                unchecked
                {
                    return (base.GetHashCode()*397) ^ Channel;
                }
            }
        }

        public class TimeSignatureEvent : MidiEvent
        {
            public int Numerator { get; set; }
            public int Denominator { get; set; }

            public override string ToString()
            {
                return "TimeSignature: " + base.ToString() + " Numerator[" + Numerator + "] Denominator[" + Denominator + "]";
            }

            protected bool Equals(TimeSignatureEvent other)
            {
                return base.Equals(other) && Numerator == other.Numerator && Denominator == other.Denominator;
            }

            public override bool Equals(object obj)
            {
                if (ReferenceEquals(null, obj)) return false;
                if (ReferenceEquals(this, obj)) return true;
                if (obj.GetType() != this.GetType()) return false;
                return Equals((TimeSignatureEvent) obj);
            }

            public override int GetHashCode()
            {
                unchecked
                {
                    int hashCode = base.GetHashCode();
                    hashCode = (hashCode*397) ^ Numerator;
                    hashCode = (hashCode*397) ^ Denominator;
                    return hashCode;
                }
            }
        }

        public class RestEvent : ChannelMidiEvent
        {
            public override string ToString()
            {
                return "Rest: " + base.ToString();
            }

            public override bool Equals(object obj)
            {
                if (ReferenceEquals(null, obj)) return false;
                if (ReferenceEquals(this, obj)) return true;
                if (obj.GetType() != this.GetType()) return false;
                return Equals((RestEvent) obj);
            }
        }

        public class NoteEvent : ChannelMidiEvent
        {
            public int Length { get; set; }
            public byte Key { get; set; }
            public DynamicValue DynamicValue { get; set; }

            public override string ToString()
            {
                return "Note: " + base.ToString() + " Length[" + Length + "] Key[" + Key + "] Dynamic[" + DynamicValue + "]";
            }

            protected bool Equals(NoteEvent other)
            {
                return base.Equals(other) && Length == other.Length && Key == other.Key && DynamicValue == other.DynamicValue;
            }

            public override bool Equals(object obj)
            {
                if (ReferenceEquals(null, obj)) return false;
                if (ReferenceEquals(this, obj)) return true;
                if (obj.GetType() != this.GetType()) return false;
                return Equals((NoteEvent) obj);
            }

            public override int GetHashCode()
            {
                unchecked
                {
                    int hashCode = base.GetHashCode();
                    hashCode = (hashCode*397) ^ Length;
                    hashCode = (hashCode*397) ^ Key.GetHashCode();
                    hashCode = (hashCode*397) ^ (int) DynamicValue;
                    return hashCode;
                }
            }
        }

        public class ControlChangeEvent : ChannelMidiEvent
        {
            public byte Controller { get; set; }
            public byte Value { get; set; }

            public override string ToString()
            {
                return "ControlChange: " + base.ToString() + " Controller[" + Controller + "] Value[" + Value + "]";
            }

            protected bool Equals(ControlChangeEvent other)
            {
                return base.Equals(other) && Controller == other.Controller && Value == other.Value;
            }

            public override bool Equals(object obj)
            {
                if (ReferenceEquals(null, obj)) return false;
                if (ReferenceEquals(this, obj)) return true;
                if (obj.GetType() != this.GetType()) return false;
                return Equals((ControlChangeEvent) obj);
            }

            public override int GetHashCode()
            {
                unchecked
                {
                    int hashCode = base.GetHashCode();
                    hashCode = (hashCode*397) ^ Controller.GetHashCode();
                    hashCode = (hashCode*397) ^ Value.GetHashCode();
                    return hashCode;
                }
            }
        }

        public class ProgramChangeEvent : ChannelMidiEvent
        {
            public byte Program { get; set; }

            public override string ToString()
            {
                return "ProgramChange: " + base.ToString() + " Program[" + Program + "]";
            }

            protected bool Equals(ProgramChangeEvent other)
            {
                return base.Equals(other) && Program == other.Program;
            }

            public override bool Equals(object obj)
            {
                if (ReferenceEquals(null, obj)) return false;
                if (ReferenceEquals(this, obj)) return true;
                if (obj.GetType() != this.GetType()) return false;
                return Equals((ProgramChangeEvent) obj);
            }

            public override int GetHashCode()
            {
                unchecked
                {
                    return (base.GetHashCode()*397) ^ Program.GetHashCode();
                }
            }
        }

        public class TempoEvent : MidiEvent
        {
            public int Tempo { get; set; }

            public override string ToString()
            {
                return "Tempo: " + base.ToString() + " Tempo[" + Tempo + "]";
            }

            protected bool Equals(TempoEvent other)
            {
                return base.Equals(other) && Tempo == other.Tempo;
            }

            public override bool Equals(object obj)
            {
                if (ReferenceEquals(null, obj)) return false;
                if (ReferenceEquals(this, obj)) return true;
                if (obj.GetType() != this.GetType()) return false;
                return Equals((TempoEvent) obj);
            }

            public override int GetHashCode()
            {
                unchecked
                {
                    return (base.GetHashCode()*397) ^ Tempo;
                }
            }
        }


        public class BendEvent : ChannelMidiEvent
        {
            public byte Value { get; set; }

            public override string ToString()
            {
                return "Bend: " + base.ToString() + " Value[" + Value + "]";
            }

            protected bool Equals(BendEvent other)
            {
                return base.Equals(other) && Value == other.Value;
            }

            public override bool Equals(object obj)
            {
                if (ReferenceEquals(null, obj)) return false;
                if (ReferenceEquals(this, obj)) return true;
                if (obj.GetType() != this.GetType()) return false;
                return Equals((BendEvent) obj);
            }

            public override int GetHashCode()
            {
                unchecked
                {
                    return (base.GetHashCode()*397) ^ Value.GetHashCode();
                }
            }
        }

        public class TrackEndEvent : TrackMidiEvent
        {
            public override string ToString()
            {
                return "End of Track " + base.ToString();
            }
        }

        public List<MidiEvent> MidiEvents { get; private set; }

        public FlatMidiEventGenerator()
        {
            MidiEvents = new List<MidiEvent>();
        }

        public void AddTimeSignature(int tick, int timeSignatureNumerator, int timeSignatureDenominator)
        {
            MidiEvents.Add(new TimeSignatureEvent
            {
                Tick = tick,
                Numerator = timeSignatureNumerator,
                Denominator = timeSignatureDenominator
            });
        }

        public void AddRest(int track, int tick, int channel)
        {
            MidiEvents.Add(new RestEvent
            {
                Tick = tick,
                Track = track,
                Channel = channel
            });
        }

        public void AddNote(int track, int start, int length, byte key, DynamicValue dynamicValue, byte channel)
        {
            MidiEvents.Add(new NoteEvent
            {
                Channel = channel,
                DynamicValue = dynamicValue,
                Key = key,
                Length = length,
                Tick = start,
                Track = track
            });
        }

        public void AddControlChange(int track, int tick, byte channel, byte controller, byte value)
        {
            MidiEvents.Add(new ControlChangeEvent
            {
                Track = track,
                Tick = tick,
                Channel = channel,
                Controller = controller,
                Value = value
            });
        }

        public void AddProgramChange(int track, int tick, byte channel, byte program)
        {
            MidiEvents.Add(new ProgramChangeEvent
            {
                Channel = channel,
                Program = program,
                Tick = tick,
                Track = track
            });
        }

        public void AddTempo(int tick, int tempo)
        {
            MidiEvents.Add(new TempoEvent
            {
                Tick = tick,
                Tempo = tempo
            });
        }

        public void AddBend(int track, int tick, byte channel, byte value)
        {
            MidiEvents.Add(new BendEvent()
            {
                Tick = tick,
                Track = track,
                Channel = channel,
                Value = value
            });
        }

        public void FinishTrack(int track, int tick)
        {
            MidiEvents.Add(new TrackEndEvent
            {
                Track = track,
                Tick = tick
            });
        }
    }
}