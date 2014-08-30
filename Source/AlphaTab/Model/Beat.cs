using System.Runtime.CompilerServices;
using AlphaTab.Audio;
using AlphaTab.Collections;
using AlphaTab.Platform;

namespace AlphaTab.Model
{
    /// <summary>
    /// A beat is a single block within a bar. A beat is a combination
    /// of several notes played at the same time. 
    /// </summary>
    public class Beat
    {
        public const int WhammyBarMaxPosition = 60;
        public const int WhammyBarMaxValue = 24;

        [IntrinsicProperty]
        public Beat PreviousBeat { get; set; }
        [IntrinsicProperty]
        public Beat NextBeat { get; set; }
        [IntrinsicProperty]
        public int Index { get; set; }

        [IntrinsicProperty]
        public Voice Voice { get; set; }
        [IntrinsicProperty]
        public FastList<Note> Notes { get; set; }
        [IntrinsicProperty]
        public bool IsEmpty { get; set; }

        private Note _minNote;

        public Note MinNote
        {
            get
            {
                if (_minNote == null)
                {
                    RefreshNotes();
                }
                return _minNote;
            }
        }

        private Note _maxNote;

        public Note MaxNote
        {
            get
            {
                if (_maxNote == null)
                {
                    RefreshNotes();
                }
                return _maxNote;
            }
        }

        [IntrinsicProperty]
        public Duration Duration { get; set; }

        public bool IsRest
        {
            get
            {
                return Notes.Count == 0;
            }
        }

        [IntrinsicProperty]
        public FastList<Automation> Automations { get; set; }

        [IntrinsicProperty]
        public int Dots { get; set; }
        [IntrinsicProperty]
        public bool FadeIn { get; set; }
        [IntrinsicProperty]
        public FastList<string> Lyrics { get; set; }
        [IntrinsicProperty]
        public bool Pop { get; set; }
        [IntrinsicProperty]
        public bool HasRasgueado { get; set; }
        [IntrinsicProperty]
        public bool Slap { get; set; }
        [IntrinsicProperty]
        public bool Tap { get; set; }
        [IntrinsicProperty]
        public string Text { get; set; }

        [IntrinsicProperty]
        public BrushType BrushType { get; set; }
        [IntrinsicProperty]
        public int BrushDuration { get; set; }

        [IntrinsicProperty]
        public int TupletDenominator { get; set; }
        [IntrinsicProperty]
        public int TupletNumerator { get; set; }

        public bool HasTuplet
        {
            get
            {
                return !(TupletDenominator == -1 && TupletNumerator == -1) &&
                       !(TupletDenominator == 1 && TupletNumerator == 1);
            }
        }

        [IntrinsicProperty]
        public FastList<BendPoint> WhammyBarPoints { get; set; }

        public bool HasWhammyBar
        {
            get { return WhammyBarPoints.Count > 0; }
        }

        [IntrinsicProperty]
        public VibratoType Vibrato { get; set; }
        [IntrinsicProperty]
        public string ChordId { get; set; }
        public bool HasChord
        {
            get { return ChordId != null; }
        }

        public Chord Chord
        {
            get
            {
                return Voice.Bar.Track.Chords[ChordId];
            }
        }

        [IntrinsicProperty]
        public GraceType GraceType { get; set; }
        [IntrinsicProperty]
        public PickStrokeType PickStroke { get; set; }

        public bool IsTremolo
        {
            get { return TremoloSpeed != null; }
        }

        [IntrinsicProperty]
        public Duration? TremoloSpeed { get; set; }
        [IntrinsicProperty]
        public CrescendoType Crescendo { get; set; }

        /// <summary>
        /// The timeline position of the voice within the current bar. (unit: midi ticks)
        /// </summary>
        [IntrinsicProperty]
        public int Start { get; set; }
        [IntrinsicProperty]
        public DynamicValue Dynamic { get; set; }

        public Beat()
        {
            WhammyBarPoints = new FastList<BendPoint>();
            Notes = new FastList<Note>();
            BrushType = BrushType.None;
            Vibrato = VibratoType.None;
            GraceType = GraceType.None;
            PickStroke = PickStrokeType.None;
            Duration = Duration.Quarter;
            TremoloSpeed = null;
            Automations = new FastList<Automation>();
            Dots = 0;
            Start = 0;
            TupletDenominator = -1;
            TupletNumerator = -1;
            Dynamic = DynamicValue.F;
            Crescendo = CrescendoType.None;
        }

        public Beat Clone()
        {
            var beat = new Beat();
            for (int i = 0, j = WhammyBarPoints.Count; i < j; i++)
            {
                beat.WhammyBarPoints.Add(WhammyBarPoints[i].Clone());
            }
            for (int i = 0, j = Notes.Count; i < j; i++)
            {
                beat.AddNote(Notes[i].Clone());
            }
            beat.Dots = Dots;
            beat.ChordId = ChordId;
            beat.BrushType = BrushType;
            beat.Vibrato = Vibrato;
            beat.GraceType = GraceType;
            beat.PickStroke = PickStroke;
            beat.Duration = Duration;
            beat.TremoloSpeed = TremoloSpeed;
            beat.Text = Text;
            beat.FadeIn = FadeIn;
            beat.Tap = Tap;
            beat.Slap = Slap;
            beat.Pop = Pop;
            for (int i = 0, j = Automations.Count; i < j; i++)
            {
                beat.Automations.Add(Automations[i].Clone());
            }
            beat.Start = Start;
            beat.TupletDenominator = TupletDenominator;
            beat.TupletNumerator = TupletNumerator;
            beat.Dynamic = Dynamic;
            beat.Crescendo = Crescendo;

            return beat;
        }

        /// <summary>
        /// Calculates the time spent in this bar. (unit: midi ticks)
        /// </summary>
        /// <returns></returns>
        public int CalculateDuration()
        {
            var ticks = Duration.ToTicks();
            if (Dots == 2)
            {
                ticks = MidiUtils.ApplyDot(ticks, true);
            }
            else if (Dots == 1)
            {
                ticks = MidiUtils.ApplyDot(ticks, false);
            }

            if (TupletDenominator > 0 && TupletNumerator >= 0)
            {
                ticks = MidiUtils.ApplyTuplet(ticks, TupletNumerator, TupletDenominator);
            }

            return ticks;
        }

        public void AddNote(Note note)
        {
            note.Beat = this;
            Notes.Add(note);
        }

        public void RefreshNotes()
        {
            for (int i = 0, j = Notes.Count; i < j; i++)
            {
                var note = Notes[i];
                if (_minNote == null || note.RealValue < _minNote.RealValue)
                {
                    _minNote = note;
                }
                if (_maxNote == null || note.RealValue > _maxNote.RealValue)
                {
                    _maxNote = note;
                }
            }
        }

        public Automation GetAutomation(AutomationType type)
        {
            for (int i = 0, j = Automations.Count; i < j; i++)
            {
                var automation = Automations[i];
                if (automation.Type == type)
                {
                    return automation;
                }
            }
            return null;
        }

        public Note GetNoteOnString(int @string)
        {
            for (int i = 0, j = Notes.Count; i < j; i++)
            {
                var note = Notes[i];
                if (note.String == @string)
                {
                    return note;
                }
            }
            return null;
        }

        public void Finish()
        {
            // start
            if (Index == 0)
            {
                Start = Voice.Bar.MasterBar.Start;
            }
            else
            {
                Start = PreviousBeat.Start + PreviousBeat.CalculateDuration();
            }

            for (int i = 0, j = Notes.Count; i < j; i++)
            {
                Notes[i].Finish();
            }
        }
    }
}