using AlphaTab.Audio.Synth.SoundFont;

namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class Region
    {
        public LoopMode LoopMode { get; set; }
        public uint SampleRate { get; set; }
        public byte LoKey { get; set; }
        public byte HiKey { get; set; }
        public byte LoVel { get; set; }
        public byte HiVel { get; set; }
        public uint Group { get; set; }
        public uint Offset { get; set; }
        public uint End { get; set; }
        public uint LoopStart { get; set; }
        public uint LoopEnd { get; set; }
        public int Transpose { get; set; }
        public int Tune { get; set; }
        public int PitchKeyCenter { get; set; }
        public int PitchKeyTrack { get; set; }
        public float Attenuation { get; set; }
        public float Pan { get; set; }
        public Envelope AmpEnv { get; set; }
        public Envelope ModEnv { get; set; }
        public int InitialFilterQ { get; set; }
        public int InitialFilterFc { get; set; }
        public int ModEnvToPitch { get; set; }
        public int ModEnvToFilterFc { get; set; }
        public int ModLfoToFilterFc { get; set; }
        public int ModLfoToVolume { get; set; }
        public float DelayModLFO { get; set; }
        public int FreqModLFO { get; set; }
        public int ModLfoToPitch { get; set; }
        public float DelayVibLFO { get; set; }
        public int FreqVibLFO { get; set; }
        public int VibLfoToPitch { get; set; }

        public Region()
        {
            AmpEnv = new Envelope();
            ModEnv = new Envelope();
        }

        public Region(Region other)
        {
            LoopMode = other.LoopMode;
            SampleRate = other.SampleRate;
            LoKey = other.LoKey;
            HiKey = other.HiKey;
            LoVel = other.LoVel;
            HiVel = other.HiVel;
            Group = other.Group;
            Offset = other.Offset;
            End = other.End;
            LoopStart = other.LoopStart;
            LoopEnd = other.LoopEnd;
            Transpose = other.Transpose;
            Tune = other.Tune;
            PitchKeyCenter = other.PitchKeyCenter;
            PitchKeyTrack = other.PitchKeyTrack;
            Attenuation = other.Attenuation;
            Pan = other.Pan;
            AmpEnv = new Envelope(other.AmpEnv);
            ModEnv = new Envelope(other.ModEnv);
            InitialFilterQ = other.InitialFilterQ;
            InitialFilterFc = other.InitialFilterFc;
            ModEnvToPitch = other.ModEnvToPitch;
            ModEnvToFilterFc = other.ModEnvToFilterFc;
            ModLfoToFilterFc = other.ModLfoToFilterFc;
            ModLfoToVolume = other.ModLfoToVolume;
            DelayModLFO = other.DelayModLFO;
            FreqModLFO = other.FreqModLFO;
            ModLfoToPitch = other.ModLfoToPitch;
            DelayVibLFO = other.DelayVibLFO;
            FreqVibLFO = other.FreqVibLFO;
            VibLfoToPitch = other.VibLfoToPitch;
        }

        public void Clear(bool forRelative)
        {
            LoopMode = 0;
            SampleRate = 0;
            LoKey = 0;
            HiKey = 0;
            LoVel = 0;
            HiVel = 0;
            Group = 0;
            Offset = 0;
            End = 0;
            LoopStart = 0;
            LoopEnd = 0;
            Transpose = 0;
            Tune = 0;
            PitchKeyCenter = 0;
            PitchKeyTrack = 0;
            Attenuation = 0;
            Pan = 0;
            AmpEnv.Clear();
            ModEnv.Clear();
            InitialFilterQ = 0;
            InitialFilterFc = 0;
            ModEnvToPitch = 0;
            ModEnvToFilterFc = 0;
            ModLfoToFilterFc = 0;
            ModLfoToVolume = 0;
            DelayModLFO = 0;
            FreqModLFO = 0;
            ModLfoToPitch = 0;
            DelayVibLFO = 0;
            FreqVibLFO = 0;
            VibLfoToPitch = 0;

            HiKey = HiVel = 127;
            PitchKeyCenter = 60; // C4
            if (forRelative)
            {
                return;
            }

            PitchKeyTrack = 100;

            PitchKeyCenter = -1;

            // SF2 defaults in timecents.
            AmpEnv.Delay = AmpEnv.Attack = AmpEnv.Hold = AmpEnv.Decay = AmpEnv.Release = -12000.0f;
            ModEnv.Delay = ModEnv.Attack = ModEnv.Hold = ModEnv.Decay = ModEnv.Release = -12000.0f;

            InitialFilterFc = 13500;

            DelayModLFO = -12000.0f;
            DelayVibLFO = -12000.0f;
        }

        private enum GenOperators
        {
            StartAddrsOffset,
            EndAddrsOffset,
            StartloopAddrsOffset,
            EndloopAddrsOffset,
            StartAddrsCoarseOffset,
            ModLfoToPitch,
            VibLfoToPitch,
            ModEnvToPitch,
            InitialFilterFc,
            InitialFilterQ,
            ModLfoToFilterFc,
            ModEnvToFilterFc,
            EndAddrsCoarseOffset,
            ModLfoToVolume,
            Unused1,
            ChorusEffectsSend,
            ReverbEffectsSend,
            Pan,
            Unused2,
            Unused3,
            Unused4,
            DelayModLFO,
            FreqModLFO,
            DelayVibLFO,
            FreqVibLFO,
            DelayModEnv,
            AttackModEnv,
            HoldModEnv,
            DecayModEnv,
            SustainModEnv,
            ReleaseModEnv,
            KeynumToModEnvHold,
            KeynumToModEnvDecay,
            DelayVolEnv,
            AttackVolEnv,
            HoldVolEnv,
            DecayVolEnv,
            SustainVolEnv,
            ReleaseVolEnv,
            KeynumToVolEnvHold,
            KeynumToVolEnvDecay,
            Instrument,
            Reserved1,
            KeyRange,
            VelRange,
            StartloopAddrsCoarseOffset,
            Keynum,
            Velocity,
            InitialAttenuation,
            Reserved2,
            EndloopAddrsCoarseOffset,
            CoarseTune,
            FineTune,
            SampleID,
            SampleModes,
            Reserved3,
            ScaleTuning,
            ExclusiveClass,
            OverridingRootKey,
            Unused5,
            EndOper
        }

        internal void Operator(ushort genOper, HydraGenAmount amount)
        {
            switch ((GenOperators)genOper)
            {
                case GenOperators.StartAddrsOffset: Offset += (uint)amount.ShortAmount; break;
                case GenOperators.EndAddrsOffset: End += (uint)amount.ShortAmount; break;
                case GenOperators.StartloopAddrsOffset: LoopStart += (uint)amount.ShortAmount; break;
                case GenOperators.EndloopAddrsOffset: LoopEnd += (uint)amount.ShortAmount; break;
                case GenOperators.StartAddrsCoarseOffset: Offset += (uint)amount.ShortAmount * 32768; break;
                case GenOperators.ModLfoToPitch: ModLfoToPitch = amount.ShortAmount; break;
                case GenOperators.VibLfoToPitch: VibLfoToPitch = amount.ShortAmount; break;
                case GenOperators.ModEnvToPitch: ModEnvToPitch = amount.ShortAmount; break;
                case GenOperators.InitialFilterFc: InitialFilterFc = amount.ShortAmount; break;
                case GenOperators.InitialFilterQ: InitialFilterQ = amount.ShortAmount; break;
                case GenOperators.ModLfoToFilterFc: ModLfoToFilterFc = amount.ShortAmount; break;
                case GenOperators.ModEnvToFilterFc: ModEnvToFilterFc = amount.ShortAmount; break;
                case GenOperators.EndAddrsCoarseOffset: End += (uint)amount.ShortAmount * 32768; break;
                case GenOperators.ModLfoToVolume: ModLfoToVolume = amount.ShortAmount; break;
                case GenOperators.Pan: Pan = amount.ShortAmount / 1000.0f; break;
                case GenOperators.DelayModLFO: DelayModLFO = amount.ShortAmount; break;
                case GenOperators.FreqModLFO: FreqModLFO = amount.ShortAmount; break;
                case GenOperators.DelayVibLFO: DelayVibLFO = amount.ShortAmount; break;
                case GenOperators.FreqVibLFO: FreqVibLFO = amount.ShortAmount; break;
                case GenOperators.DelayModEnv: ModEnv.Delay = amount.ShortAmount; break;
                case GenOperators.AttackModEnv: ModEnv.Attack = amount.ShortAmount; break;
                case GenOperators.HoldModEnv: ModEnv.Hold = amount.ShortAmount; break;
                case GenOperators.DecayModEnv: ModEnv.Decay = amount.ShortAmount; break;
                case GenOperators.SustainModEnv: ModEnv.Sustain = amount.ShortAmount; break;
                case GenOperators.ReleaseModEnv: ModEnv.Release = amount.ShortAmount; break;
                case GenOperators.KeynumToModEnvHold: ModEnv.KeynumToHold = amount.ShortAmount; break;
                case GenOperators.KeynumToModEnvDecay: ModEnv.KeynumToDecay = amount.ShortAmount; break;
                case GenOperators.DelayVolEnv: AmpEnv.Delay = amount.ShortAmount; break;
                case GenOperators.AttackVolEnv: AmpEnv.Attack = amount.ShortAmount; break;
                case GenOperators.HoldVolEnv: AmpEnv.Hold = amount.ShortAmount; break;
                case GenOperators.DecayVolEnv: AmpEnv.Decay = amount.ShortAmount; break;
                case GenOperators.SustainVolEnv: AmpEnv.Sustain = amount.ShortAmount; break;
                case GenOperators.ReleaseVolEnv: AmpEnv.Release = amount.ShortAmount; break;
                case GenOperators.KeynumToVolEnvHold: AmpEnv.KeynumToHold = amount.ShortAmount; break;
                case GenOperators.KeynumToVolEnvDecay: AmpEnv.KeynumToDecay = amount.ShortAmount; break;
                case GenOperators.KeyRange: LoKey = amount.LowByteAmount; HiKey = amount.HighByteAmount; break;
                case GenOperators.VelRange: LoVel = amount.LowByteAmount; HiVel = amount.HighByteAmount; break;
                case GenOperators.StartloopAddrsCoarseOffset: LoopStart += (uint)amount.ShortAmount * 32768; break;
                case GenOperators.InitialAttenuation: Attenuation += amount.ShortAmount * 0.1f; break;
                case GenOperators.EndloopAddrsCoarseOffset: LoopEnd += (uint)amount.ShortAmount * 32768; break;
                case GenOperators.CoarseTune: Transpose += amount.ShortAmount; break;
                case GenOperators.FineTune: Tune += amount.ShortAmount; break;
                case GenOperators.SampleModes: LoopMode = ((amount.WordAmount & 3) == 3 ? LoopMode.Sustain : ((amount.WordAmount & 3) == 1 ? LoopMode.Continuous : LoopMode.None)); break;
                case GenOperators.ScaleTuning: PitchKeyTrack = amount.ShortAmount; break;
                case GenOperators.ExclusiveClass: Group = amount.WordAmount; break;
                case GenOperators.OverridingRootKey: PitchKeyCenter = amount.ShortAmount; break;
            }
        }
    }
}
