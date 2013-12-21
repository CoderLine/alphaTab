/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Windows;
using System.Windows.Forms;
using alphatab;
using alphatab.model;
using alphatab.platform.cs;
using alphatab.rendering;
using AlphaTab.Utils;
using Point = System.Drawing.Point;

namespace AlphaTab.Gdi
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

            var settings = Settings.defaults();
            settings.engine = "gdi";
            Settings = settings;
            _renderer = new ScoreRenderer(settings, this);
            _renderer.addRenderFinishedListener(new ActionFunction(OnRenderFinished));
        }

        public void InvalidateTrack()
        {
            if (Track == null) return;
            _renderer.render(Track);
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
            _bitmap = ((GdiCanvas) _renderer.canvas).getImage();
            Size = _bitmap.Size;

            EventHandler handler = RenderFinished;
            if (handler != null) handler(this, EventArgs.Empty);
        }

        #endregion

    }
}
