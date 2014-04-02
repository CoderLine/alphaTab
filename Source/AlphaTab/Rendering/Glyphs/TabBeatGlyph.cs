using AlphaTab.Model;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBeatGlyph : BeatGlyphBase, ISupportsFinalize
    {
        public TabNoteChordGlyph noteNumbers { get; set; }
        public BeamingHelper BeamingHelper { get; set; }

        public override void DoLayout()
        {
            // create glyphs
            if (!Container.Beat.IsRest)
            {
                //
                // Note numbers
                noteNumbers = new TabNoteChordGlyph(0, 0, Container.Beat.GraceType != GraceType.None);
                noteNumbers.Beat = Container.Beat;
                noteNumbers.BeamingHelper = BeamingHelper;
                NoteLoop(CreateNoteGlyph);
                AddGlyph(noteNumbers);

                //
                // Whammy Bar
                if (Container.Beat.HasWhammyBar && !noteNumbers.BeatEffects.ContainsKey("Whammy"))
                {
                    noteNumbers.BeatEffects["Whammy"] = new WhammyBarGlyph(Container.Beat, Container);
                }

                //
                // Tremolo Picking
                if (Container.Beat.IsTremolo && !noteNumbers.BeatEffects.ContainsKey("Tremolo"))
                {
                    noteNumbers.BeatEffects["Tremolo"] = new TremoloPickingGlyph(0, 0, Container.Beat.TremoloSpeed.GetValueOrDefault());
                }
            }

            // left to right layout
            var w = 0;
            foreach (var g in Glyphs)
            {
                g.X = w;
                g.Renderer = Renderer;
                g.DoLayout();
                w += g.Width;
            }
            Width = w;
        }

        public void FinalizeGlyph(ScoreLayout layout)
        {
            if (!Container.Beat.IsRest)
            {
                noteNumbers.UpdateBeamingHelper(Container.X + X);
            }
        }

        public override void ApplyGlyphSpacing(int spacing)
        {
            base.ApplyGlyphSpacing(spacing);
            // TODO: we need to tell the beaming helper the position of rest beats
            if (!Container.Beat.IsRest)
            {
                noteNumbers.UpdateBeamingHelper(Container.X + X);
            }
        }

        private void CreateNoteGlyph(Note n)
        {
            var isGrace = Container.Beat.GraceType != GraceType.None;
            var tr = (TabBarRenderer)Renderer;
            var noteNumberGlyph = new NoteNumberGlyph(0, 0, n, isGrace);
            var l = n.Beat.Voice.Bar.Track.Tuning.Count - n.String + 1;
            noteNumberGlyph.Y = tr.GetTabY(l, -2);
            noteNumbers.AddNoteGlyph(noteNumberGlyph, n);
        }
    }
}
