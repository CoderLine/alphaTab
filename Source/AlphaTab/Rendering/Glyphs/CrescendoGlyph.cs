using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class CrescendoGlyph : GroupedEffectGlyph
    {
        private const int Padding = NoteHeadGlyph.QuarterNoteHeadWidth / 2;
        private readonly CrescendoType _crescendo;

        public CrescendoGlyph(float x, float y, CrescendoType crescendo)
            : base(BeatXPosition.EndBeat)
        {
            _crescendo = crescendo;
            X = x;
            Y = y;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 17 * Scale;
        }

        protected override void PaintGrouped(float cx, float cy, float endX, ICanvas canvas)
        {
            var startX = cx + X;
            var height = Height * Scale;
            canvas.BeginPath();
            if (_crescendo == CrescendoType.Crescendo)
            {
                endX -= Padding * Scale;
                canvas.MoveTo(endX, cy + Y);
                canvas.LineTo(startX, cy + Y + height / 2);
                canvas.LineTo(endX, cy + Y + height);
            }
            else
            {
                endX -= Padding * Scale;
                canvas.MoveTo(startX, cy + Y);
                canvas.LineTo(endX, cy + Y + height / 2);
                canvas.LineTo(startX, cy + Y + height);
            }

            canvas.Stroke();
        }
    }
}
