using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using AlphaTab.Model;
using Color = System.Drawing.Color;

namespace AlphaTab.Samples.WinForms
{
    internal class TrackBarsControl : Control
    {
        private static readonly Size BlockSize = new Size(25, 25);
        private readonly bool[] _usedBars;
        private Color _startColor;
        private Color _endColor;

        public TrackBarsControl(Track track)
        {
            SetStyle(ControlStyles.FixedHeight, true);
            SetStyle(ControlStyles.DoubleBuffer, true);
            SetStyle(ControlStyles.OptimizedDoubleBuffer, true);
            SetStyle(ControlStyles.ResizeRedraw, true);
            SetStyle(ControlStyles.UserPaint, true);
            base.DoubleBuffered = true;
            base.BackColor = Color.FromArgb(93, 95, 94);

            _usedBars = new bool[(int) track.Score.MasterBars.Count];
            for (var s = 0; s < track.Staves.Count; s++)
            {
                var staff = track.Staves[s];
                for (var barI = 0; barI < staff.Bars.Count; barI++)
                {
                    var bar = staff.Bars[barI];
                    _usedBars[barI] = false;

                    for (var voiceI = 0; voiceI < bar.Voices.Count && (!_usedBars[barI]); voiceI++)
                    {
                        var voice = bar.Voices[voiceI];
                        for (var i = 0; i < voice.Beats.Count; i++)
                        {
                            var b = voice.Beats[i];
                            if (!b.IsRest)
                            {
                                _usedBars[barI] = true;
                            }
                        }
                    }
                }
            }

            PerformLayout();
            Width = BlockSize.Width * _usedBars.Length;
            Height = BlockSize.Height;
            MinimumSize = BlockSize;

            SetColor(track.Color);
        }

        private void SetColor(Model.Color color)
        {
            var baseColor = Color.FromArgb((byte) color.R, (byte) color.G, (byte) color.B);
            double h, s, l;
            ColorTools.RGB2HSL(baseColor, out h, out s, out l);

            _startColor = ColorTools.HSL2RGB(h, System.Math.Max(0, System.Math.Min(1, s - 0.2)),
                System.Math.Max(0, System.Math.Min(1, l + 0.2)));
            _endColor = ColorTools.HSL2RGB(h, System.Math.Max(0, System.Math.Min(1, s - 0.2)),
                System.Math.Max(0, System.Math.Min(1, l - 0.2)));
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            if (_usedBars == null)
            {
                return;
            }

            using (var brush = new LinearGradientBrush(DisplayRectangle, _startColor, _endColor,
                LinearGradientMode.Vertical))
            {
                e.Graphics.FillRectangle(brush,
                    new Rectangle(0, 0, _usedBars.Length * BlockSize.Width, BlockSize.Height));
            }

            using (var pen = new Pen(Color.FromArgb(75, 255, 255, 255)))
            {
                for (var i = 0; i < _usedBars.Length; i++)
                {
                    e.Graphics.DrawLine(pen, (i + 1) * BlockSize.Width, 0,
                        (i + 1) * BlockSize.Width, BlockSize.Height);
                }

                pen.Color = Color.FromArgb(51, 51, 51);
                e.Graphics.DrawLine(pen, 0, Height - 1, _usedBars.Length * BlockSize.Width,
                    Height - 1);
            }
        }
    }
}
