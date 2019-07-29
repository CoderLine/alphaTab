using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    internal class BeatOnNoteGlyphBase : BeatGlyphBase
    {
        public BeamingHelper BeamingHelper { get; set; }
        public float CenterX { get; set; }

        public BeatOnNoteGlyphBase()
        {
            CenterX = 0;
        }

        public virtual void UpdateBeamingHelper()
        {
        }

        //public override void Paint(float cx, float cy, ICanvas canvas)
        //{
        //    base.Paint(cx, cy, canvas);
        //    canvas.Color = Color.Random();
        //    canvas.FillRect(cx + X, cy + Y, Width, 100);
        //}
    }
}
