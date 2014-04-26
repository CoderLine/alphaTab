using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBeatPostNotesGlyph : BeatGlyphBase
    {
        public override void DoLayout()
        {
            // note specific effects
            NoteLoop(CreateNoteGlyphs);

            AddGlyph(new SpacingGlyph(0, 0, (int)(BeatDurationWidth * Scale)));

            base.DoLayout();
        }

        private void CreateNoteGlyphs(Note n)
        {
            if (n.IsTrill)
            {
                AddGlyph(new SpacingGlyph(0, 0, (int)(4 * Scale)));
                var trillNote = new Note();
                trillNote.IsGhost = true;
                trillNote.Fret = n.TrillFret;
                trillNote.String = n.String;
                var tr = (TabBarRenderer)Renderer;
                var trillNumberGlyph = new NoteNumberGlyph(0, 0, trillNote, true);
                var l = n.Beat.Voice.Bar.Track.Tuning.Count - n.String;
                trillNumberGlyph.Y = tr.GetTabY(l);

                AddGlyph(trillNumberGlyph);
            }

            if (n.HasBend && n.Beat.GraceType != GraceType.None)
            {
                var bendHeight = (int)(60 * Scale);
                Renderer.RegisterOverflowTop(bendHeight);
                AddGlyph(new BendGlyph(n, (int)(BeatDurationWidth * Scale), bendHeight));
            }
        }
    }
}
