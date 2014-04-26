using System.Runtime.CompilerServices;
using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Staves;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// This glyph acts as container for handling
    /// multiple voice rendering
    /// </summary>
    public class VoiceContainerGlyph : GlyphGroup, ISupportsFinalize
    {
        public const string KeySizeBeat = "Beat";

        [IntrinsicProperty]
        public FastList<BeatContainerGlyph> BeatGlyphs { get; set; }
        [IntrinsicProperty]
        public int VoiceIndex { get; set; }

        public VoiceContainerGlyph(int x, int y, int voiceIndex)
            : base(x, y)
        {
            BeatGlyphs = new FastList<BeatContainerGlyph>();
            VoiceIndex = voiceIndex;
        }

        public override void ApplyGlyphSpacing(int spacing)
        {
            var glyphSpacing = spacing / BeatGlyphs.Count;
            var gx = 0.0;
            for (int i = 0; i < BeatGlyphs.Count; i++)
            {
                var g = BeatGlyphs[i];
                g.X = (int)(gx);
                gx += g.Width + glyphSpacing;
                g.ApplyGlyphSpacing(glyphSpacing);
            }
            Width = (int)(gx);
        }

        public void RegisterMaxSizes(BarSizeInfo sizes)
        {
            for (int i = 0; i < BeatGlyphs.Count; i++)
            {
                var b = BeatGlyphs[i];
                b.RegisterMaxSizes(sizes);
            }
        }

        public void ApplySizes(BarSizeInfo sizes)
        {
            Width = 0;
            for (int i = 0; i < BeatGlyphs.Count; i++)
            {
                BeatGlyphs[i].X = (i == 0) ? 0 : BeatGlyphs[i - 1].X + BeatGlyphs[i - 1].Width;
                BeatGlyphs[i].ApplySizes(sizes);
            }

            if (BeatGlyphs.Count > 0)
            {
                Width = BeatGlyphs[BeatGlyphs.Count - 1].X + BeatGlyphs[BeatGlyphs.Count - 1].Width;
            }
        }

        public override void AddGlyph(Glyph g)
        {
            g.X = BeatGlyphs.Count == 0
                ? 0
                : BeatGlyphs[BeatGlyphs.Count - 1].X + BeatGlyphs[BeatGlyphs.Count - 1].Width;
            g.Index = BeatGlyphs.Count;
            g.Renderer = Renderer;
            g.DoLayout();
            BeatGlyphs.Add((BeatContainerGlyph)g);
            Width = g.X + g.Width;
        }

        public override void DoLayout()
        {
        }

        public void FinalizeGlyph(ScoreLayout layout)
        {
            for (int i = 0; i < BeatGlyphs.Count; i++)
            {
                BeatGlyphs[i].FinalizeGlyph(layout);
            }
        }

        //private static Random Random = new Random();
        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            //canvas.Color = new Color((byte) Random.Next(255), (byte) Random.Next(255), (byte) Random.Next(255), 128);
            //canvas.FillRect(cx + X, cy + Y, Width, 100);
            for (int i = 0; i < BeatGlyphs.Count; i++)
            {
                BeatGlyphs[i].Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
