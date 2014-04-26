using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Staves;

namespace AlphaTab.Rendering
{
    /// <summary>
    /// This bar renderer can render repeat endings.
    /// </summary>
    public class AlternateEndingsBarRenderer : BarRendererBase
    {
        private const int Padding = 3;

        private readonly FastList<int> _endings;
        private string _endingsString;

        public AlternateEndingsBarRenderer(Bar bar)
            : base(bar)
        {
            var alternateEndings = Bar.MasterBar.AlternateEndings;
            _endings = new FastList<int>();
            for (int i = 0; i < MasterBar.MaxAlternateEndings; i++)
            {
                if ((alternateEndings & (0x01 << i)) != 0)
                {
                    _endings.Add(i);
                }
            }
        }

        public override void FinalizeRenderer(ScoreLayout layout)
        {
            base.FinalizeRenderer(layout);
            IsEmpty = _endings.Count == 0;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            if (Index == 0)
            {
                Stave.TopSpacing = 5;
                Stave.BottomSpacing = 4;
            }
            Height = (int)(Resources.WordsFont.Size);

            var endingsStrings = new StringBuilder();
            for (int i = 0; i < _endings.Count; i++)
            {
                endingsStrings.Append(_endings[i] + 1);
                endingsStrings.Append(". ");
            }
            _endingsString = endingsStrings.ToString();
        }

        public override int TopPadding
        {
            get { return 0; }
        }

        public override int BottomPadding
        {
            get { return 0; }
        }

        public override void ApplySizes(BarSizeInfo sizes)
        {
            base.ApplySizes(sizes);
            Width = sizes.FullWidth;
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            if (_endings.Count > 0)
            {
                var res = Resources;
                canvas.Font = res.WordsFont;
                canvas.MoveTo(cx + X, cy + Y + Height);
                canvas.LineTo(cx + X, cy + Y);
                canvas.LineTo(cx + X + Width, cy + Y);
                canvas.Stroke();

                canvas.FillText(_endingsString, cx + X + Padding * Scale, cy + Y * Scale);
            }
        }
    }
}
