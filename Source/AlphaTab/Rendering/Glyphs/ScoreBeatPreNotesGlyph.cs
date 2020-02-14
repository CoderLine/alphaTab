using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    internal class ScoreBeatPreNotesGlyph : BeatGlyphBase
    {
        private BendNoteHeadGroupGlyph _prebends;
        public float PrebendNoteHeadOffset => _prebends.X + _prebends.NoteHeadOffset;

        public AccidentalGroupGlyph Accidentals { get; private set; }

        public override void DoLayout()
        {
            if (!Container.Beat.IsRest)
            {
                var accidentals = new AccidentalGroupGlyph();
                var ghost = new GhostNoteContainerGlyph(true);
                ghost.Renderer = Renderer;
                _prebends = new BendNoteHeadGroupGlyph(Container.Beat, true);
                _prebends.Renderer = Renderer;
                foreach (var note in Container.Beat.Notes)
                {
                    if (note.IsVisible)
                    {
                        if (note.HasBend)
                        {
                            switch (note.BendType)
                            {
                                case BendType.PrebendBend:
                                case BendType.Prebend:
                                case BendType.PrebendRelease:
                                    _prebends.AddGlyph(note.DisplayValue - note.BendPoints[0].Value / 2);
                                    break;
                            }
                        }
                        else if (note.Beat.HasWhammyBar)
                        {
                            switch (note.Beat.WhammyBarType)
                            {
                                case WhammyType.PrediveDive:
                                case WhammyType.Predive:
                                    _prebends.AddGlyph(note.DisplayValue - note.Beat.WhammyBarPoints[0].Value / 2);
                                    break;
                            }
                        }

                        CreateAccidentalGlyph(note, accidentals);
                        ghost.AddParenthesis(note);
                    }
                }

                if (!_prebends.IsEmpty)
                {
                    AddGlyph(_prebends);
                    AddGlyph(new SpacingGlyph(0,
                        0,
                        4 * (Container.Beat.GraceType != GraceType.None ? NoteHeadGlyph.GraceScale : 1) * Scale));
                }

                if (Container.Beat.BrushType != BrushType.None)
                {
                    AddGlyph(new ScoreBrushGlyph(Container.Beat));
                    AddGlyph(new SpacingGlyph(0, 0, 4 * Scale));
                }

                if (!ghost.IsEmpty)
                {
                    AddGlyph(ghost);
                    AddGlyph(new SpacingGlyph(0,
                        0,
                        4 * (Container.Beat.GraceType != GraceType.None ? NoteHeadGlyph.GraceScale : 1) * Scale));
                }

                if (!accidentals.IsEmpty)
                {
                    Accidentals = accidentals;
                    AddGlyph(accidentals);
                    AddGlyph(new SpacingGlyph(0,
                        0,
                        4 * (Container.Beat.GraceType != GraceType.None ? NoteHeadGlyph.GraceScale : 1) * Scale));
                }
            }

            base.DoLayout();
        }

        private void CreateAccidentalGlyph(Note n, AccidentalGroupGlyph accidentals)
        {
            var sr = (ScoreBarRenderer)Renderer;
            var accidental = sr.AccidentalHelper.ApplyAccidental(n);
            var noteLine = sr.GetNoteLine(n);
            var isGrace = Container.Beat.GraceType != GraceType.None;

            if (accidental != AccidentalType.None)
            {
                accidentals.AddGlyph(new AccidentalGlyph(0, sr.GetScoreY(noteLine), accidental, isGrace));
            }

            if (n.HarmonicType != HarmonicType.None && n.HarmonicType != HarmonicType.Natural)
            {
                var harmonicFret = n.DisplayValue + n.HarmonicPitch;
                accidental = sr.AccidentalHelper.ApplyAccidentalForValue(n.Beat, harmonicFret, isGrace);
                noteLine = sr.AccidentalHelper.GetNoteLineForValue(harmonicFret);
                accidentals.AddGlyph(new AccidentalGlyph(0, sr.GetScoreY(noteLine), accidental, isGrace));
            }
        }
    }
}
