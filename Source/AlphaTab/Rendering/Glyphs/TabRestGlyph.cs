using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabRestGlyph : SpacingGlyph
    {
        public Beat Beat { get; set; }
        public BeamingHelper BeamingHelper { get; set; }

        public TabRestGlyph()
            : base(0, 0, 0)
        {
        }

        public override void DoLayout()
        {
            Width = 10 * Scale;
        }

        public void UpdateBeamingHelper(float cx)
        {
            if (BeamingHelper != null)
            {
                BeamingHelper.RegisterBeatLineX(Beat, cx + X + Width / 2, cx + X + Width / 2);
            }
        }
    }
}