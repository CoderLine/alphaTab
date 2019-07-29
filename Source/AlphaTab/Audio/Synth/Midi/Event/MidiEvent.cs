using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Midi.Event
{
    /// <summary>
    /// Lists all midi events.
    /// </summary>
    public enum MidiEventType
    {
        /// <summary>
        /// A note is released.
        /// </summary>
        NoteOff = 0x80,

        /// <summary>
        /// A note is started.
        /// </summary>
        NoteOn = 0x90,

        /// <summary>
        /// The pressure that was used to play the note.
        /// </summary>
        NoteAftertouch = 0xA0,

        /// <summary>
        /// Change of a midi controller
        /// </summary>
        Controller = 0xB0,

        /// <summary>
        /// Change of a midi program
        /// </summary>
        ProgramChange = 0xC0,

        /// <summary>
        /// The pressure that should be applied to the whole channel.
        /// </summary>
        ChannelAftertouch = 0xD0,

        /// <summary>
        /// A change of the audio pitch.
        /// </summary>
        PitchBend = 0xE0,

        /// <summary>
        /// A meta event. See <see cref="MetaEventTypeEnum"/> for details.
        /// </summary>
        Meta = 0xFF
    }

    /// <summary>
    /// Lists all midi controllers.
    /// </summary>
    public enum ControllerType
    {
        /// <summary>
        /// Bank Select. MSB
        /// </summary>
        BankSelectCoarse = 0x00,

        /// <summary>
        /// Modulation wheel or lever MSB
        /// </summary>
        ModulationCoarse = 0x01,

        //BreathControllerCoarse = 0x02,
        //FootControllerCoarse = 0x04,
        //PortamentoTimeCoarse = 0x05,
        /// <summary>
        /// Data entry MSB
        /// </summary>
        DataEntryCoarse = 0x06,

        /// <summary>
        /// Channel Volume MSB
        /// </summary>
        VolumeCoarse = 0x07,

        //BalanceCoarse = 0x08,
        /// <summary>
        /// Pan MSB
        /// </summary>
        PanCoarse = 0x0A,

        /// <summary>
        /// Expression Controller MSB
        /// </summary>
        ExpressionControllerCoarse = 0x0B,

        //EffectControl1Coarse = 0x0C,
        //EffectControl2Coarse = 0x0D,
        //GeneralPurposeSlider1 = 0x10,
        //GeneralPurposeSlider2 = 0x11,
        //GeneralPurposeSlider3 = 0x12,
        //GeneralPurposeSlider4 = 0x13,
        //BankSelectFine = 0x20,
        /// <summary>
        /// Modulation wheel or level LSB
        /// </summary>
        ModulationFine = 0x21,

        //BreathControllerFine = 0x22,
        //FootControllerFine = 0x24,
        //PortamentoTimeFine = 0x25,
        /// <summary>
        /// Data Entry LSB
        /// </summary>
        DataEntryFine = 0x26,

        /// <summary>
        /// Channel Volume LSB
        /// </summary>
        VolumeFine = 0x27,

        //BalanceFine = 0x28,
        /// <summary>
        /// Pan LSB
        /// </summary>
        PanFine = 0x2A,

        /// <summary>
        /// Expression controller LSB
        /// </summary>
        ExpressionControllerFine = 0x2B,

        //EffectControl1Fine = 0x2C,
        //EffectControl2Fine = 0x2D,
        /// <summary>
        /// Damper pedal (sustain)
        /// </summary>
        HoldPedal = 0x40,

        //Portamento = 0x41,
        //SostenutoPedal = 0x42,
        //SoftPedal = 0x43,
        /// <summary>
        /// Legato Footswitch
        /// </summary>
        LegatoPedal = 0x44,

        //Hold2Pedal = 0x45,
        //SoundVariation = 0x46,
        //SoundTimbre = 0x47,
        //SoundReleaseTime = 0x48,
        //SoundAttackTime = 0x49,
        //SoundBrightness = 0x4A,
        //SoundControl6 = 0x4B,
        //SoundControl7 = 0x4C,
        //SoundControl8 = 0x4D,
        //SoundControl9 = 0x4E,
        //SoundControl10 = 0x4F,
        //GeneralPurposeButton1 = 0x50,
        //GeneralPurposeButton2 = 0x51,
        //GeneralPurposeButton3 = 0x52,
        //GeneralPurposeButton4 = 0x53,
        //EffectsLevel = 0x5B,
        //TremuloLevel = 0x5C,
        //ChorusLevel = 0x5D,
        //CelesteLevel = 0x5E,
        //PhaseLevel = 0x5F,
        //DataButtonIncrement = 0x60,
        //DataButtonDecrement = 0x61,
        /// <summary>
        /// Non-Registered Parameter Number LSB
        /// </summary>
        NonRegisteredParameterFine = 0x62,

        /// <summary>
        /// Non-Registered Parameter Number MSB
        /// </summary>
        NonRegisteredParameterCourse = 0x63,

        /// <summary>
        /// Registered Parameter Number LSB
        /// </summary>
        RegisteredParameterFine = 0x64,

        /// <summary>
        /// Registered Parameter Number MSB
        /// </summary>
        RegisteredParameterCourse = 0x65,

        //AllSoundOff = 0x78,
        /// <summary>
        /// Reset all controllers
        /// </summary>
        ResetControllers = 0x79,

        //LocalKeyboard = 0x7A,
        /// <summary>
        /// All notes of.
        /// </summary>
        AllNotesOff = 0x7B

        //OmniModeOff = 0x7C,
        //OmniModeOn = 0x7D,
        //MonoMode = 0x7E,
        //PolyMode = 0x7F
    }

    /// <summary>
    /// Represents a midi event.
    /// </summary>
    public class MidiEvent
    {
        /// <summary>
        /// Gets or sets the raw midi message.
        /// </summary>
        public int Message { get; set; }

        /// <summary>
        /// Gets or sets the absolute tick of this midi event.
        /// </summary>
        public int Tick { get; set; }

        /// <summary>
        /// Gets or sets the channel of this midi event.
        /// </summary>
        public virtual int Channel => Message & 0x000000F;

        /// <summary>
        /// Gets or sets the command of this midi event.
        /// </summary>
        public virtual MidiEventType Command => (MidiEventType)(Message & 0x00000F0);

        /// <summary>
        /// Gets or sets the first data component of this midi event.
        /// </summary>
        public int Data1
        {
            get => (Message & 0x000FF00) >> 8;
            set
            {
                Message &= ~0x000FF00;
                Message |= value << 8;
            }
        }

        /// <summary>
        /// Gets or sets the second data component of this midi event.
        /// </summary>
        public int Data2
        {
            get => (Message & 0x0FF0000) >> 16;
            set
            {
                Message &= ~0x0FF0000;
                Message |= value << 16;
            }
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="MidiEvent"/> class.
        /// </summary>
        /// <param name="tick">The absolute midi ticks of this event..</param>
        /// <param name="status">The status information of this event.</param>
        /// <param name="data1">The first data component of this midi event.</param>
        /// <param name="data2">The second data component of this midi event.</param>
        public MidiEvent(int tick, int status, byte data1, byte data2)
        {
            Tick = tick;
            Message = status | (data1 << 8) | (data2 << 16);
        }

        /// <summary>
        /// Writes the midi event as binary into the given stream.
        /// </summary>
        /// <param name="s">The stream to write to.</param>
        public virtual void WriteTo(IWriteable s)
        {
            var b = new[]
            {
                (byte)((Message >> 24) & 0xFF), (byte)((Message >> 16) & 0xFF), (byte)((Message >> 8) & 0xFF),
                (byte)(Message & 0xFF)
            };
            s.Write(b, 0, b.Length);
        }
    }
}
