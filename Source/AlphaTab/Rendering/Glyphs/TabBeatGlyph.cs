using AlphaTab.Model;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBeatGlyph : BeatGlyphBase, ISupportsFinalize
    {
        public TabNoteChordGlyph NoteNumbers { get; set; }
        public BeamingHelper BeamingHelper { get; set; }

        public override void DoLayout()
        {
            // create glyphs
            if (!Container.Beat.IsRest)
            {
                //
                // Note numbers
                NoteNumbers = new TabNoteChordGlyph(0, 0, Container.Beat.GraceType != GraceType.None);
                NoteNumbers.Beat = Container.Beat;
                NoteNumbers.BeamingHelper = BeamingHelper;
                NoteLoop(CreateNoteGlyph);
                AddGlyph(NoteNumbers);

                //
                // Whammy Bar
                if (Container.Beat.HasWhammyBar && !NoteNumbers.BeatEffects.ContainsKey("Whammy"))
                {
                    NoteNumbers.BeatEffects["Whammy"] = new WhammyBarGlyph(Container.Beat, Container);
                }

                //
                // Tremolo Picking
                if (Container.Beat.IsTremolo && !NoteNumbers.BeatEffects.ContainsKey("Tremolo"))
                {
                    NoteNumbers.BeatEffects["Tremolo"] = new TremoloPickingGlyph(0, 0, Container.Beat.TremoloSpeed.Value);
                }
            }

            // left to right layout
            if (Glyphs == null) return;
            var w = 0;
            for (int i = 0, j = Glyphs.Count; i < j; i++)
            {
                var g = Glyphs[i];
                g.X = w;
                g.Renderer = Renderer;
                g.DoLayout();
                w += g.Width;
            }
            Width = w;
        }

        public override void FinalizeGlyph(ScoreLayout layout)
        {
            if (!Container.Beat.IsRest)
            {
                NoteNumbers.UpdateBeamingHelper(Container.X + X);
            }
        }

        public override void ApplyGlyphSpacing(int spacing)
        {
            base.ApplyGlyphSpacing(spacing);
            // TODO: we need to tell the beaming helper the position of rest beats
            if (!Container.Beat.IsRest)
            {
                NoteNumbers.UpdateBeamingHelper(Container.X + X);
            }
        }

        private void CreateNoteGlyph(Note n)
        {
            var isGrace = Container.Beat.GraceType != GraceType.None;
            var tr = (TabBarRenderer)Renderer;
            var noteNumberGlyph = new NoteNumberGlyph(0, 0, n, isGrace);
            var l = n.Beat.Voice.Bar.Track.Tuning.Count - n.String + 1;
            noteNumberGlyph.Y = tr.GetTabY(l, -2);
            NoteNumbers.AddNoteGlyph(noteNumberGlyph, n);
        }
    }
}
