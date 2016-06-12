using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class BeatOnNoteGlyphBase : BeatGlyphBase
    {
        public BeamingHelper BeamingHelper { get; set; }

        public virtual void UpdateBeamingHelper()
        {
        }

        //public override void Paint(float cx, float cy, ICanvas canvas)
        //{
        //    base.Paint(cx, cy, canvas);
        //    canvas.Color = new Color((byte)Std.Random(255), (byte)Std.Random(255), (byte)Std.Random(255), 80);
        //    canvas.FillRect(cx + X, cy + Y, Width, 100);
        //}
    }
}