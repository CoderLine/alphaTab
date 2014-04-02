using System.Collections.Generic;
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

        public List<BeatContainerGlyph> BeatGlyphs { get; set; }
        public int VoiceIndex { get; set; }

        public VoiceContainerGlyph(int x = 0, int y = 0, int voiceIndex = 0)
            : base(x, y)
        {
            BeatGlyphs = new List<BeatContainerGlyph>();
            VoiceIndex = voiceIndex;
        }

        public override void ApplyGlyphSpacing(int spacing)
        {
            var glyphSpacing = spacing / BeatGlyphs.Count;
            var gx = 0.0;
            foreach (var g in BeatGlyphs)
            {
                g.X = (int)(gx);
                gx += g.Width + glyphSpacing;
                g.ApplyGlyphSpacing(glyphSpacing);
            }
            Width = (int)(gx);
        }

        public void RegisterMaxSizes(BarSizeInfo sizes)
        {
            foreach (var b in BeatGlyphs)
            {
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
            foreach (var b in BeatGlyphs)
            {
                b.FinalizeGlyph(layout);
            }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            foreach (var g in BeatGlyphs)
            {
                g.Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
