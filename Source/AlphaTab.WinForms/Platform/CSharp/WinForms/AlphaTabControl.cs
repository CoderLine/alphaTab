/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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
using System.Collections.Specialized;
using System.ComponentModel;
using System.Drawing;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using AlphaTab.Model;
using AlphaTab.Rendering;

namespace AlphaTab.Platform.CSharp.WinForms
{
    public class AlphaTabControl : Panel, INotifyPropertyChanged
    {
        private bool _initialRenderCompleted;
        private bool _redrawPending;
        private int _isRendering; // interlocked bool
        private IEnumerable<Track> _tracks;
        private float _scale;
        private int _scoreWidth;
        private string _layoutMode;
        private float _stretchForce;
        private string _stavesMode;
        private float _actualScoreHeight;
        private float _actualScoreWidth;
        private string _renderEngine;
        private int _totalResultCount;

        private AlphaTabLayoutPanel _layoutPanel;

        [Browsable(false)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public IEnumerable<Track> Tracks
        {
            get { return _tracks; }
            set
            {
                if (_tracks == value) return;

                var observable = _tracks as INotifyCollectionChanged;
                if (observable != null)
                {
                    observable.CollectionChanged -= OnTracksChanged;
                }

                _tracks = value;

                observable = _tracks as INotifyCollectionChanged;
                if (observable != null)
                {
                    observable.CollectionChanged += OnTracksChanged;
                }

                OnPropertyChanged();
                InvalidateTracks(true);
            }
        }

        [DefaultValue(1f)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Visible)]
        public float Scale
        {
            get { return _scale; }
            set
            {
                if (value.Equals(_scale)) return;
                _scale = value;
                OnPropertyChanged();
                InvalidateTracks(true);
            }
        }

        [DefaultValue(-1)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Visible)]
        public int ScoreWidth
        {
            get { return _scoreWidth; }
            set
            {
                if (value == _scoreWidth) return;
                _scoreWidth = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(ScoreAutoSize));
                InvalidateTracks(true);

            }
        }

        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public bool ScoreAutoSize
        {
            get { return ScoreWidth < 0; }
        }

        [DefaultValue("page")]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Visible)]
        public string LayoutMode
        {
            get { return _layoutMode; }
            set
            {
                if (value == _layoutMode) return;
                _layoutMode = value;
                OnPropertyChanged();
                InvalidateTracks(true);
            }
        }

        [DefaultValue(1f)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Visible)]
        public float StretchForce
        {
            get { return _stretchForce; }
            set
            {
                if (value.Equals(_stretchForce)) return;
                _stretchForce = value;
                OnPropertyChanged();
                InvalidateTracks(true);
            }
        }

        [DefaultValue("score-tab")]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Visible)]
        public string StavesMode
        {
            get { return _stavesMode; }
            set
            {
                if (value == _stavesMode) return;
                _stavesMode = value;
                OnPropertyChanged();
                InvalidateTracks(true);
            }
        }

        [Browsable(false)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public float ActualScoreHeight
        {
            get { return _actualScoreHeight; }
            private set
            {
                if (value.Equals(_actualScoreHeight)) return;
                _actualScoreHeight = value;
                OnPropertyChanged();
            }
        }

        [Browsable(false)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public float ActualScoreWidth
        {
            get { return _actualScoreWidth; }
            private set
            {
                if (value.Equals(_actualScoreWidth)) return;
                _actualScoreWidth = value;
                OnPropertyChanged();
            }
        }

        [DefaultValue("gdi")]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Visible)]
        public string RenderEngine
        {
            get { return _renderEngine; }
            set
            {
                if (value == _renderEngine) return;
                _renderEngine = value;
                OnPropertyChanged();
                InvalidateTracks(true);
            }
        }

        [Browsable(false)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
        public ScoreRenderer Renderer { get; private set; }

        public AlphaTabControl()
        {
            _layoutPanel = new AlphaTabLayoutPanel();
            AutoScroll = true;
            Controls.Add(_layoutPanel);

            var settings = Settings.Defaults;
            settings.Engine = "gdi";
            _scale = settings.Scale;
            _scoreWidth = settings.Width;
            _layoutMode = settings.Layout.Mode;
            _stretchForce = settings.StretchForce;
            _stavesMode = settings.Staves.Id;
            _renderEngine = settings.Engine;

            Renderer = new ScoreRenderer(settings);
            Renderer.PreRender += result =>
            {
                BeginInvoke(new Action(() =>
                {
                    _layoutPanel.SuspendLayout();
                    while (_layoutPanel.HasChildren)
                    {
                        var child = _layoutPanel.Controls[0] as PictureBox;
                        if (child != null)
                        {
                            _layoutPanel.Controls.Remove(child);
                            child.Image.Dispose();
                        }
                    }
                    _layoutPanel.ResumeLayout(true);
                    GC.Collect();

                    AddPartialResult(result);
                }));
            };
            Renderer.PartialRenderFinished += result =>
            {
                BeginInvoke(new Action(() =>
                {
                    AddPartialResult(result);
                }));
            };
            Renderer.RenderFinished += result =>
            {
                BeginInvoke(new Action(() =>
                {
                    _initialRenderCompleted = true;
                    _isRendering = 0;
                    AddPartialResult(result);
                    OnRenderFinished();
                    if (_redrawPending)
                    {
                        ResizeTrack(RenderWidth);
                    }
                    GC.Collect();
                }));
            };
        }

        protected override void OnPaddingChanged(EventArgs e)
        {
            base.OnPaddingChanged(e);
            if (_layoutPanel != null)
            {
                _layoutPanel.Location = new Point(Padding.Left, Padding.Top);
            }
        }

        protected override void OnControlAdded(ControlEventArgs e)
        {
            base.OnControlAdded(e);
            if (e.Control != _layoutPanel)
            {
                Controls.Remove(e.Control);
            }
        }

        protected override void OnForeColorChanged(EventArgs e)
        {
            base.OnForeColorChanged(e);
            if (_layoutPanel != null)
            {
                _layoutPanel.BackColor = ForeColor;
            }
        }

        private void OnTracksChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            InvalidateTracks(true);
        }

        public void InvalidateTracks(bool force)
        {
            var trackArray = Tracks?.ToArray();
            if (trackArray == null || trackArray.Length == 0) return;

            var width = RenderWidth - Padding.Horizontal;
            if (width > 0)
            {
                if (trackArray == Renderer.Tracks && !force)
                {
                    return;
                }

                var settings = Renderer.Settings;
                settings.Width = width;
                settings.Engine = RenderEngine;
                settings.Scale = Scale;
                settings.Layout.Mode = LayoutMode;
                settings.StretchForce = StretchForce;
                settings.Staves.Id = StavesMode;
                Renderer.UpdateSettings(settings);
                ModelUtils.ApplyPitchOffsets(settings, trackArray[0].Score);

                _initialRenderCompleted = false;
                _isRendering = 1;

                Task.Factory.StartNew(() =>
                {
                    Renderer.Render(trackArray[0].Score, trackArray.Select(t=>t.Index).ToArray());
                });
            }
            else
            {
                _initialRenderCompleted = false;
                _redrawPending = true;
                _isRendering = 0;
            }
        }

        private int RenderWidth
        {
            get
            {
                return (int)(ScoreAutoSize ? ClientRectangle.Width : ScoreWidth);
            }
        }

        protected override void OnClientSizeChanged(EventArgs e)
        {
            base.OnClientSizeChanged(e);
            if (ScoreAutoSize)
            {
                ResizeTrack(RenderWidth);
            }
        }


        private void ResizeTrack(double width)
        {
            int newWidth = (int)width -  Padding.Horizontal;
            if (Interlocked.Exchange(ref _isRendering, 1) == 1)
            {
                _redrawPending = true;
            }
            else if (width > 0)
            {
                _redrawPending = false;
                if (!_initialRenderCompleted)
                {
                    InvalidateTracks(true);
                }
                else if (newWidth != Renderer.Settings.Width)
                {
                    Task.Factory.StartNew(() =>
                    {
                        Renderer.Resize(newWidth);
                    });
                }
                else
                {
                    _isRendering = 0;
                }
            }
        }

        private void AddPartialResult(RenderFinishedEventArgs result)
        {
            ActualScoreWidth = result.TotalWidth;
            ActualScoreHeight = result.TotalHeight;
            _layoutPanel.Width = (int)result.TotalWidth;
            _layoutPanel.Height = (int)result.TotalHeight;
            if (result.RenderResult != null)
            {
                var bitmap = result.RenderResult as Bitmap;
                if (bitmap == null)
                {
                    using (result.RenderResult as IDisposable)
                    {
                        bitmap = SkiaUtil.ToBitmap(result.RenderResult);
                    }
                }

                var pic = new PictureBox
                {
                    AutoSize = false,
                    BackColor = ForeColor,
                    Width = (int) result.Width,
                    Height = (int) result.Height,
                    Image = bitmap,
                    Padding = Padding.Empty,
                    Margin = Padding.Empty,
                    BorderStyle = BorderStyle.None
                };
                _layoutPanel.Controls.Add(pic);
            }
        }

        public event EventHandler RenderFinished;
        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected virtual void OnRenderFinished()
        {
            RenderFinished?.Invoke(this, EventArgs.Empty);
        }
    }
}