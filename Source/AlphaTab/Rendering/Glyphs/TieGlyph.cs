using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class TieGlyph : Glyph
    {
        protected Note StartNote;
        protected Note EndNote;
        protected Glyph Parent;

        public TieGlyph(Note startNote, Note endNote, Glyph parent)
            : base(0, 0)
        {
            StartNote = startNote;
            EndNote = endNote;
            Parent = parent;
        }

        public override void DoLayout()
        {
            Width = 0;
        }

        public override bool CanScale
        {
            get { return false; }
        }

        /// <summary>
        /// paints a tie between the two given points
        /// </summary>
        /// <param name="canvas"></param>
        /// <param name="scale"></param>
        /// <param name="x1"></param>
        /// <param name="y1"></param>
        /// <param name="x2"></param>
        /// <param name="y2"></param>
        /// <param name="down"></param>
        public static void PaintTie(ICanvas canvas, float scale, float x1, float y1, float x2, float y2,
            bool down = false)
        {
            // ensure endX > startX
            if (x2 > x1)
            {
                var t = x1;
                x1 = x2;
                x2 = t;
                t = y1;
                y1 = y2;
                y2 = t;
            }
            //
            // calculate control points 
            //
            var offset = 15 * scale;
            var size = 4 * scale;
            // normal vector
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
            var centerX = (x2 + x1) / 2;
            var centerY = (y2 + y1) / 2;

            // control points
            var cp1X = centerX + (offset * normalVectorX);
            var cp1Y = centerY + (offset * normalVectorY);
            var cp2X = centerX + ((offset - size) * normalVectorX);
            var cp2Y = centerY + ((offset - size) * normalVectorY);
            canvas.BeginPath();
            canvas.MoveTo(x1, y1);
            canvas.QuadraticCurveTo(cp1X, cp1Y, x2, y2);
            canvas.QuadraticCurveTo(cp2X, cp2Y, x1, y1);
            canvas.ClosePath();
        }
    }
}
