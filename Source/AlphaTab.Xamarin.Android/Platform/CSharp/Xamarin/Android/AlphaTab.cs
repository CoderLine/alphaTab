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
using System.Linq;
using System.Threading.Tasks;
using AlphaTab.Model;
using AlphaTab.Rendering;
using Android.App;
using Android.Bluetooth;
using Android.Content;
using Android.Graphics;
using Android.Util;
using Android.Widget;
using SkiaSharp;

namespace AlphaTab.Platform.CSharp.Xamarin.Android
{
    public class AlphaTab : ScrollView
    {
        private AlphaTabLayout _contentLayout;
        private bool _initialRenderCompleted;
        private bool _isRendering;
        private bool _redrawPending;
        private float _displayDensity;

        public IEnumerable<Track> Tracks
        {
            get { return _tracks; }
            set
            {
                if (_tracks == value) return;
                _tracks = value;
                InvalidateTracks();
            }
        }

        private ScoreRenderer _renderer;
        private IEnumerable<Track> _tracks;

        public AlphaTab(Context context)
            : base(context)
        {
            Initialize(context);
        }

        public AlphaTab(Context context, IAttributeSet attrs) 
            : base(context, attrs)
        {
            Initialize(context);
        }

        private void Initialize(Context context)
        {
            using (var metrics = context.Resources.DisplayMetrics)
            {
                _displayDensity = metrics.Density;
            }

            _contentLayout = new AlphaTabLayout(context);
            AddView(_contentLayout);

            var settings = Settings.Defaults;
            settings.Engine = "skia";
            settings.Width = 970;
            settings.Scale = 0.8f;
            settings.StretchForce = 0.8f;

            _renderer = new ScoreRenderer(settings);
            _renderer.PreRender += result =>
            {
                lock (this)
                {
                    Post(() =>
                    {
                        ClearPartialResults();
                        AddPartialResult(result);
                    });
                }
            };
            _renderer.PartialRenderFinished += result =>
            {
                lock (this)
                {
                    Post(() =>
                    {
                        AddPartialResult(result);
                    });
                }
            };
            _renderer.RenderFinished += result =>
            {
                Post(() =>
                {
                    _initialRenderCompleted = true;
                    _isRendering = false;
                    if (_redrawPending)
                    {
                        Resize((int)Width);
                    }
                    OnRenderFinished(result);
                });
            };
        }

        private void ClearPartialResults()
        {
            var childCount = _contentLayout.ChildCount;
            while(childCount > 0)
            {
                var child = _contentLayout.GetChildAt(0);
                var imageView = child as ImageView;
                if (imageView != null)
                {
                    var image = imageView.Drawable;
                    imageView.SetImageResource(0);
                    image.Dispose();
                    imageView.DestroyDrawingCache();
                }

                _contentLayout.RemoveView(child);
                child.Dispose();

                childCount--;
            }
            _contentLayout.RemoveAllViews();
        }

        private void AddPartialResult(RenderFinishedEventArgs result)
        {
            lock (this)
            {
                _contentLayout.SetMinimumWidth((int)(result.TotalWidth * _displayDensity));
                _contentLayout.SetMinimumHeight((int)(result.TotalHeight * _displayDensity));

                if (result.RenderResult != null)
                {
                    using (var image = (SKImage)result.RenderResult)
                    {
                        byte[] imageBytes;
                        using (var data = image.Encode(SKEncodedImageFormat.Png, 100))
                        {
                            imageBytes = data.ToArray();
                        }

                        var view = new ImageView(Context);
                        view.SetMinimumWidth((int)(result.Width * _displayDensity));
                        view.SetMinimumHeight((int)(result.Height * _displayDensity));
                        view.SetMaxWidth((int)(result.Width * _displayDensity));
                        view.SetMaxHeight((int)(result.Width * _displayDensity));
                        view.SetImageBitmap(BitmapFactory.DecodeByteArray(imageBytes, 0, imageBytes.Length));

                        _contentLayout.AddView(view);
                    }
                }
            }
        }

        private void InvalidateTracks()
        {
            if (Tracks == null) return;

            if (Width > 0)
            {
                _renderer.Settings.Width = (int)(Width / _displayDensity);
                _initialRenderCompleted = false;
                _isRendering = true;
                var tracks = Tracks.ToArray();
                Task.Factory.StartNew(() =>
                {
                    _renderer.RenderMultiple(tracks);
                });
            }
            else
            {
                _initialRenderCompleted = false;
                _redrawPending = true;
            }
        }

        protected override void OnSizeChanged(int w, int h, int oldw, int oldh)
        {
            Resize(w);
            base.OnSizeChanged(w, h, oldw, oldh);
        }

        private void Resize(int width)
        {
            if (_isRendering)
            {
                _redrawPending = true;
            }
            else if (width > 0)
            {
                _redrawPending = false;

                if (!_initialRenderCompleted)
                {
                    InvalidateTracks();
                }
                else
                {
                    if (width != _renderer.Settings.Width)
                    {
                        _renderer.Settings.Width = (int)(width / _displayDensity);
                        _isRendering = true;
                        Task.Factory.StartNew(() =>
                        {
                            _renderer.Resize(width);
                        });
                    }
                }
            }
        }

        public event EventHandler<RenderFinishedEventArgs> RenderFinished;
        protected virtual void OnRenderFinished(RenderFinishedEventArgs e)
        {
            RenderFinished?.Invoke(this, e);
        }
    }
}
