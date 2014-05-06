using System;
using AlphaTab.Model;
using AlphaTab.Rendering.Layout;

namespace AlphaTab.Rendering.Glyphs
{
    public class BeatGlyphBase : GlyphGroup, ISupportsFinalize
    {
        public BeatContainerGlyph Container { get; set; }

        public BeatGlyphBase()
            : base(0, 0)
        {
        }

        public override void DoLayout()
        {
            // left to right layout
            var w = 0;
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
            Width = (int)(w * Renderer.Settings.Layout.Get("spacingScale", 1.0f));
        }

        protected void NoteLoop(Action<Note> action)
        {
            for (int i = Container.Beat.Notes.Count - 1; i >= 0; i--)
            {
                action(Container.Beat.Notes[i]);
            }
        }

        protected int BeatDurationWidth
        {
            get
            {
                switch (Container.Beat.Duration)
                {
                    case Duration.Whole:
                        return 103;
                    case Duration.Half:
                        return 45;
                    case Duration.Quarter:
                        return 29;
                    case Duration.Eighth:
                        return 19;
                    case Duration.Sixteenth:
                        return 11;
                    case Duration.ThirtySecond:
                        return 11;
                    case Duration.SixtyFourth:
                        return 11;
                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }
        }

        public virtual void FinalizeGlyph(ScoreLayout layout)
        {

        }
    }
}
