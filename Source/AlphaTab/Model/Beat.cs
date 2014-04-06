using System.Collections.Generic;
using System.Runtime.CompilerServices;
using AlphaTab.Audio;
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
        public List<Note> Notes { get; set; }
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
        public List<Automation> Automations { get; set; }

        [IntrinsicProperty]
        public int Dots { get; set; }
        [IntrinsicProperty]
        public bool FadeIn { get; set; }
        [IntrinsicProperty]
        public List<string> Lyrics { get; set; }
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
        public List<BendPoint> WhammyBarPoints { get; set; }

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
        public Nullable<Duration> TremoloSpeed { get; set; }
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
            WhammyBarPoints = new List<BendPoint>();
            Notes = new List<Note>();
            BrushType = BrushType.None;
            Vibrato = VibratoType.None;
            GraceType = GraceType.None;
            PickStroke = PickStrokeType.None;
            Duration = Duration.Quarter;
            TremoloSpeed = null;
            Automations = new List<Automation>();
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
            foreach (var b in WhammyBarPoints)
            {
                beat.WhammyBarPoints.Add(b.Clone());
            }
            foreach (var n in Notes)
            {
                beat.AddNote(n.Clone());
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
            foreach (var a in Automations)
            {
                beat.Automations.Add(a.Clone());
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
            foreach (var note in Notes)
            {
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
            foreach (var automation in Automations)
            {
                if (automation.Type == type)
                {
                    return automation;
                }
            }
            return null;
        }

        public Note GetNoteOnString(int @string)
        {
            foreach (var note in Notes)
            {
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

            foreach (Note note in Notes)
            {
                note.Finish();
            }
        }
    }
}