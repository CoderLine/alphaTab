using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabClefGlyph : Glyph
    {
        public TabClefGlyph(int x, int y) 
            : base(x, y)
        {
        }

        public override void DoLayout()
        {
            Width = (int)(28 * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            //TabBarRenderer tabBarRenderer = (TabBarRenderer)Renderer;
            var track = Renderer.Bar.Track;
            var res = Renderer.Resources;

            var startY = cy + Y + TabBarRenderer.LineSpacing * Scale * 0.6f;
            //var endY = cy + Y + tabBarRenderer.GetTabY(track.Tuning.Count, -2);

            // TODO: Find a more generic way of calculating the font size but for now this works.
            float fontScale = 1;
            float correction = 0;
            switch (track.Tuning.Count)
            {
                case 4:
                    fontScale = 0.6f;
                    break;
                case 5:
                    fontScale = 0.8f;
                    break;
                case 6:
                    fontScale = 1.1f;
                    correction = 1;
                    break;
                case 7:
                    fontScale = 1.15f;
                    break;
                case 8:
                    fontScale = 1.35f;
                    break;
            }

            var font = res.TabClefFont.Clone();
            font.Size = font.Size * fontScale;

            canvas.Font = font;
            var old = canvas.TextAlign;
            canvas.TextAlign = TextAlign.Center;

            canvas.FillText("T", cx + X + Width / 2, startY);
            canvas.FillText("A", cx + X + Width / 2, startY + font.Size - (correction * Scale));
            canvas.FillText("B", cx + X + Width / 2, startY + (font.Size - (correction * Scale)) * 2);
            canvas.TextAlign = old;
        }
    }
}
