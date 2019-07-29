using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    class TabRestGlyph : MusicFontGlyph
    {
        private readonly bool _isVisibleRest;
        private readonly Duration _duration;

        public BeamingHelper BeamingHelper { get; set; }

        public TabRestGlyph(float x, float y, bool isVisibleRest, Duration duration)
            : base(x, y, 1, ScoreRestGlyph.GetSymbol(duration))
        {
            _isVisibleRest = isVisibleRest;
            _duration = duration;
        }

        public override void DoLayout()
        {
            if (_isVisibleRest)
            {
                Width = ScoreRestGlyph.GetSize(_duration) * Scale;
            }
            else
            {
                Width = 10 * Scale;
            }
        }

        public void UpdateBeamingHelper(float cx)
        {
            if (BeamingHelper != null && BeamingHelper.IsPositionFrom(TabBarRenderer.StaffId, Beat))
            {
                BeamingHelper.RegisterBeatLineX(TabBarRenderer.StaffId, Beat, cx + X + Width, cx + X);
            }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (_isVisibleRest)
            {
                base.Paint(cx, cy, canvas);
            }
        }
    }
}