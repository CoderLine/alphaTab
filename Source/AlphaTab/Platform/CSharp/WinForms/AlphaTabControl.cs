using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Windows.Forms;
using AlphaTab.Model;
using AlphaTab.Rendering;

namespace AlphaTab.Platform.CSharp.WinForms
{
    public class AlphaTabControl : Control
    {
        private readonly ScoreRenderer _renderer;
        private Track _track;
        private Settings _settings;
        private Bitmap _bitmap;

        public Track Track
        {
            get { return _track; }
            set
            {
                _track = value;
                InvalidateTrack();
            }
        }

        public Settings Settings
        {
            get { return _settings; }
            private set
            {
                _settings = value;
                InvalidateTrack();
            }
        }

        public AlphaTabControl()
        {
            SetStyle(ControlStyles.UserPaint, true);
            SetStyle(ControlStyles.AllPaintingInWmPaint, true);
            SetStyle(ControlStyles.ContainerControl, true);
            SetStyle(ControlStyles.OptimizedDoubleBuffer, true);
            SetStyle(ControlStyles.ResizeRedraw, true);

            var settings = Settings.Defaults;
            settings.Engine = "gdi";
            Settings = settings;
            _renderer = new ScoreRenderer(settings, this);
            _renderer.RenderFinished += OnRenderFinished;
        }

        public void InvalidateTrack()
        {
            if (Track == null) return;
            _renderer.Render(Track);
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            e.Graphics.InterpolationMode = InterpolationMode.NearestNeighbor;
            e.Graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
            e.Graphics.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;

            if (_bitmap != null)
            {
                e.Graphics.DrawImage(_bitmap, new Rectangle(Point.Empty, _bitmap.Size),
                    new Rectangle(Point.Empty, _bitmap.Size), GraphicsUnit.Pixel);
            }
        }

        #region RenderFinished

        public event EventHandler RenderFinished;
        protected virtual void OnRenderFinished()
        {
            _bitmap = ((GdiCanvas) _renderer.Canvas).Image;
            Size = _bitmap.Size;

            EventHandler handler = RenderFinished;
            if (handler != null) handler(this, EventArgs.Empty);
        }

        #endregion

    }
}
