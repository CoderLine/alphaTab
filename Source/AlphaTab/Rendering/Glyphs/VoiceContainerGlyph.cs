using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Staves;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// This glyph acts as container for handling
    /// multiple voice rendering
    /// </summary>
    internal class VoiceContainerGlyph : GlyphGroup
    {
        public const string KeySizeBeat = "Beat";

        public FastList<BeatContainerGlyph> BeatGlyphs { get; set; }

        public Voice Voice { get; set; }
        public float MinWidth { get; set; }

        public FastList<TupletGroup> TupletGroups { get; set; }

        public VoiceContainerGlyph(float x, float y, Voice voice)
            : base(x, y)
        {
            Voice = voice;
            BeatGlyphs = new FastList<BeatContainerGlyph>();
            TupletGroups = new FastList<TupletGroup>();
        }

        public void ScaleToWidth(float width)
        {
            var force = Renderer.LayoutingInfo.SpaceToForce(width);
            ScaleToForce(force);
        }

        private void ScaleToForce(float force)
        {
            Width = Renderer.LayoutingInfo.CalculateVoiceWidth(force);
            var positions = Renderer.LayoutingInfo.BuildOnTimePositions(force);
            var beatGlyphs = BeatGlyphs;
            for (int i = 0, j = beatGlyphs.Count; i < j; i++)
            {
                var currentBeatGlyph = beatGlyphs[i];
                var time = currentBeatGlyph.Beat.AbsoluteDisplayStart;
                currentBeatGlyph.X = positions[time] - currentBeatGlyph.OnTimeX;

                // size always previousl glyph after we know the position
                // of the next glyph
                if (i > 0)
                {
                    var beatWidth = currentBeatGlyph.X - beatGlyphs[i - 1].X;
                    beatGlyphs[i - 1].ScaleToWidth(beatWidth);
                }

                // for the last glyph size based on the full width
                if (i == j - 1)
                {
                    var beatWidth = Width - beatGlyphs[beatGlyphs.Count - 1].X;
                    currentBeatGlyph.ScaleToWidth(beatWidth);
                }
            }
        }

        public void RegisterLayoutingInfo(BarLayoutingInfo info)
        {
            info.UpdateVoiceSize(Width);
            var beatGlyphs = BeatGlyphs;
            foreach (var b in beatGlyphs)
            {
                b.RegisterLayoutingInfo(info);
            }
        }

        public void ApplyLayoutingInfo(BarLayoutingInfo info)
        {
            var beatGlyphs = BeatGlyphs;
            foreach (var b in beatGlyphs)
            {
                b.ApplyLayoutingInfo(info);
            }

            ScaleToForce(Math.Max(Renderer.Settings.Display.StretchForce, info.MinStretchForce));
        }

        public override void AddGlyph(Glyph g)
        {
            var bg = (BeatContainerGlyph)g;
            g.X = BeatGlyphs.Count == 0
                ? 0
                : BeatGlyphs[BeatGlyphs.Count - 1].X + BeatGlyphs[BeatGlyphs.Count - 1].Width;
            g.Renderer = Renderer;
            g.DoLayout();
            BeatGlyphs.Add(bg);
            Width = g.X + g.Width;
            if (bg.Beat.HasTuplet && bg.Beat.TupletGroup.Beats[0].Id == bg.Beat.Id)
            {
                TupletGroups.Add(bg.Beat.TupletGroup);
            }
        }

        public override void DoLayout()
        {
            MinWidth = Width;
        }

        //private static Random Random = new Random();
        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            //canvas.Color = Color.Random();
            //canvas.StrokeRect(cx + X, cy + Y, Width, 100);

            //if (Voice.Index == 0)
            //{
            //    PaintSprings(cx + X, cy + Y, canvas);
            //}
            canvas.Color = Voice.Index == 0
                ? Renderer.Resources.MainGlyphColor
                : Renderer.Resources.SecondaryGlyphColor;

            for (int i = 0, j = BeatGlyphs.Count; i < j; i++)
            {
                BeatGlyphs[i].Paint(cx + X, cy + Y, canvas);
            }
        }

        //private void PaintSprings(float x, float y, ICanvas canvas)
        //{
        //    y += 40;

        //    var force = Renderer.LayoutingInfo.SpaceToForce(Width);

        //    var positions = Renderer.LayoutingInfo.BuildOnTimePositions(force);
        //    canvas.Color = new Color(255, 0, 0);

        //    foreach (var time in positions)
        //    {
        //        var springX = positions[time];
        //        var spring = Renderer.LayoutingInfo.Springs[time];

        //        canvas.BeginPath();
        //        canvas.MoveTo(x + springX, y);
        //        canvas.LineTo(x + springX, y + 10);
        //        canvas.Stroke();

        //        canvas.BeginPath();
        //        canvas.MoveTo(x + springX, y + 5);
        //        canvas.LineTo(x + springX + Renderer.LayoutingInfo.CalculateWidth(force, spring.SpringConstant), y + 5);
        //        canvas.Stroke();

        //        canvas.TextAlign = TextAlign.Center;
        //        canvas.FillText(time.ToString(), x + springX, y + 10);
        //    }
        //}
    }
}
