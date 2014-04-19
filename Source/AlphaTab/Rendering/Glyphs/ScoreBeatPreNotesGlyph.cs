using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreBeatPreNotesGlyph : BeatGlyphBase
    {
        public override void ApplyGlyphSpacing(int spacing)
        {
            base.ApplyGlyphSpacing(spacing);
            // add spacing at the beginning, this way the elements are closer to the note head
            for (int i = 0; i < Glyphs.Count; i++)
            {
                Glyphs[i].X += spacing;
            }
        }

        public override void DoLayout()
        {
            if (Container.Beat.BrushType != BrushType.None)
            {
                AddGlyph(new ScoreBrushGlyph(Container.Beat));
                AddGlyph(new SpacingGlyph(0, 0, (int)(4 * Scale)));
            }

            if (!Container.Beat.IsRest && !Container.Beat.Voice.Bar.Track.IsPercussion)
            {
                var accidentals = new AccidentalGroupGlyph();
                NoteLoop(n => CreateAccidentalGlyph(n, accidentals));
                AddGlyph(accidentals);
            }

            // a small padding
            AddGlyph(new SpacingGlyph(0, 0, (int)(4 * (Container.Beat.GraceType != GraceType.None ? NoteHeadGlyph.GraceScale : 1) * Scale)));

            base.DoLayout();
        }

        private void CreateAccidentalGlyph(Note n, AccidentalGroupGlyph accidentals)
        {
            var sr = (ScoreBarRenderer)Renderer;
            var noteLine = sr.GetNoteLine(n);
            var accidental = sr.AccidentalHelper.ApplyAccidental(n, noteLine);
            var isGrace = Container.Beat.GraceType != GraceType.None;
            switch (accidental)
            {
                case AccidentalType.Sharp: 
                    accidentals.AddGlyph(new SharpGlyph(0, sr.GetScoreY(noteLine), isGrace));
                    break;
                case AccidentalType.Flat: 
                    accidentals.AddGlyph(new FlatGlyph(0, sr.GetScoreY(noteLine), isGrace));
                    break;
                case AccidentalType.Natural: 
                    accidentals.AddGlyph(new NaturalizeGlyph(0, sr.GetScoreY(noteLine + 1), isGrace));
                    break;
            }
        }
    }
}
