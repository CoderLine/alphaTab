using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreHelperNotesBaseGlyph : Glyph
    {
        private const int SlurHeight = 11;
        public const int EndPadding = (NoteHeadGlyph.QuarterNoteHeadWidth / 2) + 3;
        protected FastList<BendNoteHeadGroupGlyph> _bendNoteHeads;

        public ScoreHelperNotesBaseGlyph()
            : base(0, 0)
        {
            _bendNoteHeads = new FastList<BendNoteHeadGroupGlyph>();
        }

        protected void DrawBendSlur(ICanvas canvas, float x1, float y1, float x2, float y2, bool down, float scale)
        {
            var normalVectorX = (y2 - y1);
            var normalVectorY = (x2 - x1);
            var length = (float)Math.Sqrt((normalVectorX * normalVectorX) + (normalVectorY * normalVectorY));
            if (down)
                normalVectorX *= -1;
            else
                normalVectorY *= -1;

            // make to unit vector
            normalVectorX /= length;
            normalVectorY /= length;

            // center of connection
            // TODO: should be 1/3 
            var centerX = (x2 + x1) / 2;
            var centerY = (y2 + y1) / 2;

            var offset = SlurHeight * scale;
            if (x2 - x1 < 20)
            {
                offset /= 2;
            }
            var cp1X = centerX + (offset * normalVectorX);
            var cp1Y = centerY + (offset * normalVectorY);

            canvas.BeginPath();

            canvas.MoveTo(x1, y1);
            canvas.LineTo(cp1X, cp1Y);
            canvas.LineTo(x2, y2);

            canvas.Stroke();
        }

        public override void DoLayout()
        {
            base.DoLayout();

            Width = 0;
            foreach (var noteHeads in _bendNoteHeads)
            {
                noteHeads.DoLayout();
                Width += noteHeads.Width + 10 * Scale;
            }
        }

        protected BeamDirection GetBeamDirection(Beat beat, ScoreBarRenderer noteRenderer)
        {
            // invert direction (if stems go up, ties go down to not cross them)
            switch (noteRenderer.GetBeatDirection(beat))
            {
                case BeamDirection.Up:
                    return BeamDirection.Down;
                case BeamDirection.Down:
                default:
                    return BeamDirection.Up;
            }
        }

    }
}