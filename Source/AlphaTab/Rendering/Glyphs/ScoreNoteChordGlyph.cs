using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    internal class ScoreNoteChordGlyph : ScoreNoteChordGlyphBase
    {
        private readonly FastDictionary<int, EffectGlyph> _noteGlyphLookup;
        private readonly FastList<Note> _notes;
        private Glyph _tremoloPicking;

        public FastDictionary<string, Glyph> BeatEffects { get; set; }

        public Beat Beat { get; set; }
        public BeamingHelper BeamingHelper { get; set; }

        public ScoreNoteChordGlyph()
        {
            BeatEffects = new FastDictionary<string, Glyph>();
            _noteGlyphLookup = new FastDictionary<int, EffectGlyph>();
            _notes = new FastList<Note>();
        }

        public override BeamDirection Direction => BeamingHelper.Direction;

        public float GetNoteX(Note note, bool onEnd = true)
        {
            if (_noteGlyphLookup.ContainsKey(note.Id))
            {
                var n = _noteGlyphLookup[note.Id];
                var pos = X + n.X;
                if (onEnd)
                {
                    pos += n.Width;
                }

                return pos;
            }

            return 0;
        }

        public float GetNoteY(Note note, bool aboveNote = false)
        {
            if (_noteGlyphLookup.ContainsKey(note.Id))
            {
                return Y + _noteGlyphLookup[note.Id].Y + (aboveNote ? -(NoteHeadGlyph.NoteHeadHeight * Scale) / 2 : 0);
            }

            return 0;
        }

        public void AddNoteGlyph(EffectGlyph noteGlyph, Note note, int noteLine)
        {
            base.Add(noteGlyph, noteLine);
            _noteGlyphLookup[note.Id] = noteGlyph;
            _notes.Add(note);
        }

        public void UpdateBeamingHelper(float cx)
        {
            if (BeamingHelper != null)
            {
                BeamingHelper.RegisterBeatLineX(ScoreBarRenderer.StaffId, Beat, cx + X + UpLineX, cx + X + DownLineX);
            }
        }

        public override void DoLayout()
        {
            base.DoLayout();

            var direction = Direction;
            foreach (var effectKey in BeatEffects)
            {
                var effect = BeatEffects[effectKey];
                effect.Renderer = Renderer;
                effect.DoLayout();
            }

            if (Beat.IsTremolo)
            {
                int offset;
                var baseNote = direction == BeamDirection.Up ? MinNote : MaxNote;
                var tremoloX = direction == BeamDirection.Up ? DisplacedX : 0;
                var speed = Beat.TremoloSpeed.Value;
                switch (speed)
                {
                    case Duration.ThirtySecond:
                        offset = direction == BeamDirection.Up ? -15 : 15;
                        break;
                    case Duration.Sixteenth:
                        offset = direction == BeamDirection.Up ? -12 : 15;
                        break;
                    case Duration.Eighth:
                        offset = direction == BeamDirection.Up ? -10 : 10;
                        break;
                    default:
                        offset = direction == BeamDirection.Up ? -10 : 15;
                        break;
                }

                _tremoloPicking =
                    new TremoloPickingGlyph(tremoloX, baseNote.Glyph.Y + offset * Scale, Beat.TremoloSpeed.Value);
                _tremoloPicking.Renderer = Renderer;
                _tremoloPicking.DoLayout();
            }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            // TODO: this method seems to be quite heavy according to the profiler, why?
            var scoreRenderer = (ScoreBarRenderer)Renderer;

            //
            // Note Effects only painted once
            //
            var effectY = BeamingHelper.Direction == BeamDirection.Up
                ? scoreRenderer.GetScoreY(MaxNote.Line, 1.5f * NoteHeadGlyph.NoteHeadHeight)
                : scoreRenderer.GetScoreY(MinNote.Line, -1.0f * NoteHeadGlyph.NoteHeadHeight);
            // TODO: take care of actual glyph height
            var effectSpacing = BeamingHelper.Direction == BeamDirection.Up
                ? 7 * Scale
                : -7 * Scale;

            foreach (var effectKey in BeatEffects)
            {
                var g = BeatEffects[effectKey];
                g.Y = effectY;
                g.X = Width / 2;
                g.Paint(cx + X, cy + Y, canvas);
                effectY += effectSpacing;
            }

            if (Renderer.Settings.Core.IncludeNoteBounds)
            {
                foreach (var note in _notes)
                {
                    if (_noteGlyphLookup.ContainsKey(note.Id))
                    {
                        var glyph = _noteGlyphLookup[note.Id];
                        var noteBounds = new NoteBounds();
                        noteBounds.Note = note;
                        noteBounds.NoteHeadBounds = new Bounds
                        {
                            X = cx + X + glyph.X,
                            Y = cy + Y + glyph.Y,
                            W = glyph.Width,
                            H = glyph.Height
                        };
                        Renderer.ScoreRenderer.BoundsLookup.AddNote(noteBounds);
                    }
                }
            }

            base.Paint(cx, cy, canvas);

            if (_tremoloPicking != null)
            {
                _tremoloPicking.Paint(cx, cy, canvas);
            }
        }
    }
}
