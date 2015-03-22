/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Threading.Tasks;
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
        private List<Image> _images;

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
            _renderer.PreRender += () =>
            {
                lock (this)
                {
                    _images = new List<Image>();
                }
            };
            _renderer.PartialRenderFinished += result =>
            {
                lock (this)
                {
                    BeginInvoke(new Action(() =>
                    {
                        AddPartialResult(result);
                    }));
                }
            };
            _renderer.RenderFinished += OnRenderFinished;
        }

        private void AddPartialResult(RenderFinishedEventArgs result)
        {
            lock (this)
            {
                Width = (int)result.TotalWidth;
                Height = (int)result.TotalHeight;
                _images.Add((Image)result.RenderResult);
                Invalidate();
            }
        }

        public void InvalidateTrack()
        {
            if (Track == null) return;
            Task.Factory.StartNew(() =>
            {
                _renderer.Render(Track);
            });
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            e.Graphics.InterpolationMode = InterpolationMode.NearestNeighbor;
            e.Graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
            e.Graphics.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;

            lock (this)
            {
                if (_images == null)
                {
                    return;
                }

                int y = 0;
                foreach (var image in _images)
                {
                    e.Graphics.DrawImage(image, new Rectangle(new Point(0, y), image.Size),
                        new Rectangle(Point.Empty, image.Size), GraphicsUnit.Pixel);
                    y += image.Height;
                }
            }
        }

        #region RenderFinished

        public event EventHandler RenderFinished;
        protected virtual void OnRenderFinished(RenderFinishedEventArgs e)
        {
            EventHandler handler = RenderFinished;
            if (handler != null) handler(this, EventArgs.Empty);
        }

        #endregion

    }
}