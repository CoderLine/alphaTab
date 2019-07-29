using System;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    internal class BeatGlyphBase : GlyphGroup
    {
        public BeatContainerGlyph Container { get; set; }

        public BeatGlyphBase()
            : base(0, 0)
        {
        }

        public override void DoLayout()
        {
            // left to right layout
            var w = 0f;
            if (Glyphs != null)
            {
                for (int i = 0, j = Glyphs.Count; i < j; i++)
                {
                    var g = Glyphs[i];
                    g.X = w;
                    g.Renderer = Renderer;
                    g.DoLayout();
                    w += g.Width;
                }
            }

            Width = w;
        }

        protected void NoteLoop(Action<Note> action)
        {
            for (var i = Container.Beat.Notes.Count - 1; i >= 0; i--)
            {
                action(Container.Beat.Notes[i]);
            }
        }
    }
}
