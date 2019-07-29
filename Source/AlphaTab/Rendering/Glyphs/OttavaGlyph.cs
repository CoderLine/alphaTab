using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class OttavaGlyph : GroupedEffectGlyph
    {
        private Ottavia _ottava;
        private bool _aboveStaff;

        public OttavaGlyph(Ottavia ottava, bool aboveStaff)
            : base(BeatXPosition.PostNotes)
        {
            _ottava = ottava;
            _aboveStaff = aboveStaff;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 13 * Scale;
        }

        protected override void PaintNonGrouped(float cx, float cy, ICanvas canvas)
        {
            PaintOttava(cx, cy, canvas);
        }

        private float PaintOttava(float cx, float cy, ICanvas canvas)
        {
            float size = 0;
            switch (_ottava)
            {
                case Ottavia._15ma:
                    size = 37 * Scale;
                    canvas.FillMusicFontSymbol(cx + X - size / 2, cy + Y + Height, 0.8f, MusicFontSymbol.Ottava15ma);
                    break;
                case Ottavia._8va:
                    size = 26 * Scale;
                    canvas.FillMusicFontSymbol(cx + X - size / 2, cy + Y + Height, 0.8f, MusicFontSymbol.Ottava8va);
                    break;
                case Ottavia._8vb:
                    size = 23 * Scale;
                    canvas.FillMusicFontSymbol(cx + X - size / 2, cy + Y + Height, 0.8f, MusicFontSymbol.Ottava8vb);
                    break;
                case Ottavia._15mb:
                    size = 36 * Scale;
                    // NOTE: SMUFL does not have a glyph for 15mb so we build it
                    canvas.FillMusicFontSymbols(cx + X - size / 2,
                        cy + Y + Height,
                        0.8f,
                        new[]
                        {
                            MusicFontSymbol.Ottava15, MusicFontSymbol.OttavaMBaseline, MusicFontSymbol.OttavaBBaseline
                        });
                    break;
            }

            return size / 2;
        }

        protected override void PaintGrouped(float cx, float cy, float endX, ICanvas canvas)
        {
            var size = PaintOttava(cx, cy, canvas);

            var lineSpacing = LineRangedGlyph.LineSpacing * Scale;
            var startX = cx + X + size + lineSpacing;
            var lineY = cy + Y;
            lineY += _aboveStaff ? 2 * Scale : Height - 2 * Scale;

            var lineSize = LineRangedGlyph.LineSize * Scale;


            if (endX > startX)
            {
                var lineX = startX;
                while (lineX < endX)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(lineX, (int)lineY);
                    canvas.LineTo(Math.Min(lineX + lineSize, endX), (int)lineY);
                    lineX += lineSize + lineSpacing;
                    canvas.Stroke();
                }

                canvas.BeginPath();
                if (_aboveStaff)
                {
                    canvas.MoveTo(endX, lineY);
                    canvas.LineTo(endX, cy + Y + Height);
                }
                else
                {
                    canvas.MoveTo(endX, lineY);
                    canvas.LineTo(endX, cy + Y);
                }

                canvas.Stroke();
            }
        }
    }
}
