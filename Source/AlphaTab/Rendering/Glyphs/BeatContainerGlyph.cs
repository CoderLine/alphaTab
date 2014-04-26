using System.Runtime.CompilerServices;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Staves;

namespace AlphaTab.Rendering.Glyphs
{
    public class BeatContainerGlyph : Glyph, ISupportsFinalize
    {
        //private static readonly int[] SizeTable = { 82, 43, 30, 22, 18, 14, 14 };

        [IntrinsicProperty]
        public Beat Beat { get; set; }
        [IntrinsicProperty]
        public BeatGlyphBase PreNotes { get; set; }
        [IntrinsicProperty]
        public BeatGlyphBase OnNotes { get; set; }
        [IntrinsicProperty]
        public BeatGlyphBase PostNotes { get; set; }
        [IntrinsicProperty]
        public FastList<Glyph> Ties { get; set; }

        public BeatContainerGlyph(Beat beat)
            : base(0, 0)
        {
            Beat = beat;
            Ties = new FastList<Glyph>();
        }

        public void FinalizeGlyph(ScoreLayout layout)
        {
            PreNotes.FinalizeGlyph(layout);
            OnNotes.FinalizeGlyph(layout);
            PostNotes.FinalizeGlyph(layout);
        }

        public void RegisterMaxSizes(BarSizeInfo sizes)
        {
            if (sizes.GetPreNoteSize(Beat.Start) < PreNotes.Width)
            {
                sizes.SetPreNoteSize(Beat.Start, PreNotes.Width);
            }
            if (sizes.GetOnNoteSize(Beat.Start) < OnNotes.Width)
            {
                sizes.SetOnNoteSize(Beat.Start, OnNotes.Width);
            }
            if (sizes.GetPostNoteSize(Beat.Start) < PostNotes.Width)
            {
                sizes.SetPostNoteSize(Beat.Start, PostNotes.Width);
            }
        }

        public void ApplySizes(BarSizeInfo sizes)
        {
            int size;
            int diff;

            size = sizes.GetPreNoteSize(Beat.Start);
            diff = size - PreNotes.Width;
            PreNotes.X = 0;
            if (diff > 0) PreNotes.ApplyGlyphSpacing(diff);

            size = sizes.GetOnNoteSize(Beat.Start);
            diff = size - OnNotes.Width;
            OnNotes.X = PreNotes.X + PreNotes.Width;
            if (diff > 0) OnNotes.ApplyGlyphSpacing(diff);

            size = sizes.GetPostNoteSize(Beat.Start);
            diff = size - PostNotes.Width;
            PostNotes.X = OnNotes.X + OnNotes.Width;
            if (diff > 0) PostNotes.ApplyGlyphSpacing(diff);

            Width = CalculateWidth();
        }

        private int CalculateWidth()
        {
#if MULTIVOICE_SUPPORT
            var index = Beat.Duration.GetIndex();
            var minIndex = Beat.Voice.Bar.MinDuration.GetValueOrDefault().GetIndex();
            var minDurationSize = SizeTable[minIndex];
            while (index < minIndex)
            {
                minDurationSize *= 2;
            }
            return minDurationSize;
#else
            return PostNotes.X + PostNotes.Width;
#endif
        }

        public override void DoLayout()
        {
            PreNotes.X = 0;
            PreNotes.Index = 0;
            PreNotes.Renderer = Renderer;
            PreNotes.Container = this;
            PreNotes.DoLayout();

            OnNotes.X = PreNotes.X + PreNotes.Width;
            OnNotes.Index = 1;
            OnNotes.Renderer = Renderer;
            OnNotes.Container = this;
            OnNotes.DoLayout();

            PostNotes.X = OnNotes.X + OnNotes.Width;
            PostNotes.Index = 2;
            PostNotes.Renderer = Renderer;
            PostNotes.Container = this;
            PostNotes.DoLayout();

            var i = Beat.Notes.Count - 1;
            while (i >= 0)
            {
                CreateTies(Beat.Notes[i--]);
            }

            Width = CalculateWidth();
        }

        protected virtual void CreateTies(Note n)
        {
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            // canvas.Color = new Color(200, 0, 0, 100);
            // canvas.FillRect(cx + x, cy + y + 15 * Beat.Voice.Index, width, 10);
            // canvas.Font = new Font("Arial", 10);
            // canvas.Color = new Color(0, 0, 0);
            // canvas.FillText(Beat.Voice.Index + ":" + Beat.Index, cx + X, cy + Y + 15 * Beat.Voice.Index);

            PreNotes.Paint(cx + X, cy + Y, canvas);
            //canvas.Color = new Color(200, 0, 0, 100);
            //canvas.FillRect(cx + X + PreNotes.X, cy + Y + PreNotes.Y, PreNotes.Width, 10);

            OnNotes.Paint(cx + X, cy + Y, canvas);
            //canvas.Color new Color(0, 200, 0, 100);
            //canvas.FillRect(cx + X + OnNotes.X, cy + Y + OnNotes.Y + 10, OnNotes.Width, 10);

            PostNotes.Paint(cx + X, cy + Y, canvas);
            //canvas.Color = new Color(0, 0, 200, 100);
            //canvas.FillRect(cx + X + PostNotes.X, cy + Y + PostNotes.Y + 20, PostNotes.Width, 10);

            for (int i = 0; i < Ties.Count; i++)
            {
                var t = Ties[i];
                t.Renderer = Renderer;
                t.Paint(cx, cy + Y, canvas);
            }
        }
    }
}
